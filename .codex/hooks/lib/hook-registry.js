#!/usr/bin/env node
/**
 * Hook Registry - 動態 Hook 註冊與載入管理
 *
 * @version 1.0.0 - V57.4 新增
 * @since 2026-01-14
 *
 * 功能：
 * - 支援 eager/lazy Hook 載入策略
 * - 基於 session context 判斷是否需要載入
 * - Hook 依賴管理
 * - 效能指標追蹤
 */

const fs = require('fs');
const path = require('path');

// 狀態檔案
const REGISTRY_STATE_FILE = path.join(__dirname, '..', '..', 'metrics', 'hook-registry.json');

// 載入策略
const LOAD_STRATEGY = {
  EAGER: 'eager',     // 立即載入（SessionStart）
  LAZY: 'lazy',       // 延遲載入（按需）
  CONDITIONAL: 'conditional'  // 條件載入
};

// Hook 定義（元數據）
const HOOK_DEFINITIONS = {
  // SessionStart hooks
  'session-start': {
    event: 'SessionStart',
    file: 'session-start.js',
    strategy: LOAD_STRATEGY.EAGER,
    priority: 0,
    description: 'Context 自動注入',
    dependencies: []
  },

  // UserPromptSubmit hooks
  'intent-gate': {
    event: 'UserPromptSubmit',
    file: 'intent-gate.js',
    strategy: LOAD_STRATEGY.EAGER,
    priority: 1,
    description: 'Skill 匹配二次驗證',
    dependencies: []
  },
  // PreToolUse hooks
  'code-guard': {
    event: 'PreToolUse',
    matcher: 'Edit|Write',
    file: 'code-guard.js',
    strategy: LOAD_STRATEGY.EAGER,
    priority: 1,
    description: '程式碼修改防護',
    dependencies: []
  },
  'tdd-reminder': {
    event: 'PreToolUse',
    matcher: 'Edit|Write',
    file: 'tdd-reminder.js',
    strategy: LOAD_STRATEGY.CONDITIONAL,
    priority: 2,
    description: 'TDD 提醒',
    dependencies: ['code-guard'],
    condition: 'hasLibChanges'  // 僅在修改 lib/ 時載入
  },
  'worktree-guard': {
    event: 'PreToolUse',
    matcher: 'Bash',
    file: 'worktree-guard.js',
    strategy: LOAD_STRATEGY.LAZY,
    priority: 1,
    description: 'Worktree 防護',
    dependencies: []
  },
  'meta-orchestrator': {
    event: 'PreToolUse',
    matcher: '',
    file: 'meta-orchestrator.js',
    strategy: LOAD_STRATEGY.CONDITIONAL,
    priority: 0,
    description: '複雜任務協調',
    dependencies: [],
    condition: 'isComplexTask'
  },

  // PostToolUse hooks
  'post-tool-use': {
    event: 'PostToolUse',
    matcher: 'Edit|Write',
    file: 'post-tool-use.js',
    strategy: LOAD_STRATEGY.EAGER,
    priority: 1,
    description: '程式碼格式化驗證',
    dependencies: []
  },

  // Stop hooks
  'stop-hook': {
    event: 'Stop',
    file: 'stop-hook.js',
    strategy: LOAD_STRATEGY.EAGER,
    priority: 1,
    description: '完成驗證',
    dependencies: []
  },
  'retrospective-hook': {
    event: 'Stop',
    file: 'retrospective-hook.js',
    strategy: LOAD_STRATEGY.LAZY,
    priority: 2,
    description: '回顧學習',
    dependencies: ['stop-hook'],
    condition: 'hasSignificantWork'
  },
  'code-review-hook': {
    event: 'Stop',
    file: 'code-review-hook.js',
    strategy: LOAD_STRATEGY.LAZY,
    priority: 3,
    description: 'KBI/FAR 指標收集',
    dependencies: ['retrospective-hook']
  }
};

// 條件評估器
const CONDITION_EVALUATORS = {
  hasLibChanges: (context) => {
    // 檢查是否有 lib/ 目錄的修改
    if (!context.filePath) return false;
    return context.filePath.includes('/lib/') || context.filePath.includes('\\lib\\');
  },

  isComplexTask: (context) => {
    // 檢查是否為複雜任務（涉及多個 agents）
    if (!context.involvedAgents) return false;
    return context.involvedAgents.length >= 2;
  },

  hasSignificantWork: (context) => {
    // 檢查是否有顯著的工作量
    if (!context.toolCallCount) return true; // 預設為 true
    return context.toolCallCount >= 5;
  },

  hasHistoryLogs: () => {
    // 檢查是否有歷史日誌
    const logsDir = path.join(__dirname, '..', '..', 'logs');
    if (!fs.existsSync(logsDir)) return false;
    const files = fs.readdirSync(logsDir);
    return files.length > 0;
  },

  hasMemory: () => {
    // 檢查是否有三層記憶
    const memoryDir = path.join(__dirname, '..', '..', 'memory');
    if (!fs.existsSync(memoryDir)) return false;
    return true;
  },

  // V175: Workflow tracker 狀態檢查
  hasActiveWorkflow: () => {
    try {
      const tracker = require('./workflow-tracker');
      return tracker.getStatus().active;
    } catch { return false; }
  }
};

/**
 * 讀取 Registry 狀態
 */
function readState() {
  if (!fs.existsSync(REGISTRY_STATE_FILE)) {
    return createInitialState();
  }
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_STATE_FILE, 'utf-8'));
  } catch {
    return createInitialState();
  }
}

/**
 * 創建初始狀態
 */
function createInitialState() {
  return {
    loadedHooks: [],
    skippedHooks: [],
    loadHistory: [],
    metrics: {
      totalLoads: 0,
      eagerLoads: 0,
      lazyLoads: 0,
      conditionalLoads: 0,
      skippedByCondition: 0
    },
    lastUpdate: null
  };
}

/**
 * 保存 Registry 狀態
 */
function saveState(state) {
  state.lastUpdate = new Date().toISOString();
  const dir = path.dirname(REGISTRY_STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(REGISTRY_STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * 評估條件
 * @param {string} conditionName - 條件名稱
 * @param {object} context - 上下文
 * @returns {boolean} 是否滿足條件
 */
function evaluateCondition(conditionName, context = {}) {
  const evaluator = CONDITION_EVALUATORS[conditionName];
  if (!evaluator) return true; // 無條件則預設通過
  return evaluator(context);
}

/**
 * 獲取應載入的 Hooks
 * @param {string} event - 事件類型
 * @param {object} context - 上下文
 * @returns {object[]} 應載入的 hooks 列表
 */
function getHooksForEvent(event, context = {}) {
  const state = readState();
  const applicableHooks = [];
  const skipped = [];

  for (const [hookId, def] of Object.entries(HOOK_DEFINITIONS)) {
    if (def.event !== event) continue;

    // 檢查載入策略
    let shouldLoad = false;

    switch (def.strategy) {
      case LOAD_STRATEGY.EAGER:
        shouldLoad = true;
        break;

      case LOAD_STRATEGY.LAZY:
        // Lazy hooks 需要被顯式請求
        shouldLoad = context.requestedHooks?.includes(hookId) || false;
        break;

      case LOAD_STRATEGY.CONDITIONAL:
        // 評估條件
        if (def.condition) {
          shouldLoad = evaluateCondition(def.condition, context);
        } else {
          shouldLoad = true;
        }
        break;
    }

    // 檢查依賴
    if (shouldLoad && def.dependencies.length > 0) {
      const depsLoaded = def.dependencies.every(dep =>
        applicableHooks.some(h => h.id === dep)
      );
      if (!depsLoaded) {
        // 依賴尚未載入，加入等待隊列
        shouldLoad = true; // 保持載入，但調整順序
      }
    }

    if (shouldLoad) {
      applicableHooks.push({
        id: hookId,
        ...def,
        loadedAt: new Date().toISOString()
      });
    } else {
      skipped.push({
        id: hookId,
        reason: def.strategy === LOAD_STRATEGY.LAZY ? 'lazy_not_requested' :
                def.strategy === LOAD_STRATEGY.CONDITIONAL ? 'condition_not_met' : 'unknown'
      });
    }
  }

  // 按 priority 排序
  applicableHooks.sort((a, b) => a.priority - b.priority);

  // 更新指標
  state.metrics.totalLoads += applicableHooks.length;
  state.metrics.eagerLoads += applicableHooks.filter(h => h.strategy === LOAD_STRATEGY.EAGER).length;
  state.metrics.lazyLoads += applicableHooks.filter(h => h.strategy === LOAD_STRATEGY.LAZY).length;
  state.metrics.conditionalLoads += applicableHooks.filter(h => h.strategy === LOAD_STRATEGY.CONDITIONAL).length;
  state.metrics.skippedByCondition += skipped.filter(s => s.reason === 'condition_not_met').length;

  // 記錄載入歷史
  state.loadHistory.push({
    event,
    timestamp: new Date().toISOString(),
    loaded: applicableHooks.map(h => h.id),
    skipped: skipped.map(s => s.id)
  });

  // 限制歷史記錄
  if (state.loadHistory.length > 100) {
    state.loadHistory = state.loadHistory.slice(-100);
  }

  saveState(state);

  return applicableHooks;
}

/**
 * 請求載入 Lazy Hook
 * @param {string} hookId - Hook ID
 * @returns {object|null} Hook 定義或 null
 */
function requestLazyHook(hookId) {
  const def = HOOK_DEFINITIONS[hookId];
  if (!def) return null;
  if (def.strategy !== LOAD_STRATEGY.LAZY) {
    return { error: 'Not a lazy hook' };
  }

  const state = readState();
  state.loadedHooks.push(hookId);
  saveState(state);

  return {
    id: hookId,
    ...def,
    loadedAt: new Date().toISOString()
  };
}

/**
 * 註冊自定義 Hook
 * @param {string} hookId - Hook ID
 * @param {object} definition - Hook 定義
 */
function registerHook(hookId, definition) {
  if (HOOK_DEFINITIONS[hookId]) {
    return { success: false, error: 'Hook already exists' };
  }

  HOOK_DEFINITIONS[hookId] = {
    ...definition,
    strategy: definition.strategy || LOAD_STRATEGY.LAZY,
    priority: definition.priority || 99,
    dependencies: definition.dependencies || []
  };

  return { success: true, hookId };
}

/**
 * 取消註冊 Hook
 * @param {string} hookId - Hook ID
 */
function unregisterHook(hookId) {
  if (!HOOK_DEFINITIONS[hookId]) {
    return { success: false, error: 'Hook not found' };
  }

  delete HOOK_DEFINITIONS[hookId];
  return { success: true, hookId };
}

/**
 * 獲取所有 Hook 定義
 */
function getAllHooks() {
  return Object.entries(HOOK_DEFINITIONS).map(([id, def]) => ({
    id,
    ...def
  }));
}

/**
 * 獲取 Hook 統計
 */
function getStats() {
  const state = readState();
  const hooks = getAllHooks();

  return {
    totalHooks: hooks.length,
    byStrategy: {
      eager: hooks.filter(h => h.strategy === LOAD_STRATEGY.EAGER).length,
      lazy: hooks.filter(h => h.strategy === LOAD_STRATEGY.LAZY).length,
      conditional: hooks.filter(h => h.strategy === LOAD_STRATEGY.CONDITIONAL).length
    },
    byEvent: {
      SessionStart: hooks.filter(h => h.event === 'SessionStart').length,
      UserPromptSubmit: hooks.filter(h => h.event === 'UserPromptSubmit').length,
      PreToolUse: hooks.filter(h => h.event === 'PreToolUse').length,
      PostToolUse: hooks.filter(h => h.event === 'PostToolUse').length,
      Stop: hooks.filter(h => h.event === 'Stop').length
    },
    metrics: state.metrics,
    lastUpdate: state.lastUpdate
  };
}

/**
 * 生成優化後的 settings.json hooks 配置
 * @param {object} options - 選項
 * @returns {object} settings.json hooks 配置
 */
function generateOptimizedConfig(options = {}) {
  const { includeConditional = false } = options;
  const config = {
    SessionStart: [],
    UserPromptSubmit: [],
    PreToolUse: [],
    PostToolUse: [],
    Stop: []
  };

  for (const [hookId, def] of Object.entries(HOOK_DEFINITIONS)) {
    // 跳過 lazy hooks（它們不應該在 settings.json 中）
    if (def.strategy === LOAD_STRATEGY.LAZY) continue;

    // 根據選項決定是否包含 conditional hooks
    if (def.strategy === LOAD_STRATEGY.CONDITIONAL && !includeConditional) continue;

    const hookEntry = {
      type: 'command',
      command: `node .claude/hooks/${def.file}`
    };

    // 根據 matcher 分組
    if (def.event === 'PreToolUse' || def.event === 'PostToolUse') {
      const matcher = def.matcher || '';
      let group = config[def.event].find(g => g.matcher === matcher);
      if (!group) {
        group = { matcher, hooks: [] };
        config[def.event].push(group);
      }
      group.hooks.push(hookEntry);
    } else {
      let group = config[def.event].find(g => g.matcher === '');
      if (!group) {
        group = { matcher: '', hooks: [] };
        config[def.event].push(group);
      }
      group.hooks.push(hookEntry);
    }
  }

  return config;
}

/**
 * 重置 Registry 狀態
 */
function reset() {
  saveState(createInitialState());
  return { success: true };
}

module.exports = {
  getHooksForEvent,
  requestLazyHook,
  registerHook,
  unregisterHook,
  getAllHooks,
  getStats,
  generateOptimizedConfig,
  evaluateCondition,
  reset,
  LOAD_STRATEGY,
  HOOK_DEFINITIONS,
  CONDITION_EVALUATORS
};