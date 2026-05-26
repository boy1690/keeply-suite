#!/usr/bin/env node
/**
 * Protocol Engine - M10 Behavioral Protocol Library
 *
 * 把 Opus 的戰傷經驗編碼為 Sonnet 可執行的行為協議。
 * 在 delegated execution (M9 Step 6.5) 時自動注入匹配的協議。
 *
 * Architecture:
 * - protocols/*.json: 個別 protocol 檔案
 * - protocols/_archive/: 衰減後歸檔
 * - protocol-engine.js: 匹配 + 格式化 + 學習迴圈
 *
 * @version 1.0.0
 * @since 2026-03-25
 * @module M10
 */

const fs = require('fs');
const path = require('path');

// Protocol 存儲目錄
const PROTOCOLS_DIR = path.join(__dirname, '..', '..', 'memory', 'protocols');
const ARCHIVE_DIR = path.join(PROTOCOLS_DIR, '_archive');

// 衰減閾值（天）
const DECAY_THRESHOLD_DAYS = 90;

// 注入限制
const MAX_INJECTION_COUNT = 3;
const MATCH_THRESHOLD = 0.3;

// Severity 加成
const SEVERITY_BONUS = {
  CRITICAL: 0.5,
  HIGH: 0.3,
  MEDIUM: 0
};

// ============================================================
// Schema 驗證
// ============================================================

const REQUIRED_FIELDS = [
  'id', 'name', 'category', 'severity',
  'trigger', 'prompt_block'
];

const VALID_CATEGORIES = [
  'react-state',        // Closure, useState, Zustand, memoization
  'refactor-safety',    // Consumer 遺漏, export rename, Impact Map
  'assumption-verify',  // Schema drift, DB 欄位, API 假設
  'integration-wire',   // 元件掛載, toolbar 觸發, 路由連接
  'css-layout',         // Flex direction, CSS assumption, 響應式
  'domain-invariant',   // Worktree 隔離, NAS 同步原子性
  'other'
];

const VALID_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM'];

/**
 * 驗證 protocol 物件是否符合 schema
 * @param {object} protocol
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateProtocol(protocol) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!protocol[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (protocol.category && !VALID_CATEGORIES.includes(protocol.category)) {
    errors.push(`Invalid category: ${protocol.category}. Valid: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (protocol.severity && !VALID_SEVERITIES.includes(protocol.severity)) {
    errors.push(`Invalid severity: ${protocol.severity}. Valid: ${VALID_SEVERITIES.join(', ')}`);
  }

  if (protocol.trigger) {
    if (!protocol.trigger.keywords || !Array.isArray(protocol.trigger.keywords)) {
      errors.push('trigger.keywords must be a non-empty array');
    }
  }

  if (protocol.prompt_block && protocol.prompt_block.length < 50) {
    errors.push('prompt_block too short (min 50 chars) — must contain STOP + CHECK + DO/DONT');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// CRUD 操作
// ============================================================

/**
 * 讀取所有活躍 protocols（不含 _archive）
 * @returns {object[]}
 */
function loadAllProtocols() {
  if (!fs.existsSync(PROTOCOLS_DIR)) return [];

  const files = fs.readdirSync(PROTOCOLS_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'));

  const protocols = [];
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(PROTOCOLS_DIR, file), 'utf-8');
      const protocol = JSON.parse(content);
      protocols.push(protocol);
    } catch {
      // 跳過無法解析的檔案
    }
  }

  return protocols;
}

/**
 * 讀取單一 protocol
 * @param {string} id - protocol ID
 * @returns {object|null}
 */
function loadProtocol(id) {
  const filePath = path.join(PROTOCOLS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * 儲存 protocol（新增或更新）
 * @param {object} protocol
 * @returns {{ success: boolean, error?: string }}
 */
function saveProtocol(protocol) {
  const validation = validateProtocol(protocol);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join('; ') };
  }

  if (!fs.existsSync(PROTOCOLS_DIR)) {
    fs.mkdirSync(PROTOCOLS_DIR, { recursive: true });
  }

  if (!protocol.created_at) {
    protocol.created_at = new Date().toISOString().split('T')[0];
  }
  if (protocol.trigger_count === undefined) {
    protocol.trigger_count = 0;
  }
  if (!protocol.last_used) {
    protocol.last_used = null;
  }
  if (protocol.effectiveness === undefined) {
    protocol.effectiveness = null;
  }

  const filePath = path.join(PROTOCOLS_DIR, `${protocol.id}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(protocol, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ============================================================
// 匹配邏輯（用於 Step 6.5 Context Bundle 注入）
// ============================================================

/**
 * 根據 task context 匹配相關 protocols
 *
 * @param {object} context - 匹配上下文
 * @param {string[]} context.filePaths - task 涉及的檔案路徑
 * @param {string[]} context.keywords - task 描述中的關鍵字
 * @param {string[]} [context.codePatterns] - 原始碼中的 pattern（可選）
 * @returns {Array<{ protocol: object, matchedKeywords: string[], score: number }>}
 */
function matchProtocols(context) {
  const { filePaths = [], keywords = [], codePatterns = [] } = context;
  const allProtocols = loadAllProtocols();

  // 建立搜尋文本池（全部轉小寫）
  const searchPool = [
    ...filePaths.map(p => p.toLowerCase()),
    ...keywords.map(k => k.toLowerCase()),
    ...codePatterns.map(p => p.toLowerCase())
  ].join(' ');

  const matches = [];

  for (const protocol of allProtocols) {
    // 跳過草稿（需人工審核）
    if (protocol.draft) continue;

    const matchedKeywords = [];
    const triggerKeywords = protocol.trigger?.keywords || [];

    for (const keyword of triggerKeywords) {
      if (searchPool.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    // 檔案路徑匹配（bonus）
    let filePatternMatch = false;
    const filePatterns = protocol.trigger?.file_patterns || [];
    for (const pattern of filePatterns) {
      const regex = globToRegex(pattern);
      for (const fp of filePaths) {
        if (regex.test(fp.replace(/\\/g, '/'))) {
          filePatternMatch = true;
          break;
        }
      }
      if (filePatternMatch) break;
    }

    if (matchedKeywords.length > 0 || filePatternMatch) {
      const ratio = triggerKeywords.length > 0
        ? matchedKeywords.length / triggerKeywords.length
        : 0;

      const fileBonus = filePatternMatch ? 0.2 : 0;
      const severityBonus = SEVERITY_BONUS[protocol.severity] || 0;
      const historyBonus = Math.min((protocol.trigger_count || 0) * 0.1, 0.5);

      const score = (ratio + fileBonus) * (1 + severityBonus + historyBonus);

      if (score >= MATCH_THRESHOLD || protocol.severity === 'CRITICAL') {
        matches.push({ protocol, matchedKeywords, score });
      }
    }
  }

  // 依 severity 優先，然後 score 降序排列
  matches.sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
    const aSev = severityOrder[a.protocol.severity] ?? 3;
    const bSev = severityOrder[b.protocol.severity] ?? 3;
    if (aSev !== bSev) return aSev - bSev;
    return b.score - a.score;
  });

  // 最多注入 MAX_INJECTION_COUNT 個
  return matches.slice(0, MAX_INJECTION_COUNT);
}

/**
 * 簡易 glob → regex 轉換
 * @param {string} glob
 * @returns {RegExp}
 */
function globToRegex(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '<<GLOBSTAR>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<GLOBSTAR>>/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(escaped);
}

// ============================================================
// 格式化（用於 Sonnet prompt 注入）
// ============================================================

/**
 * 將匹配的 protocols 格式化為 Sonnet prompt 段落
 * @param {Array<{ protocol: object, matchedKeywords: string[], score: number }>} matches
 * @returns {string}
 */
function formatForSonnet(matches) {
  if (matches.length === 0) return '';

  const lines = [];
  lines.push('---');
  lines.push('');
  lines.push('## Behavioral Protocols (M10)');
  lines.push('');
  lines.push('> These protocols encode lessons from past failures in this project.');
  lines.push('> Follow them EXACTLY — they exist because ignoring them caused real bugs.');
  lines.push('');

  for (const { protocol, matchedKeywords } of matches) {
    lines.push(protocol.prompt_block);
    lines.push('');
    lines.push(`_Matched keywords: ${matchedKeywords.map(k => '`' + k + '`').join(', ')}_`);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * 將匹配的 protocols 格式化為 plan 注入（較簡短）
 * @param {Array<{ protocol: object }>} matches
 * @returns {string}
 */
function formatForPlanInjection(matches) {
  if (matches.length === 0) return '';

  const lines = [];
  lines.push('## Behavioral Protocol Warnings (M10)');
  lines.push('');
  lines.push('> Auto-matched from `.claude/memory/protocols/`. These are cross-spec lessons.');
  lines.push('');
  lines.push('| # | Protocol | Severity | Category |');
  lines.push('|---|----------|----------|----------|');

  for (let i = 0; i < matches.length; i++) {
    const { protocol } = matches[i];
    lines.push(`| P-${i + 1} | ${protocol.name} | ${protocol.severity} | ${protocol.category} |`);
  }

  lines.push('');
  lines.push('**Action**: Ensure Implementation Codebook Do/Don\'t Pairs address each protocol above.');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// 格式化（用於 Haiku prompt 注入 — M11）
// ============================================================

/**
 * 為 Haiku 格式化 protocols（精簡版：只保留 DO/DON'T）
 *
 * Haiku 不需要 STOP/CHECK 推理流程——只需機械規則。
 * 最多 2 個 protocols（vs Sonnet 的 3 個）。
 *
 * @param {Array<{ protocol: object, matchedKeywords: string[], score: number }>} matches
 * @returns {string}
 */
function formatForHaiku(matches) {
  if (matches.length === 0) return '';

  const lines = ['## Safety Rules', ''];

  for (const { protocol } of matches.slice(0, 2)) {
    const doMatch = protocol.prompt_block.match(/DO:\n```[\s\S]*?```/);
    const dontMatch = protocol.prompt_block.match(/DON'T:\n```[\s\S]*?```/);

    if (doMatch || dontMatch) {
      lines.push(`### ${protocol.name}`);
      if (doMatch) lines.push(doMatch[0]);
      if (dontMatch) lines.push(dontMatch[0]);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ============================================================
// 使用記錄（閉環學習）
// ============================================================

/**
 * 記錄 protocol 使用結果
 * @param {string} id - protocol ID
 * @param {object} result
 * @param {string} result.taskId - T001 etc.
 * @param {boolean} result.applied - Sonnet 是否遵循
 * @param {boolean} result.effective - 遵循後是否避免了問題
 * @param {string} result.model - 'sonnet' | 'opus'
 */
function recordUsage(id, result) {
  const protocol = loadProtocol(id);
  if (!protocol) return;

  protocol.last_used = new Date().toISOString().split('T')[0];
  protocol.trigger_count = (protocol.trigger_count || 0) + 1;

  // 追蹤 effectiveness
  if (!protocol.usage_history) {
    protocol.usage_history = [];
  }
  protocol.usage_history.push({
    date: protocol.last_used,
    taskId: result.taskId,
    applied: result.applied,
    effective: result.effective,
    model: result.model
  });

  // 計算近期 effectiveness
  const recent = protocol.usage_history.slice(-5);
  const effectiveCount = recent.filter(u => u.effective).length;
  if (recent.length >= 3) {
    protocol.effectiveness = effectiveCount / recent.length >= 0.6
      ? 'effective'
      : 'ineffective';
  }

  // 自動 severity 升級：連續 3 次 effective → 升一級
  const lastThree = protocol.usage_history.slice(-3);
  if (lastThree.length === 3 && lastThree.every(u => u.effective)) {
    if (protocol.severity === 'MEDIUM') protocol.severity = 'HIGH';
    else if (protocol.severity === 'HIGH') protocol.severity = 'CRITICAL';
  }

  // 自動標記需要審核：連續 2 次 ineffective
  const lastTwo = protocol.usage_history.slice(-2);
  if (lastTwo.length === 2 && lastTwo.every(u => !u.effective)) {
    protocol.review_needed = true;
  }

  saveProtocol(protocol);
}

// ============================================================
// 萃取（從 Sonnet 失敗建立新 protocol）
// ============================================================

/**
 * 從 Sonnet 失敗萃取 protocol 候選
 *
 * @param {object} context
 * @param {string} context.taskDescription - 失敗的 task 描述
 * @param {string} context.failureType - 'type-check' | 'runtime' | 'logic' | 'parity'
 * @param {string} context.failureMessage - 錯誤訊息
 * @param {string[]} context.affectedFiles - 涉及的檔案
 * @param {string} context.opusDiagnosis - Opus 修復時的根因分析
 * @returns {object|null} protocol 候選（draft: true）
 */
function extractFromFailure(context) {
  const { taskDescription, failureType, failureMessage, affectedFiles = [], opusDiagnosis } = context;
  if (!taskDescription || !opusDiagnosis) return null;

  // 推斷 category
  let category = 'other';
  if (/closure|state|useState|Zustand|debounce/i.test(opusDiagnosis)) category = 'react-state';
  else if (/consumer|import|export|rename/i.test(opusDiagnosis)) category = 'refactor-safety';
  else if (/schema|column|field|type.*mismatch/i.test(opusDiagnosis)) category = 'assumption-verify';
  else if (/mount|render|wir|toolbar|route/i.test(opusDiagnosis)) category = 'integration-wire';
  else if (/css|flex|grid|layout|overflow/i.test(opusDiagnosis)) category = 'css-layout';
  else if (/invariant|worktree|isolation|sync|atomicity|parity/i.test(opusDiagnosis)) category = 'domain-invariant';

  // 推斷 keywords
  const keywords = new Set();
  for (const filePath of affectedFiles) {
    const basename = path.basename(filePath, path.extname(filePath));
    if (basename.length > 2) keywords.add(basename);
    const dirName = path.basename(path.dirname(filePath));
    if (dirName.length > 2 && dirName !== 'src') keywords.add(dirName);
  }

  // 從診斷和錯誤訊息提取關鍵字
  const diagWords = opusDiagnosis.split(/[\s,;:()[\]{}]+/).filter(w => w.length > 3);
  for (const word of diagWords.slice(0, 8)) {
    keywords.add(word.toLowerCase());
  }

  if (keywords.size === 0) return null;

  const id = `BP-auto-${Date.now()}`;

  return {
    id,
    name: `[Auto] ${failureType}: ${taskDescription.slice(0, 50)}`,
    category,
    severity: 'MEDIUM',
    source: {
      type: 'sonnet-failure',
      failureType,
      taskDescription
    },
    trigger: {
      keywords: Array.from(keywords),
      file_patterns: affectedFiles.map(f => `**/${path.basename(f)}`),
      code_patterns: []
    },
    prompt_block: `## PROTOCOL: [DRAFT — needs Opus review] ${failureType} Guard\n\nTRIGGER: ${taskDescription}\n\nSTOP — A similar task failed before. Opus diagnosed:\n${opusDiagnosis}\n\nError was: ${failureMessage}\n\n[TODO: Opus should expand this into STOP → CHECK → DO/DON'T format]`,
    created_at: new Date().toISOString().split('T')[0],
    trigger_count: 0,
    last_used: null,
    effectiveness: null,
    draft: true,
    auto_extracted: true
  };
}

// ============================================================
// 衰減邏輯
// ============================================================

/**
 * 執行衰減：超過閾值天數未使用的 protocol 移到 _archive/
 * @returns {{ archived: string[], kept: string[] }}
 */
function runDecay() {
  const protocols = loadAllProtocols();
  const now = Date.now();
  const thresholdMs = DECAY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  const archived = [];
  const kept = [];

  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }

  for (const protocol of protocols) {
    const lastActive = protocol.last_used || protocol.created_at;
    if (!lastActive) {
      kept.push(protocol.id);
      continue;
    }

    const lastActiveMs = new Date(lastActive).getTime();
    const daysSinceActive = (now - lastActiveMs) / (24 * 60 * 60 * 1000);

    if (daysSinceActive > DECAY_THRESHOLD_DAYS) {
      const srcPath = path.join(PROTOCOLS_DIR, `${protocol.id}.json`);
      const dstPath = path.join(ARCHIVE_DIR, `${protocol.id}.json`);

      try {
        protocol.archived_at = new Date().toISOString().split('T')[0];
        protocol.archived_reason = `${Math.floor(daysSinceActive)} days since last use (threshold: ${DECAY_THRESHOLD_DAYS})`;
        fs.writeFileSync(dstPath, JSON.stringify(protocol, null, 2), 'utf-8');
        fs.unlinkSync(srcPath);
        archived.push(protocol.id);
      } catch {
        kept.push(protocol.id);
      }
    } else {
      kept.push(protocol.id);
    }
  }

  return { archived, kept };
}

// ============================================================
// 統計
// ============================================================

/**
 * 取得 protocol 統計資訊
 * @returns {object}
 */
function getStats() {
  const protocols = loadAllProtocols();
  const archiveFiles = fs.existsSync(ARCHIVE_DIR)
    ? fs.readdirSync(ARCHIVE_DIR).filter(f => f.endsWith('.json'))
    : [];

  const byCategory = {};
  const bySeverity = {};
  let totalTriggers = 0;
  let drafts = 0;

  for (const p of protocols) {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    bySeverity[p.severity] = (bySeverity[p.severity] || 0) + 1;
    totalTriggers += p.trigger_count || 0;
    if (p.draft) drafts++;
  }

  return {
    active: protocols.length,
    archived: archiveFiles.length,
    drafts,
    total_triggers: totalTriggers,
    by_category: byCategory,
    by_severity: bySeverity
  };
}

// ============================================================
// 匯出
// ============================================================

module.exports = {
  PROTOCOLS_DIR,
  ARCHIVE_DIR,
  DECAY_THRESHOLD_DAYS,
  MAX_INJECTION_COUNT,
  MATCH_THRESHOLD,
  VALID_CATEGORIES,
  VALID_SEVERITIES,
  validateProtocol,
  loadAllProtocols,
  loadProtocol,
  saveProtocol,
  matchProtocols,
  formatForSonnet,
  formatForHaiku,
  formatForPlanInjection,
  recordUsage,
  extractFromFailure,
  runDecay,
  getStats
};
