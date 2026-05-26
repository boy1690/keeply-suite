#!/usr/bin/env node
/**
 * Workflow Tracker — 輕量 Skill 工作流追蹤器
 *
 * 追蹤進度 + 提醒下一步 + 跨 session 持久化。
 * 不強制流程順序，尊重 agent 自主性。
 *
 * 基於 Anthropic harness pattern:
 * https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
 *
 * @version 1.0.0
 * @since 2026-03-09
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '..', 'metrics', 'workflow-progress.json');
const SKILL_GRAPH_FILE = path.join(__dirname, '..', '..', 'skills', 'SKILL_GRAPH.yaml');

// --- State Management (ralph-controller pattern) ---

const DEFAULT_STATE = {
  active: false,
  workflowId: null,
  steps: [],
  startedAt: null,
  pausedAt: null,
  context: {},
  history: []
};

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return { ...DEFAULT_STATE, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) };
    }
  } catch { /* corrupted state → reset */ }
  return { ...DEFAULT_STATE };
}

function saveState(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    return true;
  } catch {
    return false;
  }
}

// --- YAML Parser (simple regex, no js-yaml dependency) ---

/**
 * Parse workflows section from SKILL_GRAPH.yaml
 * Handles the specific format:
 *   workflows:
 *     modification_flow:
 *       steps:
 *         1: { skill: x, condition: "y" }
 */
function parseWorkflows() {
  try {
    if (!fs.existsSync(SKILL_GRAPH_FILE)) return {};
    // Normalize Windows line endings
    const content = fs.readFileSync(SKILL_GRAPH_FILE, 'utf-8').replace(/\r\n/g, '\n');

    const workflows = {};
    // Match workflows: section until next top-level key
    const workflowsMatch = content.match(/^workflows:\s*\n([\s\S]*?)(?=^\w|\Z)/m);
    if (!workflowsMatch) return {};

    const section = workflowsMatch[1];
    // Find each workflow definition (2-space indent)
    const workflowBlocks = section.split(/\n  (?=\w)/);

    for (const block of workflowBlocks) {
      // Trim leading whitespace (first block may have indent from section capture)
      const trimmedBlock = block.replace(/^\s+/, '');
      const nameMatch = trimmedBlock.match(/^(\w+):/);
      if (!nameMatch) continue;

      const name = nameMatch[1];
      const descMatch = trimmedBlock.match(/description:\s*"([^"]+)"/);
      const steps = [];

      // Match step lines: N: { skill: x, condition: "y" }
      const stepRegex = /(\d+):\s*\{\s*skill:\s*([\w-]+),\s*condition:\s*"([^"]+)"\s*\}/g;
      let match;
      while ((match = stepRegex.exec(trimmedBlock)) !== null) {
        steps.push({
          index: parseInt(match[1], 10),
          skill: match[2],
          condition: match[3],
          status: 'pending'
        });
      }

      if (steps.length > 0) {
        workflows[name] = {
          description: descMatch ? descMatch[1] : '',
          steps: steps.sort((a, b) => a.index - b.index)
        };
      }
    }

    return workflows;
  } catch {
    return {};
  }
}

// --- Public API ---

/**
 * Start tracking a workflow
 * @param {string} workflowId - Key from SKILL_GRAPH.yaml workflows section
 * @param {object} context - Optional context (trigger, files, etc.)
 */
function start(workflowId, context = {}) {
  const state = loadState();
  if (state.active) {
    return { success: false, error: `Workflow ${state.workflowId} already active` };
  }

  const workflows = parseWorkflows();
  const def = workflows[workflowId];
  if (!def) {
    return { success: false, error: `Workflow '${workflowId}' not found in SKILL_GRAPH.yaml` };
  }

  const steps = def.steps.map(s => ({
    skill: s.skill,
    condition: s.condition,
    status: 'pending'
  }));
  // Mark first step as current
  if (steps.length > 0) steps[0].status = 'current';

  const newState = {
    active: true,
    workflowId,
    steps,
    startedAt: new Date().toISOString(),
    pausedAt: null,
    context,
    history: [{ action: 'started', workflowId, at: new Date().toISOString() }]
  };

  saveState(newState);
  return { success: true, workflowId, steps, currentStep: 0, totalSteps: steps.length };
}

/**
 * Mark a step as completed and advance to next
 * @param {number} stepIndex - 0-based step index
 * @param {object} result - Optional result metadata
 */
function complete(stepIndex, result = {}) {
  const state = loadState();
  if (!state.active) return { success: false, error: 'No active workflow' };
  if (stepIndex < 0 || stepIndex >= state.steps.length) return { success: false, error: 'Invalid step index' };

  state.steps[stepIndex].status = 'completed';
  state.steps[stepIndex].at = new Date().toISOString();
  state.history.push({ action: 'completed', step: stepIndex, skill: state.steps[stepIndex].skill, at: new Date().toISOString(), ...result });

  // Advance to next pending step
  const nextIndex = state.steps.findIndex((s, i) => i > stepIndex && s.status === 'pending');
  if (nextIndex >= 0) {
    state.steps[nextIndex].status = 'current';
  }

  // Check if all done
  const allDone = state.steps.every(s => s.status === 'completed' || s.status === 'skipped');
  if (allDone) {
    state.active = false;
    state.history.push({ action: 'workflow_completed', at: new Date().toISOString() });
  }

  saveState(state);

  const next = nextIndex >= 0 ? state.steps[nextIndex] : null;
  return {
    success: true,
    completed: state.steps[stepIndex].skill,
    next: next ? next.skill : null,
    progress: getProgressString(state),
    isComplete: allDone
  };
}

/**
 * Skip a step (condition not met)
 * @param {number} stepIndex - 0-based step index
 * @param {string} reason - Why the step was skipped
 */
function skip(stepIndex, reason = '') {
  const state = loadState();
  if (!state.active) return { success: false, error: 'No active workflow' };
  if (stepIndex < 0 || stepIndex >= state.steps.length) return { success: false, error: 'Invalid step index' };

  state.steps[stepIndex].status = 'skipped';
  state.steps[stepIndex].reason = reason;
  state.history.push({ action: 'skipped', step: stepIndex, skill: state.steps[stepIndex].skill, reason, at: new Date().toISOString() });

  // Advance to next pending step
  const nextIndex = state.steps.findIndex((s, i) => i > stepIndex && s.status === 'pending');
  if (nextIndex >= 0) {
    state.steps[nextIndex].status = 'current';
  }

  const allDone = state.steps.every(s => s.status === 'completed' || s.status === 'skipped');
  if (allDone) {
    state.active = false;
    state.history.push({ action: 'workflow_completed', at: new Date().toISOString() });
  }

  saveState(state);

  const next = nextIndex >= 0 ? state.steps[nextIndex] : null;
  return {
    success: true,
    skipped: state.steps[stepIndex].skill,
    next: next ? next.skill : null,
    progress: getProgressString(state)
  };
}

/**
 * Pause the workflow (called on session end)
 */
function pause() {
  const state = loadState();
  if (!state.active) return { success: false, error: 'No active workflow' };

  state.pausedAt = new Date().toISOString();
  state.history.push({ action: 'paused', at: state.pausedAt });
  saveState(state);

  return { success: true, paused: true, progress: getProgressString(state) };
}

/**
 * Resume a paused workflow (called on session start)
 */
function resume() {
  const state = loadState();
  if (!state.active) return { success: false, error: 'No active workflow' };

  state.pausedAt = null;
  state.history.push({ action: 'resumed', at: new Date().toISOString() });
  saveState(state);

  const current = state.steps.find(s => s.status === 'current');
  return {
    success: true,
    resumed: true,
    currentStep: current ? current.skill : null,
    progress: getProgressString(state)
  };
}

/**
 * Get a one-line progress hint for additionalContext injection
 * @returns {string} e.g. "[Workflow: modification_flow 3/5 — next: parallel-dev]"
 */
function getProgressHint() {
  const state = loadState();
  if (!state.active) return '';

  const current = state.steps.find(s => s.status === 'current');
  const progress = getProgressString(state);
  const skillHint = current ? current.skill : 'done';

  return `[Workflow: ${state.workflowId} ${progress} — ${current ? 'next' : 'done'}: ${skillHint}]`;
}

/**
 * Get full status
 */
function getStatus() {
  return loadState();
}

/**
 * List all available workflow definitions from SKILL_GRAPH.yaml
 */
function listWorkflows() {
  const workflows = parseWorkflows();
  return Object.entries(workflows).map(([id, def]) => ({
    id,
    description: def.description,
    stepCount: def.steps.length,
    skills: def.steps.map(s => s.skill)
  }));
}

/**
 * Cancel the current workflow
 */
function cancel() {
  const state = loadState();
  if (!state.active) return { success: false, error: 'No active workflow' };

  state.active = false;
  state.history.push({ action: 'cancelled', at: new Date().toISOString() });
  saveState(state);

  return { success: true, cancelled: state.workflowId };
}

// --- Internal Helpers ---

function getProgressString(state) {
  const done = state.steps.filter(s => s.status === 'completed' || s.status === 'skipped').length;
  return `${done}/${state.steps.length}`;
}

module.exports = {
  start,
  complete,
  skip,
  pause,
  resume,
  cancel,
  getProgressHint,
  getStatus,
  listWorkflows,
  parseWorkflows,
  STATE_FILE
};
