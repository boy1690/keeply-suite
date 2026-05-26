#!/usr/bin/env node
/**
 * Skill Metrics - Skill 效能指標收集工具
 * 追蹤每個 skill 的調用次數、成功率、執行時間
 *
 * @version 1.0.0
 * @since 2026-01-13
 * @see V55.5 自我學習基礎
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  METRICS_FILE: path.join(__dirname, '..', '..', 'metrics', 'skill-metrics.json'),
  AUTO_SAVE_INTERVAL: 5000,
  DEBUG: false,
};

const activeSessions = new Map();
let pendingUpdates = [];
let saveTimeout = null;

function loadMetrics() {
  try {
    if (fs.existsSync(CONFIG.METRICS_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG.METRICS_FILE, 'utf-8'));
    }
  } catch (error) {
    if (CONFIG.DEBUG) console.error('[skill-metrics] Load error:', error.message);
  }
  return null;
}

function saveMetrics(metrics) {
  try {
    metrics.updated_at = new Date().toISOString();
    fs.writeFileSync(CONFIG.METRICS_FILE, JSON.stringify(metrics, null, 2), 'utf-8');
  } catch (error) {
    if (CONFIG.DEBUG) console.error('[skill-metrics] Save error:', error.message);
  }
}

function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (pendingUpdates.length > 0) {
      const metrics = loadMetrics();
      if (metrics) {
        pendingUpdates.forEach((update) => update(metrics));
        pendingUpdates = [];
        updateAggregates(metrics);
        saveMetrics(metrics);
      }
    }
  }, CONFIG.AUTO_SAVE_INTERVAL);
}

function updateAggregates(metrics) {
  const skills = Object.entries(metrics.skills);
  let totalInvocations = 0, totalSuccesses = 0, totalFailures = 0;
  let mostUsed = { name: null, count: 0 };
  let leastUsed = { name: null, count: Infinity };
  let highestRate = { name: null, rate: 0 };
  let lowestRate = { name: null, rate: 1 };

  skills.forEach(([name, skill]) => {
    totalInvocations += skill.invocation_count;
    totalSuccesses += skill.success_count;
    totalFailures += skill.failure_count;

    if (skill.invocation_count > mostUsed.count) mostUsed = { name, count: skill.invocation_count };
    if (skill.invocation_count > 0 && skill.invocation_count < leastUsed.count) {
      leastUsed = { name, count: skill.invocation_count };
    }

    if (skill.invocation_count > 0) {
      const rate = skill.success_count / skill.invocation_count;
      if (rate > highestRate.rate) highestRate = { name, rate };
      if (rate < lowestRate.rate) lowestRate = { name, rate };
    }
  });

  metrics.aggregates = {
    total_invocations: totalInvocations,
    total_successes: totalSuccesses,
    total_failures: totalFailures,
    overall_success_rate: totalInvocations > 0 ? totalSuccesses / totalInvocations : 0,
    most_used_skill: mostUsed.name,
    least_used_skill: leastUsed.count === Infinity ? null : leastUsed.name,
    highest_success_rate_skill: highestRate.name,
    lowest_success_rate_skill: lowestRate.rate === 1 ? null : lowestRate.name,
  };
}

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function recordSkillStart(skillName) {
  const sessionId = generateSessionId();
  activeSessions.set(sessionId, { skillName, startTime: Date.now() });
  return sessionId;
}

function recordSkillEnd(skillName, sessionId, success) {
  const endTime = Date.now();
  const session = activeSessions.get(sessionId);
  let durationMs = session ? endTime - session.startTime : 0;
  if (session) activeSessions.delete(sessionId);

  pendingUpdates.push((metrics) => {
    if (metrics.skills[skillName]) {
      const skill = metrics.skills[skillName];
      skill.invocation_count += 1;
      success ? skill.success_count++ : skill.failure_count++;
      skill.total_duration_ms += durationMs;
      skill.avg_duration_ms = skill.total_duration_ms / skill.invocation_count;
      skill.last_invoked = new Date().toISOString();
      skill.last_result = success ? 'success' : 'failure';
    }
  });
  scheduleSave();
}

function recordSkillInvocation(skillName, success, durationMs = 0) {
  pendingUpdates.push((metrics) => {
    if (metrics.skills[skillName]) {
      const skill = metrics.skills[skillName];
      skill.invocation_count += 1;
      success ? skill.success_count++ : skill.failure_count++;
      if (durationMs > 0) {
        skill.total_duration_ms += durationMs;
        skill.avg_duration_ms = skill.total_duration_ms / skill.invocation_count;
      }
      skill.last_invoked = new Date().toISOString();
      skill.last_result = success ? 'success' : 'failure';
    }
  });
  scheduleSave();
}

function flushMetrics() {
  if (saveTimeout) { clearTimeout(saveTimeout); saveTimeout = null; }
  if (pendingUpdates.length > 0) {
    const metrics = loadMetrics();
    if (metrics) {
      pendingUpdates.forEach((update) => update(metrics));
      pendingUpdates = [];
      updateAggregates(metrics);
      saveMetrics(metrics);
    }
  }
}

function getSkillStats(skillName) {
  const metrics = loadMetrics();
  if (metrics?.skills[skillName]) {
    const skill = metrics.skills[skillName];
    return { ...skill, success_rate: skill.invocation_count > 0 ? skill.success_count / skill.invocation_count : 0 };
  }
  return null;
}

function getAllSkillStats() {
  const metrics = loadMetrics();
  if (!metrics) return null;
  return {
    skills: Object.fromEntries(
      Object.entries(metrics.skills).map(([name, skill]) => [
        name, { ...skill, success_rate: skill.invocation_count > 0 ? skill.success_count / skill.invocation_count : 0 }
      ])
    ),
    aggregates: metrics.aggregates,
  };
}

function getTopPerformers(n = 5) {
  const metrics = loadMetrics();
  if (!metrics) return [];
  return Object.entries(metrics.skills)
    .filter(([, s]) => s.invocation_count > 0)
    .map(([name, s]) => ({ name, success_rate: s.success_count / s.invocation_count, invocation_count: s.invocation_count }))
    .sort((a, b) => b.success_rate - a.success_rate)
    .slice(0, n);
}

function getLowPerformers(n = 5) {
  const metrics = loadMetrics();
  if (!metrics) return [];
  return Object.entries(metrics.skills)
    .filter(([, s]) => s.invocation_count > 0)
    .map(([name, s]) => ({ name, success_rate: s.success_count / s.invocation_count, failure_count: s.failure_count }))
    .sort((a, b) => a.success_rate - b.success_rate)
    .slice(0, n);
}

function getRecentlyUsed(n = 5) {
  const metrics = loadMetrics();
  if (!metrics) return [];
  return Object.entries(metrics.skills)
    .filter(([, s]) => s.last_invoked)
    .map(([name, s]) => ({ name, last_invoked: s.last_invoked, last_result: s.last_result }))
    .sort((a, b) => new Date(b.last_invoked) - new Date(a.last_invoked))
    .slice(0, n);
}

module.exports = {
  recordSkillStart, recordSkillEnd, recordSkillInvocation, flushMetrics,
  getSkillStats, getAllSkillStats, getTopPerformers, getLowPerformers, getRecentlyUsed,
  loadMetrics, CONFIG,
};
