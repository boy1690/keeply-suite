#!/usr/bin/env node
/**
 * Fossil Engine - M7 失敗化石紀錄系統
 *
 * 從歷史失敗萃取可重用問題，在未來 SDD 規劃階段自動注入。
 * 柱 3 波普爾（早點證偽）的長期學習機制。
 *
 * Architecture:
 * - fossils/*.json: 個別 fossil 檔案（每個失敗一檔）
 * - fossils/_archive/: 衰減後歸檔
 * - fossil-engine.js: CRUD + 匹配 + 衰減邏輯
 *
 * @version 1.0.0
 * @since 2026-03-24
 * @module M7
 */

const fs = require('fs');
const path = require('path');

// Fossil 存儲目錄
const FOSSILS_DIR = path.join(__dirname, '..', '..', 'memory', 'fossils');
const ARCHIVE_DIR = path.join(FOSSILS_DIR, '_archive');

// 衰減閾值（天）
const DECAY_THRESHOLD_DAYS = 90;

// ============================================================
// Schema 驗證
// ============================================================

const REQUIRED_FIELDS = [
  'id', 'source_version', 'failure_type',
  'reusable_question', 'trigger_keywords', 'injection_point'
];

const VALID_FAILURE_TYPES = [
  'stale_closure',        // V139.6: closure 抓到過期值
  'missing_consumer',     // V95.1: 遺漏消費路徑
  'false_assumption',     // V95.37: 假設不成立但靜默失敗
  'orphan_module',        // 025: 元件做好但沒接上
  'css_assumption',       // 027: CSS 排列方向假設錯誤
  'schema_drift',         // IPC: Rust/TS 型別欄位名不符
  'lifecycle_leak',       // React: effect 未 cleanup
  'integration_gap',      // 膠水層遺漏
  'ambiguity_leak',       // Gap 未解決就開工
  'other'
];

const VALID_INJECTION_POINTS = [
  'specify',    // Block 1: 規格階段
  'plan',       // Block 2: 技術規劃
  'checklist',  // Block 3: 品質檢查
  'tasks',      // Block 3: 任務分解
  'implement',  // Block 3.5: 實作階段
  'check'       // Block 4: 驗證階段
];

/**
 * 驗證 fossil 物件是否符合 schema
 * @param {object} fossil
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateFossil(fossil) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!fossil[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (fossil.failure_type && !VALID_FAILURE_TYPES.includes(fossil.failure_type)) {
    errors.push(`Invalid failure_type: ${fossil.failure_type}. Valid: ${VALID_FAILURE_TYPES.join(', ')}`);
  }

  if (fossil.injection_point && !VALID_INJECTION_POINTS.includes(fossil.injection_point)) {
    errors.push(`Invalid injection_point: ${fossil.injection_point}. Valid: ${VALID_INJECTION_POINTS.join(', ')}`);
  }

  if (fossil.trigger_keywords && !Array.isArray(fossil.trigger_keywords)) {
    errors.push('trigger_keywords must be an array');
  }

  if (fossil.trigger_keywords && fossil.trigger_keywords.length === 0) {
    errors.push('trigger_keywords must have at least one entry');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// CRUD 操作
// ============================================================

/**
 * 讀取所有活躍 fossils（不含 _archive）
 * @returns {object[]}
 */
function loadAllFossils() {
  if (!fs.existsSync(FOSSILS_DIR)) return [];

  const files = fs.readdirSync(FOSSILS_DIR)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'));

  const fossils = [];
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(FOSSILS_DIR, file), 'utf-8');
      const fossil = JSON.parse(content);
      fossils.push(fossil);
    } catch {
      // 跳過無法解析的檔案
    }
  }

  return fossils;
}

/**
 * 讀取單一 fossil
 * @param {string} id - fossil ID
 * @returns {object|null}
 */
function loadFossil(id) {
  const filePath = path.join(FOSSILS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * 儲存 fossil（新增或更新）
 * @param {object} fossil
 * @returns {{ success: boolean, error?: string }}
 */
function saveFossil(fossil) {
  const validation = validateFossil(fossil);
  if (!validation.valid) {
    return { success: false, error: validation.errors.join('; ') };
  }

  // 確保目錄存在
  if (!fs.existsSync(FOSSILS_DIR)) {
    fs.mkdirSync(FOSSILS_DIR, { recursive: true });
  }

  // 補充預設欄位
  if (!fossil.created_at) {
    fossil.created_at = new Date().toISOString().split('T')[0];
  }
  if (fossil.trigger_count === undefined) {
    fossil.trigger_count = 0;
  }
  if (!fossil.last_triggered) {
    fossil.last_triggered = null;
  }
  if (!fossil.false_positive_estimate) {
    fossil.false_positive_estimate = 'MEDIUM';
  }

  const filePath = path.join(FOSSILS_DIR, `${fossil.id}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(fossil, null, 2), 'utf-8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * 刪除 fossil（硬刪除）
 * @param {string} id
 * @returns {boolean}
 */
function deleteFossil(id) {
  const filePath = path.join(FOSSILS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return false;

  try {
    fs.unlinkSync(filePath);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// 匹配邏輯（用於 speckit.plan 注入）
// ============================================================

/**
 * 從 Impact Map 和 spec 內容匹配相關 fossils
 *
 * @param {object} context - 匹配上下文
 * @param {string[]} context.filePaths - Impact Map 中的檔案路徑
 * @param {string[]} context.entities - Key Entities 名稱
 * @param {string} context.specText - spec.md 全文（用於關鍵字搜尋）
 * @param {string} [context.injectionPoint='plan'] - 目前的 SDD 階段
 * @returns {Array<{ fossil: object, matchedKeywords: string[], score: number }>}
 */
function matchFossils(context) {
  const { filePaths = [], entities = [], specText = '', injectionPoint = 'plan' } = context;
  const allFossils = loadAllFossils();

  // 建立搜尋文本池（全部轉小寫）
  const searchPool = [
    ...filePaths.map(p => p.toLowerCase()),
    ...entities.map(e => e.toLowerCase()),
    specText.toLowerCase()
  ].join(' ');

  const matches = [];

  for (const fossil of allFossils) {
    // 階段過濾：只注入匹配階段的 fossil
    if (fossil.injection_point !== injectionPoint) continue;

    const matchedKeywords = [];
    for (const keyword of fossil.trigger_keywords) {
      if (searchPool.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    if (matchedKeywords.length > 0) {
      // 得分 = 匹配比例 * trigger_count 加成
      const ratio = matchedKeywords.length / fossil.trigger_keywords.length;
      const historyBonus = Math.min(fossil.trigger_count * 0.1, 0.5);
      const score = ratio + historyBonus;

      matches.push({ fossil, matchedKeywords, score });
    }
  }

  // 依分數降序排列
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * 記錄 fossil 被觸發（更新 last_triggered 和 trigger_count）
 * @param {string} id - fossil ID
 */
function recordTrigger(id) {
  const fossil = loadFossil(id);
  if (!fossil) return;

  fossil.last_triggered = new Date().toISOString().split('T')[0];
  fossil.trigger_count = (fossil.trigger_count || 0) + 1;
  saveFossil(fossil);
}

// ============================================================
// 衰減邏輯
// ============================================================

/**
 * 執行衰減：超過閾值天數未觸發的 fossil 移到 _archive/
 * @returns {{ archived: string[], kept: string[] }}
 */
function runDecay() {
  const fossils = loadAllFossils();
  const now = Date.now();
  const thresholdMs = DECAY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  const archived = [];
  const kept = [];

  // 確保 _archive 存在
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }

  for (const fossil of fossils) {
    // 判斷最後活動時間（last_triggered 或 created_at）
    const lastActive = fossil.last_triggered || fossil.created_at;
    if (!lastActive) {
      kept.push(fossil.id);
      continue;
    }

    const lastActiveMs = new Date(lastActive).getTime();
    const daysSinceActive = (now - lastActiveMs) / (24 * 60 * 60 * 1000);

    if (daysSinceActive > DECAY_THRESHOLD_DAYS) {
      // 移到 _archive
      const srcPath = path.join(FOSSILS_DIR, `${fossil.id}.json`);
      const dstPath = path.join(ARCHIVE_DIR, `${fossil.id}.json`);

      try {
        fossil.archived_at = new Date().toISOString().split('T')[0];
        fossil.archived_reason = `${Math.floor(daysSinceActive)} days since last trigger (threshold: ${DECAY_THRESHOLD_DAYS})`;
        fs.writeFileSync(dstPath, JSON.stringify(fossil, null, 2), 'utf-8');
        fs.unlinkSync(srcPath);
        archived.push(fossil.id);
      } catch {
        kept.push(fossil.id);
      }
    } else {
      kept.push(fossil.id);
    }
  }

  return { archived, kept };
}

// ============================================================
// 格式化（用於 plan 注入）
// ============================================================

/**
 * 將匹配的 fossils 格式化為 plan.md 風險評估段落
 * @param {Array<{ fossil: object, matchedKeywords: string[], score: number }>} matches
 * @returns {string}
 */
function formatForPlanInjection(matches) {
  if (matches.length === 0) return '';

  const lines = [];
  lines.push('## Failure Fossil Warnings (M7)');
  lines.push('');
  lines.push('> Auto-injected from `.claude/memory/fossils/`. These questions come from past failures with similar patterns.');
  lines.push('');
  lines.push('| # | Source | Question | Matched Keywords |');
  lines.push('|---|--------|----------|-----------------|');

  for (let i = 0; i < matches.length; i++) {
    const { fossil, matchedKeywords } = matches[i];
    const kwStr = matchedKeywords.map(k => `\`${k}\``).join(', ');
    lines.push(`| F-${i + 1} | ${fossil.source_version} (${fossil.failure_type}) | ${fossil.reusable_question} | ${kwStr} |`);
  }

  lines.push('');
  lines.push('**Action**: Answer each question above in the Architecture section. If you cannot answer confidently, consider a spike (M5).');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// 萃取（用於 retrospective-hook 自動建立 fossil）
// ============================================================

/**
 * 從 check-report 萃取 fossil 候選
 *
 * @param {object} context
 * @param {string} context.specId - spec 編號（如 002-git-engine）
 * @param {string} context.verdict - ITERATE 或 bug-fix
 * @param {string} context.checkReport - check-report.md 內容
 * @param {string[]} context.affectedFiles - 修改過的檔案列表
 * @returns {object|null} - fossil 候選或 null
 */
function extractFossilCandidate(context) {
  const { specId, verdict, checkReport, affectedFiles = [] } = context;
  if (!specId || !checkReport) return null;

  // 從 check-report 提取 GAP 項目
  const gapMatches = checkReport.match(/GAP:([^\n]+)/g);
  if (!gapMatches || gapMatches.length === 0) return null;

  // 取最嚴重的 GAP 作為 fossil 基礎
  const primaryGap = gapMatches[0].replace('GAP:', '').trim();

  // 推斷 failure_type
  let failureType = 'other';
  if (/closure|stale|debounce/i.test(primaryGap)) failureType = 'stale_closure';
  else if (/consumer|path|route/i.test(primaryGap)) failureType = 'missing_consumer';
  else if (/assum|expect|should/i.test(primaryGap)) failureType = 'false_assumption';
  else if (/orphan|wire|mount|toolbar/i.test(primaryGap)) failureType = 'orphan_module';
  else if (/css|layout|flex|grid/i.test(primaryGap)) failureType = 'css_assumption';
  else if (/schema|column|field|migration/i.test(primaryGap)) failureType = 'schema_drift';
  else if (/cleanup|effect|observer|listener/i.test(primaryGap)) failureType = 'lifecycle_leak';

  // 推斷 trigger_keywords（從受影響檔案提取模組名和關鍵字）
  const keywords = new Set();
  for (const filePath of affectedFiles) {
    // 取檔名（不含副檔名）
    const basename = path.basename(filePath, path.extname(filePath));
    if (basename.length > 2) keywords.add(basename);

    // 取目錄名
    const dirName = path.basename(path.dirname(filePath));
    if (dirName.length > 2 && dirName !== 'src') keywords.add(dirName);
  }

  // 從 GAP 描述提取關鍵字
  const gapWords = primaryGap.split(/[\s,;:()[\]{}]+/).filter(w => w.length > 3);
  for (const word of gapWords.slice(0, 5)) {
    keywords.add(word.toLowerCase());
  }

  if (keywords.size === 0) return null;

  // 推斷 injection_point
  let injectionPoint = 'plan';
  if (/spec|requirement|acceptance/i.test(primaryGap)) injectionPoint = 'specify';
  else if (/task|implement/i.test(primaryGap)) injectionPoint = 'tasks';
  else if (/check|verify|test/i.test(primaryGap)) injectionPoint = 'check';

  const id = `fossil-${specId}-${Date.now()}`;

  return {
    id,
    source_version: specId,
    failure_type: failureType,
    reusable_question: `[Auto-extracted from ${verdict}] ${primaryGap} — 下次遇到類似模式時，先問：這個假設真的驗證過了嗎？`,
    trigger_keywords: Array.from(keywords),
    injection_point: injectionPoint,
    false_positive_estimate: 'MEDIUM',
    created_at: new Date().toISOString().split('T')[0],
    last_triggered: null,
    trigger_count: 0,
    auto_extracted: true,
    extraction_context: {
      verdict,
      primary_gap: primaryGap,
      gap_count: gapMatches.length
    }
  };
}

// ============================================================
// 統計
// ============================================================

/**
 * 取得 fossil 統計資訊
 * @returns {object}
 */
function getStats() {
  const fossils = loadAllFossils();
  const archiveFiles = fs.existsSync(ARCHIVE_DIR)
    ? fs.readdirSync(ARCHIVE_DIR).filter(f => f.endsWith('.json'))
    : [];

  const byType = {};
  const byInjectionPoint = {};
  let totalTriggers = 0;

  for (const f of fossils) {
    byType[f.failure_type] = (byType[f.failure_type] || 0) + 1;
    byInjectionPoint[f.injection_point] = (byInjectionPoint[f.injection_point] || 0) + 1;
    totalTriggers += f.trigger_count || 0;
  }

  return {
    active: fossils.length,
    archived: archiveFiles.length,
    total_triggers: totalTriggers,
    by_type: byType,
    by_injection_point: byInjectionPoint
  };
}

// ============================================================
// M10: Fossil → Protocol 升級
// ============================================================

/**
 * failure_type → protocol category 映射
 */
const FAILURE_TO_CATEGORY = {
  stale_closure: 'react-state',
  missing_consumer: 'refactor-safety',
  false_assumption: 'assumption-verify',
  orphan_module: 'integration-wire',
  css_assumption: 'css-layout',
  schema_drift: 'assumption-verify',
  lifecycle_leak: 'react-state',
  integration_gap: 'integration-wire',
  ambiguity_leak: 'assumption-verify',
  other: 'other'
};

/**
 * 把 fossil 升級為 behavioral protocol 草稿
 *
 * 轉換邏輯：
 * - fossil.reusable_question → prompt_block 的 CHECK 步驟（草稿）
 * - fossil.trigger_keywords → trigger.keywords
 * - fossil.prevention_pattern → prompt_block 的 DO 段落（草稿）
 * - fossil.failure_type → category 映射
 *
 * 產出 draft: true — 需要 Opus 審核並擴充為完整 STOP → CHECK → DO/DON'T 協議。
 *
 * @param {string} fossilId
 * @returns {object|null} protocol 候選
 */
function promoteToProtocol(fossilId) {
  const fossil = loadFossil(fossilId);
  if (!fossil) return null;

  const category = FAILURE_TO_CATEGORY[fossil.failure_type] || 'other';
  const severity = fossil.trigger_count >= 3 ? 'HIGH' : 'MEDIUM';

  const promptBlock = [
    `## PROTOCOL: [DRAFT — needs Opus review] ${fossil.failure_type} Guard`,
    '',
    `TRIGGER: ${fossil.description || 'Similar pattern to past failure'}`,
    '',
    'STOP — A past failure (fossil) matched this pattern:',
    '',
    `Question: ${fossil.reusable_question}`,
    '',
    fossil.prevention_pattern
      ? `Prevention: ${fossil.prevention_pattern}`
      : '',
    '',
    '[TODO: Opus should expand this into full STOP → CHECK → DO/DON\'T format]'
  ].filter(Boolean).join('\n');

  const protocolId = `BP-from-${fossilId}`;

  return {
    id: protocolId,
    name: `[Auto] ${fossil.failure_type}: ${(fossil.description || '').slice(0, 50)}`,
    category,
    severity,
    source: {
      type: 'fossil',
      ref: fossilId
    },
    trigger: {
      keywords: fossil.trigger_keywords || [],
      file_patterns: [],
      code_patterns: []
    },
    prompt_block: promptBlock,
    created_at: new Date().toISOString().split('T')[0],
    trigger_count: 0,
    last_used: null,
    effectiveness: null,
    draft: true,
    auto_extracted: true
  };
}

// ============================================================
// 匯出
// ============================================================

module.exports = {
  FOSSILS_DIR,
  ARCHIVE_DIR,
  DECAY_THRESHOLD_DAYS,
  VALID_FAILURE_TYPES,
  VALID_INJECTION_POINTS,
  FAILURE_TO_CATEGORY,
  validateFossil,
  loadAllFossils,
  loadFossil,
  saveFossil,
  deleteFossil,
  matchFossils,
  recordTrigger,
  runDecay,
  formatForPlanInjection,
  extractFossilCandidate,
  promoteToProtocol,
  getStats
};
