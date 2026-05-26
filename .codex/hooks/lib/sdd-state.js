#!/usr/bin/env node
/**
 * SDD State Manager — 共用 SDD 工作流執行狀態模組
 *
 * 供三層 hook 共用：
 * - Layer 1: intent-gate.js (UserPromptSubmit) — 引導
 * - Layer 2: speckit-guard.js (PreToolUse Edit/Write) — 漸進式攔截
 * - Layer 3: stop-hook.js (Stop) — 收尾 + renew 提醒
 *
 * Layer 4: speckit-lifecycle.js (UserPromptSubmit) — Flow Continuity Alert (V237)
 *
 * @version 2.2.0
 * @since 2026-03-17
 * @updated 2026-03-25 - V237: Flow Tracker (Anti-Amnesia)
 * @updated 2026-03-28 - IBV: Intent-Build-Verify flow support
 * @updated 2026-03-28 - IBV v1.1: LoopGuard 三閾值收斂 + 基線比對 + 震盪偵測
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 可調閾值
// ============================================================

const CONFIG = {
  /** 所有類型：warn N-1 次，第 N 次 block */
  BLOCK_THRESHOLD: 3,
  /** 自動 bypass 的分支名模式 */
  BYPASS_BRANCH_PATTERNS: [/^hotfix\//, /^fix\//],
  /** prompt 中的 bypass 關鍵字 */
  BYPASS_KEYWORD: 'SDD-BYPASS',
  /** 判定為 SDD 規模工作的關鍵字 */
  SDD_SCALE_KEYWORDS: [
    '新功能', '實作功能', '新增功能', '新feature',
    'new feature', 'implement feature', 'add feature'
  ],
  /** /speckit.implement 偵測關鍵字 */
  IMPLEMENT_COMMAND: '/speckit.implement'
};

// ============================================================
// 路徑常數
// ============================================================

const STATE_FILE = path.join(__dirname, '..', '..', 'metrics', 'sdd-state.json');
const SPECS_DIR = path.join(process.cwd(), 'specs');

const DEFAULT_STATE = {
  version: 1,
  sessionEdits: [],
  warningCounts: {},
  bypassLog: [],
  implementActive: false,
  debugActive: false
};

// ============================================================
// State 持久化
// ============================================================

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return { ...DEFAULT_STATE, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) };
    }
  } catch { /* corrupted → reset */ }
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

// ============================================================
// Phase 偵測
// ============================================================

/**
 * 從檔案存在性偵測 spec 目前階段
 * @param {string} specDir - spec 目錄絕對路徑
 * @returns {string|null} phase 名稱
 */
function detectSpecPhase(specDir) {
  // 支援 bugfix.md 作為 spec 檔案（與 spec.md 等價）
  const bugfixPath = path.join(specDir, 'bugfix.md');
  const specPath = fs.existsSync(bugfixPath)
    ? bugfixPath
    : path.join(specDir, 'spec.md');
  const discoveryPath = path.join(specDir, 'discovery.md');
  const researchPath = path.join(specDir, 'research.md');

  // discovery.md 存在但 spec/bugfix.md 不存在 → 檢查 Discovery/Research/VMD 狀態
  if (fs.existsSync(discoveryPath) && !fs.existsSync(specPath)) {
    // research.md 存在 → Research 階段已完成，等待 specify
    if (fs.existsSync(researchPath)) return 'researched';

    try {
      const content = fs.readFileSync(discoveryPath, 'utf-8');
      if (/## 模組拆分/.test(content)) {
        // VMD active: check if any modules still pending (🟡) or generated (🔵)
        if (/\u{1F7E1}|\u{1F535}/u.test(content)) return 'vmd_pending';
        // All confirmed (✅ only) → ready for research
      }
    } catch { /* fallthrough to discovered */ }
    return 'discovered';
  }

  if (!fs.existsSync(specPath)) return null;

  const specContent = fs.readFileSync(specPath, 'utf-8');

  // 檢查是否已 renew（status: implemented）
  if (/^status:\s*implemented/m.test(specContent)) return 'renewed';

  const planPath = path.join(specDir, 'plan.md');
  const tasksPath = path.join(specDir, 'tasks.md');
  const hasPlan = fs.existsSync(planPath);
  const hasTasks = fs.existsSync(tasksPath);

  // 無 plan → 檢查是否需要 clarify
  if (!hasPlan) {
    // Exclude backtick-wrapped template instructions (e.g. `[NEEDS CLARIFICATION: ...]`)
    const strippedContent = specContent.replace(/`[^`]*`/g, '');
    const hasClarificationMarkers = /\[NEEDS CLARIFICATION/i.test(strippedContent);
    return hasClarificationMarkers ? 'needs_clarify' : 'specify';
  }

  // 有 plan 無 tasks
  if (!hasTasks) return 'plan';

  // 有 tasks → 檢查 checklist
  const checklistDir = path.join(specDir, 'checklists');
  const hasChecklist = hasNonEmptyChecklist(checklistDir);
  if (!hasChecklist) return 'needs_checklist';

  // 有 tasks + checklist → 檢查任務完成度
  const tasksContent = fs.readFileSync(tasksPath, 'utf-8');
  const unchecked = (tasksContent.match(/- \[ \]/g) || []).length;
  const checked = (tasksContent.match(/- \[x\]/gi) || []).length;

  if (unchecked === 0 && checked > 0) return 'implement_done';
  return 'tasks';
}

/**
 * 檢查 checklists/ 目錄是否有實質內容（非僅 .gitkeep）
 */
function hasNonEmptyChecklist(checklistDir) {
  if (!fs.existsSync(checklistDir)) return false;
  try {
    const files = fs.readdirSync(checklistDir);
    return files.some(f => f.endsWith('.md') && f !== '.gitkeep');
  } catch {
    return false;
  }
}

// ============================================================
// Spec ↔ File 映射
// ============================================================

/**
 * SDD_TRIGGERS 靜態映射（與 speckit-guard.js 一致）
 */
const SDD_TRIGGERS = {
  'src/components/print/': { specs: ['005-print'], label: '列印系統' },
  'src/components/charts/': { specs: [], label: '圖表元件' },
  'src/lib/export/': { specs: [], label: '匯出功能' },
  'src/lib/print/': { specs: ['005-print'], label: '列印座標轉換' },
  'src/components/ai-assistant/': { specs: ['003-classification'], label: '分類系統' }
};

/**
 * 根據檔案路徑找到對應的 spec
 * @param {string} filePath
 * @returns {{ id: string, dir: string, label: string } | null}
 */
function findSpecForFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');

  // 1. 靜態 SDD_TRIGGERS 查詢
  for (const [trigger, config] of Object.entries(SDD_TRIGGERS)) {
    if (normalizedPath.includes(trigger)) {
      // 找到第一個實際存在的 spec
      for (const specName of config.specs) {
        const specDir = path.join(SPECS_DIR, specName);
        if (fs.existsSync(path.join(specDir, 'spec.md')) || fs.existsSync(path.join(specDir, 'bugfix.md'))) {
          return { id: specName, dir: specDir, label: config.label };
        }
      }
      // 有 trigger 但無 spec → 回傳 label（供提示用）
      return { id: null, dir: null, label: config.label };
    }
  }

  return null;
}

// TTL cache for findActiveSpecs (avoid repeated directory scans within same process)
let _activeSpecsCache = null;
let _activeSpecsCacheTime = 0;
const CACHE_TTL_MS = 5000; // 5 seconds

/**
 * 掃描所有進行中的 specs（含 5 秒 TTL cache）
 * @returns {Array<{ id: string, dir: string, phase: string }>}
 */
function findActiveSpecs() {
  const now = Date.now();
  if (_activeSpecsCache && (now - _activeSpecsCacheTime) < CACHE_TTL_MS) {
    return _activeSpecsCache;
  }
  if (!fs.existsSync(SPECS_DIR)) return [];
  const results = [];

  try {
    const entries = fs.readdirSync(SPECS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'archive' || entry.name === '_archive' || entry.name.startsWith('.')) continue;
      const specDir = path.join(SPECS_DIR, entry.name);

      // Check if this is a module directory (M1-*, M2-*, ..., infra)
      if (/^(M\d|infra)/.test(entry.name)) {
        try {
          const subEntries = fs.readdirSync(specDir, { withFileTypes: true });
          for (const subEntry of subEntries) {
            if (!subEntry.isDirectory()) continue;
            const subSpecDir = path.join(specDir, subEntry.name);
            const subPhase = detectSpecPhase(subSpecDir);
            if (subPhase && subPhase !== 'renewed') {
              results.push({ id: subEntry.name, dir: subSpecDir, phase: subPhase });
            }
          }
        } catch { /* ignore module dir scan errors */ }
        continue;
      }

      // Root-level spec directory
      const phase = detectSpecPhase(specDir);
      if (phase && phase !== 'renewed') {
        results.push({ id: entry.name, dir: specDir, phase });
      }
    }
  } catch { /* ignore scan errors */ }

  _activeSpecsCache = results;
  _activeSpecsCacheTime = Date.now();
  return results;
}

// ============================================================
// Spec 名稱查詢（含 renewed，供 /sdd debug 用）
// ============================================================

/**
 * 根據名稱或 ID 找 spec（含 renewed/implemented，不被 findActiveSpecs 過濾）
 * @param {string} nameOrId - e.g. "boq-card-nest" or "031-boq-card-nest"
 * @returns {{ id: string, dir: string, phase: string } | null}
 */
function findSpecByName(nameOrId) {
  if (!fs.existsSync(SPECS_DIR)) return null;
  const normalized = nameOrId.toLowerCase().replace(/^\d+-/, '');

  const candidates = [];
  try {
    const entries = fs.readdirSync(SPECS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'archive' || entry.name === '_archive' || entry.name.startsWith('.')) continue;
      const specDir = path.join(SPECS_DIR, entry.name);

      if (/^(M\d|infra)/.test(entry.name)) {
        try {
          const subEntries = fs.readdirSync(specDir, { withFileTypes: true });
          for (const sub of subEntries) {
            if (sub.isDirectory()) {
              candidates.push({ id: sub.name, dir: path.join(specDir, sub.name) });
            }
          }
        } catch { /* ignore */ }
        continue;
      }

      candidates.push({ id: entry.name, dir: specDir });
    }
  } catch { return null; }

  // Fuzzy match: exact id > slug match > partial
  const match = candidates.find(c => c.id === nameOrId)
    || candidates.find(c => c.id.replace(/^\d+-/, '').toLowerCase() === normalized)
    || candidates.find(c => c.id.toLowerCase().includes(normalized));

  if (!match) return null;
  const phase = detectSpecPhase(match.dir);
  return { id: match.id, dir: match.dir, phase: phase || 'unknown' };
}

// ============================================================
// SDD Scale 判斷
// ============================================================

/**
 * 判斷 prompt 是否為 SDD 規模工作
 * @param {string} prompt
 * @returns {boolean}
 */
function isSddScale(prompt) {
  const lower = prompt.toLowerCase();

  // 含 /speckit. 指令 → SDD
  if (lower.includes('/speckit.')) return true;

  // 含 SDD 規模關鍵字
  return CONFIG.SDD_SCALE_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

/**
 * 檢查 prompt 是否包含 SDD-BYPASS
 * @param {string} prompt
 * @returns {string|null} bypass 原因，或 null
 */
function checkBypass(prompt) {
  const match = prompt.match(/SDD-BYPASS:\s*(.+)/i);
  return match ? match[1].trim() : null;
}

/**
 * 檢查 prompt 是否為 /speckit.implement 指令
 * @param {string} prompt
 * @returns {boolean}
 */
function isImplementCommand(prompt) {
  return prompt.includes(CONFIG.IMPLEMENT_COMMAND);
}

// ============================================================
// Hotfix 分支偵測
// ============================================================

/**
 * 檢查當前 git 分支是否為 hotfix 類型
 * @returns {boolean}
 */
function isHotfixBranch() {
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git branch --show-current', {
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 3000
    }).trim();
    return CONFIG.BYPASS_BRANCH_PATTERNS.some(pattern => pattern.test(branch));
  } catch {
    return false;
  }
}

// ============================================================
// Warning 計數（漸進式 warn→block）
// ============================================================

/**
 * 記錄一次 warning，回傳累計次數
 * @param {string} key - warning 鍵值（如 'no_spec:分類系統'）
 * @param {string} reason - 原因描述
 * @returns {number} 累計警告次數
 */
function recordWarning(key, reason) {
  const state = loadState();
  if (!state.warningCounts[key]) {
    state.warningCounts[key] = { count: 0, reason, firstAt: new Date().toISOString() };
  }
  state.warningCounts[key].count += 1;
  state.warningCounts[key].lastAt = new Date().toISOString();
  saveState(state);
  return state.warningCounts[key].count;
}

/**
 * 取得某個 key 的當前警告次數
 * @param {string} key
 * @returns {number}
 */
function getWarningCount(key) {
  const state = loadState();
  return state.warningCounts[key]?.count || 0;
}

// ============================================================
// Session Edit 追蹤
// ============================================================

/**
 * 記錄本 session 編輯過的檔案（供 Layer 3 用）
 * @param {string} filePath
 */
function recordEdit(filePath) {
  const state = loadState();
  const normalized = filePath.replace(/\\/g, '/');
  if (!state.sessionEdits.includes(normalized)) {
    state.sessionEdits.push(normalized);
    saveState(state);
  }
}

// ============================================================
// Bypass 審計
// ============================================================

/**
 * 記錄一次 SDD-BYPASS
 * @param {string} reason
 */
function logBypass(reason) {
  const state = loadState();
  state.bypassLog.push({ reason, at: new Date().toISOString() });
  saveState(state);
}

// ============================================================
// Implement 模式
// ============================================================

/**
 * 設定 /speckit.implement 活躍狀態
 * @param {boolean} active
 */
function setImplementActive(active) {
  const state = loadState();
  state.implementActive = active;
  saveState(state);
}

/**
 * 檢查是否正在 /speckit.implement 執行中
 * @returns {boolean}
 */
function isImplementActive() {
  const state = loadState();
  return state.implementActive === true;
}

// ============================================================
// Debug Shortcut 模式（供 /sdd debug 用）
// ============================================================

/**
 * 設定 /sdd debug 活躍狀態（供 speckit-guard bypass）
 * @param {boolean} active
 */
function setDebugActive(active) {
  const state = loadState();
  state.debugActive = active;
  saveState(state);
}

/**
 * 檢查是否正在 /sdd debug 執行中
 * @returns {boolean}
 */
function isDebugActive() {
  const state = loadState();
  return state.debugActive === true;
}

// ============================================================
// M3: Ambiguity Hard Gate — Gap/Ambiguity 偵測
// ============================================================

/**
 * 嚴重度分類：CHK 項目的 category → severity 映射
 * Completeness, Scenario, Boundary = HIGH（影響資料模型或元件架構）
 * Clarity, Consistency = MEDIUM（影響可讀性但不阻擋實作）
 */
const GAP_SEVERITY = {
  'Completeness': 'HIGH',
  'Scenario': 'HIGH',
  'Boundary': 'HIGH',
  'Dependencies': 'HIGH',
  'Clarity': 'MEDIUM',
  'Consistency': 'MEDIUM',
  'AC Quality': 'MEDIUM',
  'NFR': 'MEDIUM',
  'Constitution': 'LOW'
};

/**
 * 掃描 spec 目錄的 checklists/ 找未解決的 [Gap] 和 [Ambiguity] 標記
 * @param {string} specDir - spec 目錄絕對路徑
 * @returns {{ totalGaps: number, highGaps: number, gaps: Array<{ chk: string, category: string, severity: string, description: string, file: string }> }}
 */
function detectUnresolvedGaps(specDir) {
  const checklistDir = path.join(specDir, 'checklists');
  const result = { totalGaps: 0, highGaps: 0, gaps: [] };

  if (!fs.existsSync(checklistDir)) return result;

  let files;
  try {
    files = fs.readdirSync(checklistDir).filter(f => f.endsWith('.md'));
  } catch {
    return result;
  }

  for (const file of files) {
    const filePath = path.join(checklistDir, file);
    let content;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }

    const lines = content.split('\n');
    for (const line of lines) {
      // 匹配 unchecked items with [Gap] or [Ambiguity] marker
      // 格式: - [ ] CHK002 [Category] Description [Gap]
      const gapMatch = line.match(/^- \[ \]\s+(CHK\d+)\s+\[(\w[\w\s]*?)\].*\[(Gap|Ambiguity)\]/i);
      if (gapMatch) {
        const [, chk, category, marker] = gapMatch;
        const severity = GAP_SEVERITY[category.trim()] || 'MEDIUM';
        result.totalGaps++;
        if (severity === 'HIGH') result.highGaps++;
        result.gaps.push({
          chk,
          category: category.trim(),
          severity,
          marker: marker,
          description: line.replace(/^- \[ \]\s+/, '').trim(),
          file
        });
      }
    }
  }

  return result;
}

/**
 * 產生 Ambiguity Gate Report 文字
 * @param {{ totalGaps: number, highGaps: number, gaps: Array }} gapResult
 * @returns {string}
 */
function formatGateReport(gapResult) {
  if (gapResult.totalGaps === 0) return '';

  const lines = [];
  lines.push('');
  lines.push('=== M3 Ambiguity Hard Gate ===');
  lines.push('');

  if (gapResult.highGaps > 0) {
    lines.push(`BLOCKED: ${gapResult.highGaps} HIGH-severity gap(s) unresolved`);
    lines.push('');
    lines.push('Unresolved HIGH Gaps:');
    for (const gap of gapResult.gaps.filter(g => g.severity === 'HIGH')) {
      lines.push(`  ${gap.chk} [${gap.category}] [${gap.marker}] — ${gap.file}`);
    }
    lines.push('');
    lines.push('Action required:');
    lines.push('  1. Resolve each [Gap] in the checklist (update spec.md with design decisions)');
    lines.push('  2. Re-run /speckit.checklist to regenerate');
    lines.push('  3. Then proceed to /speckit.tasks');
    lines.push('');
    lines.push('Or bypass: include "AMBIGUITY-BYPASS: <reason>" in your prompt');
  } else {
    lines.push(`Advisory: ${gapResult.totalGaps} MEDIUM/LOW gap(s) found (non-blocking)`);
    for (const gap of gapResult.gaps) {
      lines.push(`  ${gap.chk} [${gap.category}] [${gap.marker}] — ${gap.file}`);
    }
    lines.push('');
    lines.push('Proceeding to /speckit.tasks (MEDIUM gaps are non-blocking)');
  }
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// M4: Runtime Contract Verification — FAIL 偵測
// ============================================================

/**
 * 掃描 spec 目錄的 plan.md 找 Runtime Contract Verification 表中的 FAIL 項目
 * @param {string} specDir - spec 目錄絕對路徑
 * @returns {{ totalFails: number, fails: Array<{ id: string, assumption: string, detail: string }>, missing: boolean }}
 */
function detectContractFailures(specDir) {
  const planPath = path.join(specDir, 'plan.md');
  const result = { totalFails: 0, fails: [], missing: false };

  if (!fs.existsSync(planPath)) return result;

  let content;
  try {
    content = fs.readFileSync(planPath, 'utf-8');
  } catch {
    return result;
  }

  // Find ## Runtime Contract Verification section
  const sectionMatch = content.match(
    /## Runtime Contract Verification\s*\n([\s\S]*?)(?=\n## |\n---\s*$)/m
  );
  if (!sectionMatch) {
    // Section doesn't exist — legacy plan or non-stateful spec, skip silently
    result.missing = true;
    return result;
  }

  const section = sectionMatch[1];
  const lines = section.split('\n');

  for (const line of lines) {
    // Match table rows containing FAIL (with or without ❌ emoji)
    const failMatch = line.match(
      /\|\s*(C-\d+)\s*\|(.+?)\|(.+?)\|(.+?)\|\s*(?:❌\s*)?FAIL\b(.*)\|?/
    );
    if (failMatch) {
      result.totalFails++;
      result.fails.push({
        id: failMatch[1].trim(),
        assumption: failMatch[2].trim(),
        source: failMatch[3].trim(),
        detail: (failMatch[5] || '').replace(/\|$/, '').trim()
      });
    }
  }

  return result;
}

/**
 * 產生 Contract Verification Gate Report 文字
 * @param {{ totalFails: number, fails: Array, missing: boolean }} contractResult
 * @returns {string}
 */
function formatContractReport(contractResult) {
  if (contractResult.totalFails === 0) return '';

  const lines = [];
  lines.push('');
  lines.push('=== M4 Contract Verification Gate ===');
  lines.push('');
  lines.push(`BLOCKED: ${contractResult.totalFails} contract(s) FAILED verification`);
  lines.push('');
  lines.push('Failed Contracts:');
  for (const fail of contractResult.fails) {
    const detail = fail.detail ? ` — ${fail.detail}` : '';
    lines.push(`  ${fail.id}: ${fail.assumption}${detail}`);
  }
  lines.push('');
  lines.push('Action required:');
  lines.push('  1. Update spec.md or plan.md to match verified reality');
  lines.push('  2. Re-run /speckit.plan to regenerate Contract Verification');
  lines.push('  3. Then proceed to /speckit.tasks');
  lines.push('');
  lines.push('Or bypass: include "CONTRACT-BYPASS: <reason>" in your prompt');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// V237: Flow Tracker — Anti-Amnesia Protocol
// ============================================================

/** SDD 步驟執行順序（canonical） */
const SDD_STEP_ORDER = [
  'discovery', 'specify', 'clarify', 'ui-design',
  'plan', 'checklist', 'tasks', 'analyze', 'implement',
  'ui-verify', 'e2e-intent', 'check', 'renew', 'task-completion'
];

/** 自動連鎖區步驟（不等使用者輸入） */
const AUTO_CHAIN_STEPS = new Set([
  'plan', 'checklist', 'tasks', 'analyze', 'implement',
  'ui-verify', 'e2e-intent', 'check', 'renew', 'task-completion'
]);

/**
 * 記錄某步驟完成，自動計算 nextStep + inAutoChain
 * @param {string} specId - spec 名稱（如 '034-long-press-drag'）
 * @param {string} stepName - 完成的步驟名稱
 * @returns {{ lastCompleted: string, nextStep: string|null, inAutoChain: boolean }}
 */
function recordStepComplete(specId, stepName) {
  const state = loadState();
  if (!state.flowTracker) state.flowTracker = {};
  if (!state.flowTracker[specId]) {
    state.flowTracker[specId] = {
      lastCompleted: null,
      nextStep: null,
      inAutoChain: false,
      iterationCount: 0,
      maxIterations: 3,
      updatedAt: null,
      stepHistory: []
    };
  }

  const tracker = state.flowTracker[specId];
  tracker.lastCompleted = stepName;
  tracker.stepHistory.push(stepName);
  tracker.updatedAt = new Date().toISOString();

  // 計算 nextStep
  const idx = SDD_STEP_ORDER.indexOf(stepName);
  if (idx >= 0 && idx < SDD_STEP_ORDER.length - 1) {
    tracker.nextStep = SDD_STEP_ORDER[idx + 1];
  } else {
    tracker.nextStep = null; // flow 完成
  }

  // 判斷是否在自動連鎖區
  tracker.inAutoChain = tracker.nextStep !== null && AUTO_CHAIN_STEPS.has(tracker.nextStep);

  saveState(state);
  return { lastCompleted: tracker.lastCompleted, nextStep: tracker.nextStep, inAutoChain: tracker.inAutoChain };
}

/**
 * 記錄 ITERATE 迭代：check → renew(partial) → plan
 * @param {string} specId
 * @returns {{ iterationCount: number, nextStep: string } | null}
 */
function recordIteration(specId) {
  const state = loadState();
  if (!state.flowTracker || !state.flowTracker[specId]) return null;

  const tracker = state.flowTracker[specId];
  tracker.iterationCount += 1;
  tracker.nextStep = 'plan'; // 迴圈回到 plan
  tracker.inAutoChain = true;
  tracker.updatedAt = new Date().toISOString();
  saveState(state);
  return { iterationCount: tracker.iterationCount, nextStep: tracker.nextStep };
}

/**
 * 清除 spec 的 flow tracker（task-completion 或 ESCALATE 時）
 * @param {string} specId
 */
function clearFlowTracker(specId) {
  const state = loadState();
  if (state.flowTracker) {
    delete state.flowTracker[specId];
    saveState(state);
  }
}

/**
 * 讀取單一 spec 的 tracker 狀態
 * @param {string} specId
 * @returns {{ lastCompleted: string, nextStep: string|null, inAutoChain: boolean, iterationCount: number } | null}
 */
function getFlowTracker(specId) {
  const state = loadState();
  return state.flowTracker?.[specId] || null;
}

/**
 * 產出 compact 文字檢核表，供 hook 注入（< 15 行/spec）
 * @returns {string|null} - null 表示無 active flow
 */
function getFlowChecklist() {
  const state = loadState();
  if (!state.flowTracker || Object.keys(state.flowTracker).length === 0) {
    return null;
  }

  const lines = ['=== SDD FLOW POSITION (anti-amnesia) ==='];

  for (const [specId, tracker] of Object.entries(state.flowTracker)) {
    const completed = new Set(tracker.stepHistory || []);

    // 只顯示 auto-chain zone 步驟（節省空間）
    const stepLine = SDD_STEP_ORDER
      .filter(s => AUTO_CHAIN_STEPS.has(s))
      .map(s => {
        if (completed.has(s)) return `[x] ${s}`;
        if (s === tracker.nextStep) return `[>] ${s}`;
        return `[ ] ${s}`;
      })
      .join(' | ');

    lines.push(`SPEC: ${specId}`);
    lines.push(`  ${stepLine}`);

    if (tracker.inAutoChain) {
      lines.push('  STATUS: IN AUTO-CHAIN ZONE -- DO NOT STOP');
      lines.push(`  NEXT: /speckit.${tracker.nextStep} ${specId}`);
    }

    if (tracker.iterationCount > 0) {
      lines.push(`  ITERATION: ${tracker.iterationCount}/${tracker.maxIterations}`);
    }
  }

  lines.push('========================================');
  return lines.join('\n');
}

// ============================================================
// IBV: Intent-Build-Verify Flow Support
// ============================================================

/** IBV 步驟執行順序 */
const IBV_STEP_ORDER = [
  'intent', 'scenario', 'architect', 'visual-gate', 'build', 'deliver'
];

/** IBV 自動連鎖區步驟（不等使用者輸入） */
const IBV_AUTO_CHAIN_STEPS = new Set([
  'architect', 'build'
]);

/**
 * 偵測 spec 是否使用 IBV 工作流
 * @param {string} specDir - spec 目錄絕對路徑
 * @returns {boolean}
 */
function isIbvSpec(specDir) {
  // 方法 1: intent.md 存在 → IBV
  if (fs.existsSync(path.join(specDir, 'intent.md'))) return true;

  // 方法 2: spec-lite.md 的 frontmatter 有 workflow: ibv
  const specLitePath = path.join(specDir, 'spec-lite.md');
  if (fs.existsSync(specLitePath)) {
    try {
      const content = fs.readFileSync(specLitePath, 'utf-8');
      if (/^workflow:\s*["']?(?:ibv|web)["']?/m.test(content)) return true;
    } catch { /* fallthrough */ }
  }

  // 方法 3: spec.md 的 frontmatter 有 workflow: ibv
  const specPath = path.join(specDir, 'spec.md');
  if (fs.existsSync(specPath)) {
    try {
      const content = fs.readFileSync(specPath, 'utf-8');
      if (/^workflow:\s*["']?(?:ibv|web)["']?/m.test(content)) return true;
    } catch { /* fallthrough */ }
  }

  return false;
}

/**
 * 偵測 IBV spec 目前階段
 * @param {string} specDir - spec 目錄絕對路徑
 * @returns {string|null} IBV phase 名稱
 */
function detectIbvPhase(specDir) {
  if (!isIbvSpec(specDir)) return null;

  const intentPath = path.join(specDir, 'intent.md');
  const specLitePath = path.join(specDir, 'spec-lite.md');
  const planPath = path.join(specDir, 'plan.md');
  const tasksPath = path.join(specDir, 'tasks.md');

  // 檢查 spec-lite status: implemented → delivered
  if (fs.existsSync(specLitePath)) {
    try {
      const content = fs.readFileSync(specLitePath, 'utf-8');
      if (/^status:\s*implemented/m.test(content)) return 'delivered';
    } catch { /* fallthrough */ }
  }

  // 有 tasks + 全部完成 → build 完成，等 deliver
  if (fs.existsSync(tasksPath)) {
    try {
      const content = fs.readFileSync(tasksPath, 'utf-8');
      const unchecked = (content.match(/- \[ \]/g) || []).length;
      const checked = (content.match(/- \[x\]/gi) || []).length;
      if (unchecked === 0 && checked > 0) return 'build_done';
    } catch { /* fallthrough */ }
  }

  // 有 plan + tasks → building
  if (fs.existsSync(planPath) && fs.existsSync(tasksPath)) return 'building';

  // 有 spec-lite → architect 完成，需 visual gate 或 build
  if (fs.existsSync(specLitePath)) return 'architect_done';

  // 有 intent + scenarios → scenario 完成，等 architect
  const scenariosPath = path.join(specDir, 'scenarios.md');
  if (fs.existsSync(scenariosPath) && fs.existsSync(intentPath)) return 'scenario_done';

  // 只有 intent → scenario 階段
  if (fs.existsSync(intentPath)) return 'intent_done';

  return null;
}

/**
 * IBV 版 recordStepComplete
 * @param {string} specId
 * @param {string} stepName - IBV step name
 * @returns {{ lastCompleted: string, nextStep: string|null, inAutoChain: boolean }}
 */
function recordIbvStepComplete(specId, stepName) {
  const state = loadState();
  if (!state.flowTracker) state.flowTracker = {};
  if (!state.flowTracker[specId]) {
    state.flowTracker[specId] = {
      workflow: 'web',
      lastCompleted: null,
      nextStep: null,
      inAutoChain: false,
      iterationCount: 0,
      maxIterations: 3,
      updatedAt: null,
      stepHistory: []
    };
  }

  const tracker = state.flowTracker[specId];
  if (tracker.workflow !== 'ibv') tracker.workflow = 'web';
  tracker.lastCompleted = stepName;
  tracker.stepHistory.push(stepName);
  tracker.updatedAt = new Date().toISOString();

  const idx = IBV_STEP_ORDER.indexOf(stepName);
  if (idx >= 0 && idx < IBV_STEP_ORDER.length - 1) {
    tracker.nextStep = IBV_STEP_ORDER[idx + 1];
  } else {
    tracker.nextStep = null;
  }

  tracker.inAutoChain = tracker.nextStep !== null && IBV_AUTO_CHAIN_STEPS.has(tracker.nextStep);

  saveState(state);
  return { lastCompleted: tracker.lastCompleted, nextStep: tracker.nextStep, inAutoChain: tracker.inAutoChain };
}

/**
 * IBV 版 self-iteration 紀錄
 * @param {string} specId
 * @returns {{ iterationCount: number, nextStep: string } | null}
 */
function recordIbvIteration(specId) {
  const state = loadState();
  if (!state.flowTracker || !state.flowTracker[specId]) return null;

  const tracker = state.flowTracker[specId];
  tracker.iterationCount += 1;
  tracker.nextStep = 'build';
  tracker.inAutoChain = true;
  tracker.updatedAt = new Date().toISOString();
  saveState(state);
  return { iterationCount: tracker.iterationCount, nextStep: tracker.nextStep };
}

/**
 * 判斷 prompt 是否為 IBV 命令
 * @param {string} prompt
 * @returns {boolean}
 */
function isIbvCommand(prompt) {
  return /^\/?(?:ibv|web)\b/i.test((prompt || '').trim());
}

// ============================================================
// IBV LoopGuard — 三閾值收斂控制 + 基線比對 (v1.1)
// ============================================================

/** LoopGuard 可調閾值 */
const IBV_LOOPGUARD = {
  MAX_TASK_FIX: 3,        // 單一 task 最大修復次數
  MAX_SAME_ERROR: 2,      // 同一錯誤訊息重複出現 → stuck
  MAX_FLAT_STEPS: 4,      // 連續 N 步 RTM 未提升 → stall
  FLAT_WARN_THRESHOLD: 3, // flat_steps 到此值 → 警告並切換策略
  MAX_OUTER_ITER: 3       // 大迴圈上限
};

/**
 * 記錄 BUILD 基線快照（BUILD 開始前呼叫）
 * @param {string} specId
 * @param {{ tsErrors: number, rustFailures: number, reactFailures: number }} baseline
 */
function recordIbvBaseline(specId, baseline) {
  const state = loadState();
  if (!state.ibvBuild) state.ibvBuild = {};
  if (!state.ibvBuild[specId]) state.ibvBuild[specId] = {};

  state.ibvBuild[specId].baseline = {
    ...baseline,
    recordedAt: new Date().toISOString()
  };
  state.ibvBuild[specId].errorHashes = [];
  state.ibvBuild[specId].rtmHistory = [];
  state.ibvBuild[specId].flatSteps = 0;

  saveState(state);
}

/**
 * 取得 BUILD 基線
 * @param {string} specId
 * @returns {{ tsErrors: number, rustFailures: number, reactFailures: number } | null}
 */
function getIbvBaseline(specId) {
  const state = loadState();
  return state.ibvBuild?.[specId]?.baseline || null;
}

/**
 * 記錄 error hash（偵測 stuck loop + 震盪）
 * @param {string} specId
 * @param {string} errorHash - 錯誤訊息的簡化指紋
 * @param {{ round: number, failingTests: string[] }} context - 修復輪次 + 失敗測試清單
 * @returns {{ status: 'ok'|'stuck'|'oscillation', detail: string }}
 */
function recordIbvErrorHash(specId, errorHash, context) {
  const state = loadState();
  if (!state.ibvBuild?.[specId]) {
    return { status: 'ok', detail: 'no build state' };
  }

  const build = state.ibvBuild[specId];
  if (!build.errorHashes) build.errorHashes = [];

  build.errorHashes.push({
    hash: errorHash,
    round: context.round,
    failingTests: context.failingTests || [],
    at: new Date().toISOString()
  });

  saveState(state);

  // Stuck detection: 同一 hash 出現 MAX_SAME_ERROR 次
  const sameCount = build.errorHashes.filter(e => e.hash === errorHash).length;
  if (sameCount >= IBV_LOOPGUARD.MAX_SAME_ERROR) {
    return {
      status: 'stuck',
      detail: `Same error "${errorHash}" appeared ${sameCount} times — switch approach`
    };
  }

  // Oscillation detection: 本輪新失敗 ∩ 前前輪已修復 ≠ ∅
  if (build.errorHashes.length >= 3) {
    const current = new Set(context.failingTests || []);
    const twoRoundsAgo = build.errorHashes[build.errorHashes.length - 3];
    if (twoRoundsAgo && twoRoundsAgo.failingTests) {
      const previousFixed = new Set(twoRoundsAgo.failingTests);
      const overlap = [...current].filter(t => previousFixed.has(t));
      if (overlap.length > 0) {
        return {
          status: 'oscillation',
          detail: `Fix oscillation detected: ${overlap.join(', ')} re-broke after being fixed`
        };
      }
    }
  }

  return { status: 'ok', detail: '' };
}

/**
 * 記錄 RTM 覆蓋率進度（偵測 flat line）
 * @param {string} specId
 * @param {number} coverage - 0-100 的覆蓋率百分比
 * @returns {{ status: 'ok'|'warn'|'stall', flatSteps: number, detail: string }}
 */
function recordIbvRtmProgress(specId, coverage) {
  const state = loadState();
  if (!state.ibvBuild?.[specId]) {
    return { status: 'ok', flatSteps: 0, detail: 'no build state' };
  }

  const build = state.ibvBuild[specId];
  if (!build.rtmHistory) build.rtmHistory = [];

  const prevCoverage = build.rtmHistory.length > 0
    ? build.rtmHistory[build.rtmHistory.length - 1]
    : -1;

  build.rtmHistory.push(coverage);

  // Flat detection: 覆蓋率未提升
  if (coverage <= prevCoverage && prevCoverage >= 0) {
    build.flatSteps = (build.flatSteps || 0) + 1;
  } else {
    build.flatSteps = 0;
  }

  saveState(state);

  if (build.flatSteps >= IBV_LOOPGUARD.MAX_FLAT_STEPS) {
    return {
      status: 'stall',
      flatSteps: build.flatSteps,
      detail: `RTM stalled at ${coverage}% for ${build.flatSteps} steps — ESCALATE`
    };
  }

  if (build.flatSteps >= IBV_LOOPGUARD.FLAT_WARN_THRESHOLD) {
    return {
      status: 'warn',
      flatSteps: build.flatSteps,
      detail: `RTM progress stalling at ${coverage}% (${build.flatSteps}/${IBV_LOOPGUARD.MAX_FLAT_STEPS}) — try alternative approach`
    };
  }

  return { status: 'ok', flatSteps: build.flatSteps, detail: '' };
}

/**
 * 綜合 LoopGuard 狀態檢查
 * @param {string} specId
 * @returns {{ status: 'ok'|'warn'|'stuck'|'oscillation'|'stall', detail: string, metrics: object }}
 */
function checkIbvLoopGuard(specId) {
  const state = loadState();
  const build = state.ibvBuild?.[specId];
  if (!build) {
    return { status: 'ok', detail: 'no build state', metrics: {} };
  }

  const tracker = state.flowTracker?.[specId];
  const iterationCount = tracker?.iterationCount || 0;

  const metrics = {
    iterationCount,
    maxIterations: IBV_LOOPGUARD.MAX_OUTER_ITER,
    flatSteps: build.flatSteps || 0,
    maxFlatSteps: IBV_LOOPGUARD.MAX_FLAT_STEPS,
    totalErrorRecords: (build.errorHashes || []).length,
    rtmHistory: build.rtmHistory || [],
    baseline: build.baseline || null
  };

  // 大迴圈上限
  if (iterationCount >= IBV_LOOPGUARD.MAX_OUTER_ITER) {
    return {
      status: 'stall',
      detail: `Outer iteration limit reached (${iterationCount}/${IBV_LOOPGUARD.MAX_OUTER_ITER})`,
      metrics
    };
  }

  // Flat steps 檢查
  if ((build.flatSteps || 0) >= IBV_LOOPGUARD.MAX_FLAT_STEPS) {
    return {
      status: 'stall',
      detail: `RTM stalled for ${build.flatSteps} steps`,
      metrics
    };
  }

  if ((build.flatSteps || 0) >= IBV_LOOPGUARD.FLAT_WARN_THRESHOLD) {
    return {
      status: 'warn',
      detail: `RTM progress slowing (${build.flatSteps}/${IBV_LOOPGUARD.MAX_FLAT_STEPS} flat steps)`,
      metrics
    };
  }

  // 最近的 error hash 檢查
  const hashes = build.errorHashes || [];
  if (hashes.length >= 2) {
    const lastHash = hashes[hashes.length - 1]?.hash;
    const sameCount = hashes.filter(e => e.hash === lastHash).length;
    if (sameCount >= IBV_LOOPGUARD.MAX_SAME_ERROR) {
      return {
        status: 'stuck',
        detail: `Same error repeated ${sameCount} times`,
        metrics
      };
    }
  }

  return { status: 'ok', detail: '', metrics };
}

/**
 * 取得 BUILD 完整狀態（供 STATUS.md 輸出）
 * @param {string} specId
 * @returns {object|null}
 */
function getIbvBuildStatus(specId) {
  const state = loadState();
  const build = state.ibvBuild?.[specId];
  if (!build) return null;

  const tracker = state.flowTracker?.[specId];
  return {
    baseline: build.baseline || null,
    rtmHistory: build.rtmHistory || [],
    flatSteps: build.flatSteps || 0,
    errorCount: (build.errorHashes || []).length,
    iterationCount: tracker?.iterationCount || 0,
    loopGuard: checkIbvLoopGuard(specId)
  };
}

/**
 * 檢查是否有任何 spec 正在 IBV BUILD 階段
 * 供 stop-hook 判斷是否啟用 BUILD quality gate
 * @param {object} [stateOverride] - 可選的 state 覆蓋（避免重複 loadState）
 * @returns {{ inBuild: boolean, specId: string|null, loopGuard: object|null }}
 */
function isInIbvBuild(stateOverride) {
  const state = stateOverride || loadState();

  // 方式 1: implementActive 旗標（speckit.implement 或 ibv.build 設置）
  if (state.implementActive) {
    // 找到對應的 spec
    if (state.flowTracker) {
      for (const [specId, tracker] of Object.entries(state.flowTracker)) {
        if ((tracker.workflow === 'ibv' || tracker.workflow === 'web') && tracker.lastCompleted === 'architect') {
          return {
            inBuild: true,
            specId,
            loopGuard: checkIbvLoopGuard(specId)
          };
        }
      }
    }
    return { inBuild: true, specId: null, loopGuard: null };
  }

  // 方式 2: flowTracker 顯示 nextStep 是 build 或 lastCompleted 是 architect
  if (state.flowTracker) {
    for (const [specId, tracker] of Object.entries(state.flowTracker)) {
      if ((tracker.workflow === 'ibv' || tracker.workflow === 'web') &&
          (tracker.nextStep === 'build' || tracker.lastCompleted === 'architect') &&
          state.ibvBuild?.[specId]) {
        return {
          inBuild: true,
          specId,
          loopGuard: checkIbvLoopGuard(specId)
        };
      }
    }
  }

  return { inBuild: false, specId: null, loopGuard: null };
}

/**
 * 清除 BUILD 狀態（DELIVER 完成或 ESCALATE 時）
 * @param {string} specId
 */
function clearIbvBuildState(specId) {
  const state = loadState();
  if (state.ibvBuild) {
    delete state.ibvBuild[specId];
    saveState(state);
  }
}

// ============================================================
// 匯出
// ============================================================

module.exports = {
  CONFIG,
  SPECS_DIR,
  loadState,
  saveState,
  detectSpecPhase,
  findSpecForFile,
  findActiveSpecs,
  findSpecByName,
  isSddScale,
  checkBypass,
  isImplementCommand,
  isHotfixBranch,
  recordWarning,
  getWarningCount,
  recordEdit,
  logBypass,
  setImplementActive,
  isImplementActive,
  // Debug Shortcut
  setDebugActive,
  isDebugActive,
  // M3: Ambiguity Hard Gate
  detectUnresolvedGaps,
  formatGateReport,
  // M4: Runtime Contract Verification
  detectContractFailures,
  formatContractReport,
  // V237: Flow Tracker (Anti-Amnesia)
  SDD_STEP_ORDER,
  AUTO_CHAIN_STEPS,
  recordStepComplete,
  recordIteration,
  clearFlowTracker,
  getFlowTracker,
  getFlowChecklist,
  // IBV: Intent-Build-Verify
  IBV_STEP_ORDER,
  IBV_AUTO_CHAIN_STEPS,
  isIbvSpec,
  detectIbvPhase,
  recordIbvStepComplete,
  recordIbvIteration,
  isIbvCommand,
  // IBV LoopGuard (v1.1)
  IBV_LOOPGUARD,
  recordIbvBaseline,
  getIbvBaseline,
  recordIbvErrorHash,
  recordIbvRtmProgress,
  checkIbvLoopGuard,
  getIbvBuildStatus,
  clearIbvBuildState,
  // IBV v1.4: BUILD Quality Gate
  isInIbvBuild
};
