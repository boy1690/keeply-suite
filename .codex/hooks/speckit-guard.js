#!/usr/bin/env node
/**
 * Speckit Guard Hook — Graduated SDD Enforcement
 *
 * PreToolUse hook: 在 Edit/Write 核心路徑時提醒必讀設計文檔。
 * V3: 對 SDD 路徑實施漸進式執行（warn → block）。
 *
 * 觸發路徑（Keeply/GitEasy）：
 * - src/types/**              → DATA_STRUCTURES.md, INVARIANTS.md
 * - src-tauri/src/git/**      → GIT_OPERATIONS.md, INVARIANTS.md
 * - src-tauri/src/commands/** → TAURI_IPC.md, GIT_OPERATIONS.md
 * - src-tauri/src/nas/**      → GIT_OPERATIONS.md, INVARIANTS.md
 * - src-tauri/src/state/**    → TAURI_IPC.md, DATA_STRUCTURES.md
 * - src/lib/**                → DATA_STRUCTURES.md, TAURI_IPC.md
 *
 * SDD 路徑（漸進式執行）：
 * - 從 specs/_manifest.json 動態讀取（不再硬編碼）
 *
 * @version 4.0.0
 * @since 2026-02-03
 * @updated 2026-03-27 - V4: Manifest-driven SDD triggers (Spec Book consolidation)
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 配置：路徑 → 必讀文檔映射（Speckit 核心不變量 — 保持不變）
// ============================================================

const SPECKIT_TRIGGERS = {
  'src/types/': {
    docs: ['DATA_STRUCTURES.md', 'INVARIANTS.md'],
    invariants: ['INV-5: Git 術語零暴露']
  },
  'src-tauri/src/git/': {
    docs: ['GIT_OPERATIONS.md', 'INVARIANTS.md'],
    invariants: ['INV-1: Worktree 隔離性', 'INV-2: NAS 同步原子性', 'INV-6: 資料完整性']
  },
  'src-tauri/src/commands/': {
    docs: ['TAURI_IPC.md', 'GIT_OPERATIONS.md'],
    invariants: ['INV-5: Git 術語零暴露']
  },
  'src-tauri/src/nas/': {
    docs: ['GIT_OPERATIONS.md', 'INVARIANTS.md'],
    invariants: ['INV-2: NAS 同步原子性', 'INV-6: 資料完整性']
  },
  'src-tauri/src/state/': {
    docs: ['TAURI_IPC.md', 'DATA_STRUCTURES.md'],
    invariants: ['INV-3: 無懸空 Worktree']
  },
  'src/lib/': {
    docs: ['DATA_STRUCTURES.md', 'TAURI_IPC.md'],
    invariants: ['INV-5: Git 術語零暴露']
  }
};

// ============================================================
// 配置：Bridge Source 路徑 → Bridge Spec 映射（M8）
// ============================================================

const BRIDGE_TRIGGERS = {
  // Keeply Bridge Specs（Phase 0 後逐步建立）
  // 'src-tauri/src/commands/mod.rs': {
  //   spec: '.speckit/bridges/IPC_BUS.md',
  //   label: 'IPC_BUS'
  // },
  // 'src-tauri/src/git/worktree.rs': {
  //   spec: '.speckit/bridges/WORKTREE_LIFECYCLE_BUS.md',
  //   label: 'WORKTREE_LIFECYCLE_BUS'
  // },
};

// ============================================================
// 配置：SDD 路徑 → 功能規格映射（V4: Manifest-Driven）
// ============================================================

const MANIFEST_PATH = path.join(process.cwd(), 'specs', '_manifest.json');

/** 從 _manifest.json 動態建構 SDD trigger map */
function buildSddTriggers() {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) return {};
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const triggers = {};
    for (const [id, spec] of Object.entries(manifest.specs || {})) {
      if (!spec.source_paths || spec.source_paths.length === 0) continue;
      for (const srcPath of spec.source_paths) {
        triggers[srcPath] = {
          docs: [`specs/${spec.path}/spec.md`],
          label: spec.title
        };
      }
    }
    return triggers;
  } catch {
    return {};
  }
}

const SDD_TRIGGERS = buildSddTriggers();

// ============================================================
// 配置：研究文件路徑 → TIER 3 提醒（V90.1 Batch D）
// ============================================================

const RESEARCH_TRIGGERS = {
  'docs/specs/': {
    label: 'TIER 3 Research',
    canonical: '.speckit/'
  }
};

// ============================================================
// M1: State Ownership Map — Stateful Spec 偵測
// ============================================================

/**
 * State 寫入關鍵字（與 state-ownership-map-template.md 同步）
 */
const STATE_KEYWORDS = [
  'atom', 'store', 'setstate', 'zustand', 'jotai', 'immer', 'produce',
  'save', 'persist', 'debounce', 'throttle', 'localstorage', 'sessionstorage',
  'useautosave', 'triggersave', 'writeatom', 'onset', 'subscribe'
];

/**
 * 偵測 spec 是否涉及 state 寫入但缺少 State Ownership Map
 * @param {string} specDir - spec 目錄絕對路徑
 * @returns {{ hasStateKeywords: boolean, missingMap: boolean, keywords: string[] }}
 */
function detectStatefulSpec(specDir) {
  const result = { hasStateKeywords: false, missingMap: false, keywords: [] };

  // 讀取 spec.md
  const specPath = path.join(specDir, 'spec.md');
  if (!fs.existsSync(specPath)) return result;

  let content;
  try {
    content = fs.readFileSync(specPath, 'utf-8').toLowerCase();
  } catch {
    return result;
  }

  // 掃描關鍵字
  for (const kw of STATE_KEYWORDS) {
    if (content.includes(kw)) {
      result.hasStateKeywords = true;
      result.keywords.push(kw);
    }
  }

  if (!result.hasStateKeywords) return result;

  // 檢查是否有 State Ownership Map 段落
  if (!content.includes('## state ownership map')) {
    result.missingMap = true;
  }

  return result;
}

// ============================================================
// 主處理函數
// ============================================================

/**
 * 檢查檔案路徑是否匹配任何觸發條件
 * @param {string} filePath - 檔案路徑
 * @returns {{ docs: string[], invariants?: string[], type: 'speckit'|'sdd'|'research', label?: string } | null}
 */
function getSpeckitContext(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');

  // M8: Bridge Source 檢查（最高優先 — 精確匹配）
  for (const [trigger, config] of Object.entries(BRIDGE_TRIGGERS)) {
    if (normalizedPath.endsWith(trigger) || normalizedPath.includes(trigger)) {
      return { ...config, type: 'bridge' };
    }
  }

  // Speckit 優先（核心不變量）
  for (const [trigger, config] of Object.entries(SPECKIT_TRIGGERS)) {
    if (normalizedPath.includes(trigger)) {
      return { ...config, type: 'speckit' };
    }
  }

  // SDD 次之（功能規格）
  for (const [trigger, config] of Object.entries(SDD_TRIGGERS)) {
    if (normalizedPath.includes(trigger)) {
      return { docs: config.docs, invariants: [], type: 'sdd', label: config.label };
    }
  }

  // Research 最後（TIER 3 研究文件）
  for (const [trigger, config] of Object.entries(RESEARCH_TRIGGERS)) {
    if (normalizedPath.includes(trigger)) {
      return { docs: [config.canonical], invariants: [], type: 'research', label: config.label };
    }
  }

  return null;
}

/**
 * 格式化 Speckit/Research 提醒訊息（原有行為不變）
 */
function formatLegacyMessage(context, filePath) {
  const lines = [];
  const { docs, invariants = [], type } = context;

  if (type === 'research') {
    lines.push('');
    lines.push(`TIER 3 Research 文件 — ${path.basename(filePath)}`);
    lines.push('   這是未來設計文件，不是 Source of Truth');
    lines.push(`   Canonical reference: ${docs[0]}`);
    lines.push('   實作時請用 /speckit.specify 建立規格');
    lines.push('');
  } else {
    // Speckit: 強警告，指向核心不變量
    lines.push('');
    lines.push('核心設計區域修改');
    lines.push(`   檔案: ${path.basename(filePath)}`);
    lines.push('');
    lines.push('必讀文檔 (.speckit/):');
    for (const doc of docs) {
      lines.push(`   - ${doc}`);
    }
    if (invariants.length > 0) {
      lines.push('');
      lines.push('相關不變量:');
      for (const inv of invariants) {
        lines.push(`   - ${inv}`);
      }
    }
    lines.push('');
    lines.push('驗證命令:');
    lines.push('   cargo test                  # Rust 不變量');
    lines.push('   cargo test -- worktree      # Worktree 隔離');
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================================
// SDD 漸進式執行（V3 新增）
// ============================================================

/** SDD phase → 警告/阻擋訊息 */
const SDD_PHASE_MESSAGES = {
  needs_clarify: {
    warn: (label, count, threshold) =>
      `SDD Warning (${count}/${threshold}): ${label} — Spec 有未解決的 [NEEDS CLARIFICATION]。先執行 /speckit.clarify`,
    block: (label) =>
      `SDD Enforcement: ${label} — Spec 有未解決的 [NEEDS CLARIFICATION]，必須先執行 /speckit.clarify 才能修改程式碼。\n或 bypass：在提示中加 SDD-BYPASS: <原因>`
  },
  specify: {
    warn: (label, count, threshold) =>
      `SDD Warning (${count}/${threshold}): ${label} — Spec 已建立但無 plan。先執行 /speckit.plan`,
    block: (label) =>
      `SDD Enforcement: ${label} — 必須先執行 /speckit.plan 才能修改程式碼。\n或 bypass：在提示中加 SDD-BYPASS: <原因>`
  },
  plan: {
    warn: (label, count, threshold) =>
      `SDD Warning (${count}/${threshold}): ${label} — Plan 已建立但無 tasks。先執行 /speckit.tasks`,
    block: (label) =>
      `SDD Enforcement: ${label} — 必須先執行 /speckit.tasks 才能修改程式碼。\n或 bypass：在提示中加 SDD-BYPASS: <原因>`
  },
  needs_checklist: {
    warn: (label, count, threshold) =>
      `SDD Warning (${count}/${threshold}): ${label} — Tasks 已建立但無 checklist。先執行 /speckit.checklist`,
    block: (label) =>
      `SDD Enforcement: ${label} — 必須先執行 /speckit.checklist 才能修改程式碼。\n或 bypass：在提示中加 SDD-BYPASS: <原因>`
  },
  tasks_no_implement: {
    warn: (label, count, threshold) =>
      `SDD Warning (${count}/${threshold}): ${label} — 有待執行任務。請用 /speckit.implement 進行結構化實作`,
    block: (label) =>
      `SDD Enforcement: ${label} — 必須透過 /speckit.implement 執行實作（自帶 TDD/Constitution 檢查）。\n或 bypass：在提示中加 SDD-BYPASS: <原因>`
  },
  no_spec: {
    warn: (label, count, threshold) =>
      `SDD Warning (${count}/${threshold}): 修改 ${label} 但無對應 spec。建議先 /speckit.specify <描述>`,
    block: (label) =>
      `SDD Enforcement: 修改 ${label} 已警告 3 次但仍無 spec。\n建立規格：/speckit.specify <描述>\n或 bypass：在提示中加 SDD-BYPASS: <原因>`
  }
};

/**
 * 處理 SDD 路徑的漸進式執行
 * @param {object} context - getSpeckitContext 回傳
 * @param {string} filePath
 * @returns {{ continue?: boolean, result?: string, reason?: string, message?: string }}
 */
function handleSddEnforcement(context, filePath) {
  let sddState;
  try {
    sddState = require('./lib/sdd-state');
  } catch {
    // sdd-state 載入失敗 → fallback 到原有 advisory 行為
    return { continue: true, message: formatSddAdvisory(context, filePath) };
  }

  // 1. Bypass 檢查
  if (sddState.isHotfixBranch()) {
    return { continue: true };
  }
  const state = sddState.loadState();
  if (state.bypassLog.length > 0) {
    // 本 session 已有 bypass → 放行
    sddState.recordEdit(filePath);
    return { continue: true };
  }

  // 2. 記錄編輯
  sddState.recordEdit(filePath);

  // 3. 找對應 spec
  const specInfo = sddState.findSpecForFile(filePath);

  if (!specInfo || !specInfo.id) {
    // 無對應 spec
    return graduatedResponse(sddState, `no_spec:${context.label}`, 'no_spec', context.label);
  }

  // 4. 檢查 phase
  const phase = sddState.detectSpecPhase(specInfo.dir);
  const label = `${context.label} (${specInfo.id})`;

  switch (phase) {
    case 'needs_clarify':
      return graduatedResponse(sddState, `clarify:${specInfo.id}`, 'needs_clarify', label);

    case 'specify':
      return graduatedResponse(sddState, `plan:${specInfo.id}`, 'specify', label);

    case 'plan':
      return graduatedResponse(sddState, `tasks:${specInfo.id}`, 'plan', label);

    case 'needs_checklist':
      return graduatedResponse(sddState, `checklist:${specInfo.id}`, 'needs_checklist', label);

    case 'tasks':
      // 有 tasks → 檢查是否透過 /speckit.implement 執行
      if (sddState.isImplementActive()) {
        // 正在 implement 中 → 放行
        return { continue: true, message: `SDD: ${label} — /speckit.implement 執行中` };
      }
      // 未透過 implement → 漸進式攔截
      return graduatedResponse(sddState, `implement:${specInfo.id}`, 'tasks_no_implement', label);

    case 'implement_done':
      return {
        continue: true,
        message: `SDD Reminder: ${label} — 實作已完成，記得執行 /speckit.renew 收尾`
      };

    case 'renewed':
      return { continue: true };

    default:
      return { continue: true, message: formatSddAdvisory(context, filePath) };
  }
}

/**
 * 漸進式回應：warn N-1 次 → 第 N 次 block
 */
function graduatedResponse(sddState, warningKey, phaseKey, label) {
  const threshold = sddState.CONFIG.BLOCK_THRESHOLD;
  const count = sddState.recordWarning(warningKey, phaseKey);
  const msgs = SDD_PHASE_MESSAGES[phaseKey];

  if (count >= threshold) {
    // BLOCK
    return {
      result: 'block',
      reason: msgs.block(label)
    };
  }

  // WARN
  return {
    continue: true,
    message: msgs.warn(label, count, threshold)
  };
}

/**
 * SDD advisory 訊息（fallback，原有行為）
 */
function formatSddAdvisory(context, filePath) {
  const lines = [];
  lines.push('');
  lines.push(`SDD 規格區域 — ${context.label || '功能模組'}`);
  lines.push(`   檔案: ${path.basename(filePath)}`);
  lines.push('');
  lines.push('參考規格:');
  for (const doc of (context.docs || [])) {
    lines.push(`   - ${doc}`);
  }
  lines.push('');
  lines.push('檢查是否有進行中的規格:');
  lines.push('   ls specs/');
  lines.push('');
  return lines.join('\n');
}

/**
 * M1: 檢查修改的檔案是否屬於有 state 關鍵字但缺 State Ownership Map 的 spec
 * @param {string} filePath - 被修改的檔案路徑
 * @returns {string|null} 警告訊息，或 null（無需警告）
 */
function checkStateOwnershipMap(filePath) {
  let sddState;
  try {
    sddState = require('./lib/sdd-state');
  } catch {
    return null;
  }

  const specInfo = sddState.findSpecForFile(filePath);
  if (!specInfo || !specInfo.dir) return null;

  const stateCheck = detectStatefulSpec(specInfo.dir);
  if (!stateCheck.missingMap) return null;

  // 有 state 關鍵字但缺 State Ownership Map
  const lines = [];
  lines.push('');
  lines.push('M1 State Ownership Map 缺失');
  lines.push(`   Spec ${specInfo.id} 涉及 state 寫入（${stateCheck.keywords.slice(0, 3).join(', ')}...）`);
  lines.push('   但缺少 ## State Ownership Map 段落。');
  lines.push('   建議：更新 spec.md 加入 Write Timeline + Verification Points');
  lines.push('   模板：.specify/templates/state-ownership-map-template.md');
  lines.push('');
  return lines.join('\n');
}

// ============================================================
// M8: Bridge Consumer 計數
// ============================================================

/**
 * 從 Bridge Spec 的 Consumer Registry 計算消費者數量
 * @param {string} specRelPath - Bridge Spec 相對路徑
 * @returns {number} 消費者數量（讀取失敗回傳 '?'）
 */
function countBridgeConsumers(specRelPath) {
  try {
    const specPath = path.resolve(process.cwd(), specRelPath);
    if (!fs.existsSync(specPath)) return '?';
    const content = fs.readFileSync(specPath, 'utf-8');
    // Count table rows in Consumer Registry (lines starting with |, excluding header/separator)
    const registryMatch = content.match(/## Consumer Registry[\s\S]*?(?=##|$)/);
    if (!registryMatch) return '?';
    const rows = registryMatch[0].split('\n').filter(l => l.startsWith('|') && !l.includes('---') && !l.includes('Module'));
    return rows.length;
  } catch {
    return '?';
  }
}

// ============================================================
// 主入口
// ============================================================

async function main() {
  try {
    let inputData = '';
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    const input = JSON.parse(inputData);
    const { tool_name, tool_input } = input;

    // 只處理 Edit/Write
    if (tool_name !== 'Edit' && tool_name !== 'Write') {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    // 取得檔案路徑
    const filePath = tool_input?.file_path || tool_input?.path || '';
    if (!filePath) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    // 檢查是否匹配觸發條件
    const context = getSpeckitContext(filePath);

    if (!context) {
      console.log(JSON.stringify({ continue: true }));
      return;
    }

    // M8: Bridge Source 路徑 → advisory 提醒
    if (context.type === 'bridge') {
      const consumerCount = countBridgeConsumers(context.spec);
      const message = [
        '',
        `Bridge Source 修改 — ${context.label}`,
        `   檔案: ${path.basename(filePath)}`,
        `   Bridge Spec: ${context.spec}`,
        `   消費者數量: ${consumerCount}`,
        '',
        '   變更此檔案的 exports 會影響所有透過 bridge 引入的消費者。',
        '   建議先閱讀 Bridge Spec 的 Type Stability Table。',
        ''
      ].join('\n');
      console.log(JSON.stringify({ continue: true, message }));
      return;
    }

    // V3: SDD 路徑 → 漸進式執行
    if (context.type === 'sdd') {
      const response = handleSddEnforcement(context, filePath);
      // M1: 附加 State Ownership Map 警告（如果適用）
      if (response.continue) {
        const m1Warning = checkStateOwnershipMap(filePath);
        if (m1Warning) {
          response.message = (response.message || '') + m1Warning;
        }
      }
      console.log(JSON.stringify(response));
      return;
    }

    // Speckit / Research → 原有 advisory 行為
    let message = formatLegacyMessage(context, filePath);
    // M1: Speckit 路徑也可能涉及 state（如 src/stores/）
    const m1Warning = checkStateOwnershipMap(filePath);
    if (m1Warning) {
      message = (message || '') + m1Warning;
    }
    console.log(JSON.stringify({ continue: true, message }));

  } catch (error) {
    console.error(`[speckit-guard] Error: ${error.message}`);
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
