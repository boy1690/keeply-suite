#!/usr/bin/env node
/**
 * Task Decomposer - 任務分解器
 * Meta-Orchestrator 三層架構的任務規劃層
 *
 * @version 1.0.0 - V57.1 新增
 * @since 2026-01-14
 *
 * 功能：
 * - 將複雜任務分解為子任務
 * - 建立執行順序和依賴關係
 * - 定義驗證檢查點
 */

const { AGENT_KEYWORDS, CROSS_MODULE_CONSTRAINTS } = require('./complexity-analyzer');

// Agent 執行優先級
const AGENT_PRIORITY = {
  'security-auditor': 1,
  'tauri-ipc-specialist': 2,
  'git-engine-specialist': 3,
  'worktree-manager': 4,
  'nas-sync-specialist': 5,
  'test-engineer': 6
};

// Agent 依賴關係
const AGENT_DEPENDENCIES = {
  'worktree-manager': ['git-engine-specialist'],
  'nas-sync-specialist': ['git-engine-specialist'],
  'test-engineer': ['git-engine-specialist', 'worktree-manager', 'nas-sync-specialist']
};

/**
 * 計算執行順序（拓撲排序）
 */
function calculateExecutionOrder(agents) {
  const inDegree = {};
  const adjacency = {};

  agents.forEach(agent => {
    inDegree[agent] = 0;
    adjacency[agent] = [];
  });

  agents.forEach(agent => {
    const deps = AGENT_DEPENDENCIES[agent] || [];
    deps.forEach(dep => {
      if (agents.includes(dep)) {
        adjacency[dep].push(agent);
        inDegree[agent]++;
      }
    });
  });

  const queue = agents.filter(a => inDegree[a] === 0);
  const result = [];

  queue.sort((a, b) => (AGENT_PRIORITY[a] || 99) - (AGENT_PRIORITY[b] || 99));

  while (queue.length > 0) {
    const current = queue.shift();
    result.push(current);

    adjacency[current].forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
        queue.sort((a, b) => (AGENT_PRIORITY[a] || 99) - (AGENT_PRIORITY[b] || 99));
      }
    });
  }

  return result.length === agents.length ? result :
    [...agents].sort((a, b) => (AGENT_PRIORITY[a] || 99) - (AGENT_PRIORITY[b] || 99));
}

/**
 * 主要分解函式
 */
function decomposeTask(complexity) {
  const { involvedAgents, constraints } = complexity;
  const executionOrder = calculateExecutionOrder(involvedAgents);

  const subtasks = executionOrder.map((agent, index) => ({
    id: `${agent}-task-${index + 1}`,
    agent,
    domains: AGENT_KEYWORDS[agent]?.domains || [],
    status: 'pending',
    dependency: index > 0 ? `${executionOrder[index - 1]}-task-${index}` : null
  }));

  const checkpoints = subtasks.map(task => ({
    id: `checkpoint-after-${task.agent}`,
    afterTask: task.id,
    checks: ['type-check', 'lint']
  }));

  return { subtasks, executionOrder, checkpoints, totalSteps: subtasks.length };
}

/**
 * 格式化執行計畫
 */
function formatExecutionPlan(plan) {
  let output = `## 執行計畫\n\n`;
  plan.subtasks.forEach((task, i) => {
    output += `${i + 1}. **${task.agent}**\n`;
  });
  return output;
}

module.exports = {
  decomposeTask,
  formatExecutionPlan,
  calculateExecutionOrder,
  AGENT_PRIORITY,
  AGENT_DEPENDENCIES
};
