#!/usr/bin/env node
/**
 * Learning Engine - Skill 權重自適應引擎
 *
 * @version 1.0.0 - V57.2 新增
 * @since 2026-01-14
 * @see https://arxiv.org/abs/2512.24601 (Recursive Language Models)
 *
 * 功能：
 * - 分析 retrospective-hook 的輸出
 * - 根據成功率自動調整 Skill 權重
 * - 學習常見錯誤模式
 */

const fs = require('fs');
const path = require('path');

// 配置文件路徑
const SKILL_METRICS_FILE = path.join(__dirname, '..', '..', 'metrics', 'skill-metrics.json');
const LEARNING_STATE_FILE = path.join(__dirname, '..', '..', 'metrics', 'learning-state.json');

// 學習配置
const LEARNING_CONFIG = {
  minSamples: 5,              // 最小樣本數才開始學習
  successRateThreshold: 0.8,  // 成功率低於此值觸發警告
  weightAdjustmentRate: 0.1,  // 權重調整幅度
  maxWeight: 2.0,             // 最大權重
  minWeight: 0.5              // 最小權重
};

/**
 * 讀取學習狀態
 * @returns {object} 學習狀態
 */
function readLearningState() {
  if (!fs.existsSync(LEARNING_STATE_FILE)) {
    return {
      skillWeights: {},
      errorPatterns: [],
      lastUpdated: null
    };
  }
  try {
    return JSON.parse(fs.readFileSync(LEARNING_STATE_FILE, 'utf-8'));
  } catch {
    return { skillWeights: {}, errorPatterns: [], lastUpdated: null };
  }
}

/**
 * 保存學習狀態
 * @param {object} state - 學習狀態
 */
function saveLearningState(state) {
  state.lastUpdated = new Date().toISOString();

  const dir = path.dirname(LEARNING_STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(LEARNING_STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * 讀取 Skill 指標
 * @returns {object} Skill 指標
 */
function readSkillMetrics() {
  if (!fs.existsSync(SKILL_METRICS_FILE)) {
    return { skills: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(SKILL_METRICS_FILE, 'utf-8'));
  } catch {
    return { skills: {} };
  }
}

/**
 * 計算 Skill 成功率
 * @param {object} skillData - Skill 數據
 * @returns {number|null} 成功率 (0-1) 或 null（樣本不足）
 */
function calculateSuccessRate(skillData) {
  const total = skillData.invocation_count || 0;
  const success = skillData.success_count || 0;

  if (total < LEARNING_CONFIG.minSamples) {
    return null;
  }

  return success / total;
}

/**
 * 計算建議權重
 * @param {number} successRate - 成功率
 * @param {number} currentWeight - 當前權重
 * @returns {number} 新權重
 */
function calculateNewWeight(successRate, currentWeight = 1.0) {
  let adjustment = 0;

  if (successRate >= 0.9) {
    // 高成功率，增加權重
    adjustment = LEARNING_CONFIG.weightAdjustmentRate;
  } else if (successRate < LEARNING_CONFIG.successRateThreshold) {
    // 低成功率，降低權重
    adjustment = -LEARNING_CONFIG.weightAdjustmentRate;
  }

  const newWeight = currentWeight + adjustment;

  return Math.max(
    LEARNING_CONFIG.minWeight,
    Math.min(LEARNING_CONFIG.maxWeight, newWeight)
  );
}

/**
 * 分析並學習
 * @returns {object} 學習結果
 */
function learn() {
  const metrics = readSkillMetrics();
  const state = readLearningState();

  const results = {
    analyzed: [],
    warnings: [],
    adjustments: []
  };

  for (const [skillId, skillData] of Object.entries(metrics.skills || {})) {
    const successRate = calculateSuccessRate(skillData);

    if (successRate === null) {
      results.analyzed.push({
        skill: skillId,
        status: 'insufficient_data',
        samples: skillData.invocation_count || 0,
        required: LEARNING_CONFIG.minSamples
      });
      continue;
    }

    const currentWeight = state.skillWeights[skillId] || 1.0;
    const newWeight = calculateNewWeight(successRate, currentWeight);

    results.analyzed.push({
      skill: skillId,
      successRate: Math.round(successRate * 100),
      currentWeight,
      newWeight,
      samples: skillData.invocation_count
    });

    // 記錄警告
    if (successRate < LEARNING_CONFIG.successRateThreshold) {
      results.warnings.push({
        skill: skillId,
        successRate: Math.round(successRate * 100),
        message: `Skill ${skillId} 成功率 ${Math.round(successRate * 100)}% 低於閾值 ${LEARNING_CONFIG.successRateThreshold * 100}%`
      });
    }

    // 記錄權重調整
    if (newWeight !== currentWeight) {
      results.adjustments.push({
        skill: skillId,
        from: currentWeight,
        to: newWeight,
        reason: successRate >= 0.9 ? 'high_success' : 'low_success'
      });
      state.skillWeights[skillId] = newWeight;
    }
  }

  // 保存學習狀態
  saveLearningState(state);

  return results;
}

/**
 * 學習錯誤模式
 * @param {string} skillId - Skill ID
 * @param {string} errorMessage - 錯誤訊息
 * @param {object} context - 上下文
 */
function learnErrorPattern(skillId, errorMessage, context = {}) {
  const state = readLearningState();

  const pattern = {
    id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    skill: skillId,
    errorPattern: extractErrorPattern(errorMessage),
    context,
    count: 1,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };

  // 檢查是否已存在相似模式
  const existing = state.errorPatterns.find(p =>
    p.skill === skillId && p.errorPattern === pattern.errorPattern
  );

  if (existing) {
    existing.count++;
    existing.lastSeen = pattern.lastSeen;
  } else {
    state.errorPatterns.push(pattern);

    // 限制模式數量
    if (state.errorPatterns.length > 100) {
      state.errorPatterns = state.errorPatterns
        .sort((a, b) => b.count - a.count)
        .slice(0, 100);
    }
  }

  saveLearningState(state);

  return existing || pattern;
}

/**
 * 提取錯誤模式（簡化錯誤訊息）
 * @param {string} errorMessage - 錯誤訊息
 * @returns {string} 錯誤模式
 */
function extractErrorPattern(errorMessage) {
  return errorMessage
    .replace(/\d+/g, 'N')           // 數字替換為 N
    .replace(/['"][^'"]+['"]/g, 'S') // 字串替換為 S
    .replace(/\s+/g, ' ')            // 多空格合併
    .trim()
    .slice(0, 100);                  // 限制長度
}

/**
 * 獲取 Skill 權重
 * @param {string} skillId - Skill ID
 * @returns {number} 權重
 */
function getWeight(skillId) {
  const state = readLearningState();
  return state.skillWeights[skillId] || 1.0;
}

/**
 * 獲取所有權重
 * @returns {object} 權重映射
 */
function getAllWeights() {
  const state = readLearningState();
  return state.skillWeights;
}

/**
 * 獲取常見錯誤模式
 * @param {string} skillId - 可選，過濾特定 Skill
 * @returns {object[]} 錯誤模式列表
 */
function getCommonErrors(skillId = null) {
  const state = readLearningState();

  let patterns = state.errorPatterns || [];

  if (skillId) {
    patterns = patterns.filter(p => p.skill === skillId);
  }

  return patterns
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * 獲取學習摘要
 * @returns {object} 學習摘要
 */
function getSummary() {
  const state = readLearningState();
  const metrics = readSkillMetrics();

  const summary = {
    totalSkills: Object.keys(metrics.skills || {}).length,
    adjustedSkills: Object.keys(state.skillWeights).length,
    errorPatterns: state.errorPatterns?.length || 0,
    lastUpdated: state.lastUpdated,
    weights: state.skillWeights,
    topErrors: getCommonErrors().slice(0, 5)
  };

  return summary;
}

/**
 * 重置學習狀態
 */
function reset() {
  saveLearningState({
    skillWeights: {},
    errorPatterns: [],
    lastUpdated: null
  });
}

module.exports = {
  learn,
  learnErrorPattern,
  getWeight,
  getAllWeights,
  getCommonErrors,
  getSummary,
  reset,
  calculateSuccessRate,
  LEARNING_CONFIG
};
