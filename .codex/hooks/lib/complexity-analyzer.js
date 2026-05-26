#!/usr/bin/env node
/**
 * Complexity Analyzer - 任務複雜度評估器
 * Meta-Orchestrator 三層架構的第一層
 *
 * @version 1.0.0 - V57.1 新增
 * @since 2026-01-14
 * @see https://github.com/nibzard/awesome-agentic-patterns
 *
 * 功能：
 * - 分析用戶請求涉及的 Agents
 * - 評估任務複雜度（simple/moderate/complex）
 * - 識別跨模組依賴和風險因素
 */

// Agent 定義和關鍵字映射
const AGENT_KEYWORDS = {
  'git-engine-specialist': {
    keywords: ['git', 'commit', 'diff', 'log', 'init', 'clone', 'status', '版本', '儲存版本', 'bare'],
    domains: ['src-tauri/src/git/**'],
    relatedSkills: ['git-operations']
  },
  'worktree-manager': {
    keywords: ['worktree', '工作副本', '工作區', 'branch', '副本', 'workspace', 'isolation', '隔離'],
    domains: ['src-tauri/src/git/worktree.rs', 'src/components/workspace/**'],
    relatedSkills: ['worktree-operations']
  },
  'nas-sync-specialist': {
    keywords: ['sync', 'NAS', 'push', 'pull', '同步', '上傳', '下載', 'remote', 'conflict', '衝突'],
    domains: ['src-tauri/src/nas/**'],
    relatedSkills: ['nas-sync']
  },
  'tauri-ipc-specialist': {
    keywords: ['tauri', 'command', 'invoke', 'IPC', '指令', 'state', 'AppState'],
    domains: ['src-tauri/src/commands/**', 'src/lib/tauri-commands.ts'],
    relatedSkills: []
  },
  'test-engineer': {
    keywords: ['test', '測試', 'e2e', 'playwright', 'vitest', 'cargo test', 'coverage'],
    domains: ['e2e/**', 'src/**/__tests__/**'],
    relatedSkills: ['browser-tester']
  },
  'security-auditor': {
    keywords: ['security', '安全', 'vulnerability', '漏洞', 'injection', 'xss', 'csp'],
    domains: [],
    relatedSkills: []
  }
};

// 跨模組約束定義
const CROSS_MODULE_CONSTRAINTS = [
  {
    id: 'git-worktree-sync',
    agents: ['git-engine-specialist', 'worktree-manager'],
    description: 'Git 操作變更需確認 Worktree 隔離性 (INV-1)',
    checkpoints: ['after-git-change', 'verify-worktree-isolation']
  },
  {
    id: 'worktree-nas-sync',
    agents: ['worktree-manager', 'nas-sync-specialist'],
    description: 'Worktree 變更同步至 NAS 需原子性 (INV-2)',
    checkpoints: ['after-worktree-change', 'verify-sync-atomicity']
  },
  {
    id: 'ipc-type-sync',
    agents: ['tauri-ipc-specialist', 'git-engine-specialist'],
    description: 'Rust struct 與 TypeScript interface 必須一致',
    checkpoints: ['after-type-change', 'verify-type-parity']
  }
];

// 風險因素定義
const RISK_FACTORS = {
  'multiple-agents': { weight: 2, description: '涉及多個 Agents' },
  'cross-module': { weight: 3, description: '跨模組約束' },
  'nas-sync': { weight: 2, description: 'NAS 同步變更' },
  'core-logic': { weight: 3, description: '核心邏輯變更' },
  'type-system': { weight: 1, description: '型別系統變更' }
};

/**
 * 分析用戶請求涉及的 Agents
 * @param {string} userPrompt - 用戶輸入的提示
 * @returns {string[]} - 涉及的 agent ID 列表
 */
function detectInvolvedAgents(userPrompt) {
  const promptLower = userPrompt.toLowerCase();
  const involvedAgents = [];

  for (const [agentId, config] of Object.entries(AGENT_KEYWORDS)) {
    const hasKeyword = config.keywords.some(keyword =>
      promptLower.includes(keyword.toLowerCase())
    );
    if (hasKeyword) {
      involvedAgents.push(agentId);
    }
  }

  return involvedAgents;
}

/**
 * 識別跨模組約束
 * @param {string[]} involvedAgents - 涉及的 agents
 * @returns {object[]} - 適用的約束列表
 */
function identifyConstraints(involvedAgents) {
  return CROSS_MODULE_CONSTRAINTS.filter(constraint =>
    constraint.agents.every(agent => involvedAgents.includes(agent))
  );
}

/**
 * 識別風險因素
 * @param {string} userPrompt - 用戶輸入
 * @param {string[]} involvedAgents - 涉及的 agents
 * @param {object[]} constraints - 跨模組約束
 * @returns {object[]} - 風險因素列表
 */
function identifyRiskFactors(userPrompt, involvedAgents, constraints) {
  const risks = [];
  const promptLower = userPrompt.toLowerCase();

  // 多 Agent 風險
  if (involvedAgents.length >= 2) {
    risks.push({
      ...RISK_FACTORS['multiple-agents'],
      id: 'multiple-agents',
      details: `涉及 ${involvedAgents.length} 個 Agents: ${involvedAgents.join(', ')}`
    });
  }

  // 跨模組約束風險
  if (constraints.length > 0) {
    risks.push({
      ...RISK_FACTORS['cross-module'],
      id: 'cross-module',
      details: `${constraints.length} 個跨模組約束: ${constraints.map(c => c.id).join(', ')}`
    });
  }

  // NAS 同步變更風險
  if (involvedAgents.includes('nas-sync-specialist')) {
    risks.push({
      ...RISK_FACTORS['nas-sync'],
      id: 'nas-sync',
      details: '涉及 NAS 同步邏輯變更'
    });
  }

  // 核心邏輯風險
  const coreKeywords = ['refactor', '重構', 'engine', '引擎', 'core', '核心', 'algorithm', '演算法'];
  if (coreKeywords.some(k => promptLower.includes(k))) {
    risks.push({
      ...RISK_FACTORS['core-logic'],
      id: 'core-logic',
      details: '涉及核心邏輯變更'
    });
  }

  return risks;
}

/**
 * 計算複雜度等級
 * @param {string[]} involvedAgents - 涉及的 agents
 * @param {object[]} constraints - 跨模組約束
 * @param {object[]} risks - 風險因素
 * @returns {'simple' | 'moderate' | 'complex'} - 複雜度等級
 */
function calculateComplexityLevel(involvedAgents, constraints, risks) {
  const totalRiskWeight = risks.reduce((sum, r) => sum + r.weight, 0);

  // 複雜度判斷規則
  if (involvedAgents.length >= 3 || totalRiskWeight >= 6) {
    return 'complex';
  }
  if (involvedAgents.length === 2 || constraints.length > 0 || totalRiskWeight >= 3) {
    return 'moderate';
  }
  return 'simple';
}

/**
 * 估算執行步驟數
 * @param {string[]} involvedAgents - 涉及的 agents
 * @param {object[]} constraints - 跨模組約束
 * @returns {number} - 預估步驟數
 */
function estimateSteps(involvedAgents, constraints) {
  // 基礎步驟：每個 agent 至少 2 步（實作 + 驗證）
  let steps = involvedAgents.length * 2;

  // 跨模組約束：每個約束加 1 步（同步驗證）
  steps += constraints.length;

  // 最少 1 步
  return Math.max(1, steps);
}

/**
 * 主要分析函式：評估任務複雜度
 * @param {string} userPrompt - 用戶輸入的提示
 * @returns {object} - 複雜度分析結果
 */
function analyzeComplexity(userPrompt) {
  // 1. 檢測涉及的 Agents
  const involvedAgents = detectInvolvedAgents(userPrompt);

  // 2. 識別跨模組約束
  const constraints = identifyConstraints(involvedAgents);

  // 3. 識別風險因素
  const riskFactors = identifyRiskFactors(userPrompt, involvedAgents, constraints);

  // 4. 計算複雜度等級
  const level = calculateComplexityLevel(involvedAgents, constraints, riskFactors);

  // 5. 估算步驟數
  const estimatedSteps = estimateSteps(involvedAgents, constraints);

  // 6. 收集檢查點
  const checkpoints = constraints.flatMap(c => c.checkpoints);

  return {
    level,
    involvedAgents,
    estimatedSteps,
    riskFactors,
    constraints,
    checkpoints,
    timestamp: new Date().toISOString()
  };
}

/**
 * 格式化複雜度報告（用於 additionalContext）
 * @param {object} analysis - analyzeComplexity 的結果
 * @returns {string} - 格式化的報告
 */
function formatComplexityReport(analysis) {
  const levelEmoji = {
    simple: '🟢',
    moderate: '🟡',
    complex: '🔴'
  };

  let report = `## 任務複雜度分析\n\n`;
  report += `**等級**: ${levelEmoji[analysis.level]} ${analysis.level.toUpperCase()}\n`;
  report += `**預估步驟**: ${analysis.estimatedSteps}\n\n`;

  if (analysis.involvedAgents.length > 0) {
    report += `### 涉及 Agents\n`;
    analysis.involvedAgents.forEach(agent => {
      report += `- ${agent}\n`;
    });
    report += '\n';
  }

  if (analysis.riskFactors.length > 0) {
    report += `### 風險因素\n`;
    analysis.riskFactors.forEach(risk => {
      report += `- ⚠️ ${risk.description}: ${risk.details}\n`;
    });
    report += '\n';
  }

  if (analysis.checkpoints.length > 0) {
    report += `### 驗證檢查點\n`;
    analysis.checkpoints.forEach(cp => {
      report += `- [ ] ${cp}\n`;
    });
  }

  return report;
}

// 導出
module.exports = {
  analyzeComplexity,
  formatComplexityReport,
  detectInvolvedAgents,
  identifyConstraints,
  identifyRiskFactors,
  AGENT_KEYWORDS,
  CROSS_MODULE_CONSTRAINTS,
  RISK_FACTORS
};
