#!/usr/bin/env node
/**
 * PreToolUse hook: 在 Write/Edit 前執行多層驗證
 * 基於 BlueMouse 17 層驗證架構，設計 12 層 Keeply 專屬驗證系統
 *
 * 層級設計：
 * - L1-2: 語法/型別（P0 阻斷）- console.log, any type, debugger
 * - L3-4: 安全性（P0 阻斷）- XSS, 硬編碼密鑰, eval
 * - L5: React 規範（P1 警告）
 * - L6-8: 領域規則（P0 阻斷）- Rust unwrap() 禁止, Git 術語洩漏, Tauri 阻塞 I/O
 * - L9: Library-First（P1 警告）
 * - L10: Codebase Impact（P2 提示）- 模組影響分析
 * - L0: TDD（P2 提示）
 *
 * @version 4.0.0
 * @since 2025-12-25
 * @updated 2026-03-24 - M6: React Lifecycle Sentinel 整合至 Layer 5
 */

const fs = require('fs');
const path = require('path');

// AgentOps 可觀測性整合
const { withTiming } = require('./lib/timing-wrapper');

// Codebase Impact 分析
const {
  extractModuleName,
  getModuleImpact,
  formatImpactMessage
} = require('./lib/impact-map');

// M6 React Lifecycle Sentinel (Keeply: react-lifecycle-patterns not yet adapted)
// const { checkReactLifecycle } = require('./lib/react-lifecycle-patterns');
const checkReactLifecycle = () => []; // Placeholder until Keeply patterns are defined

/**
 * 檢查對應的測試檔案是否存在
 * @param {string} filePath - 原始檔案路徑
 * @returns {{ exists: boolean, testPath: string } | null}
 */
function checkTestFile(filePath) {
  // 只檢查 src/lib/**/*.ts（排除測試檔案本身）
  if (!filePath.includes('src/lib/') || filePath.includes('__tests__')) {
    return null;
  }

  // 排除 index.ts 和 types.ts
  const basename = path.basename(filePath);
  if (basename === 'index.ts' || basename.endsWith('.d.ts')) {
    return null;
  }

  // 計算測試檔案路徑
  // src/lib/utils/format.ts → src/lib/utils/__tests__/format.test.ts
  const dir = path.dirname(filePath);
  const name = path.basename(filePath, '.ts');
  const testPath = path.join(dir, '__tests__', `${name}.test.ts`);

  // 也檢查直接放在 __tests__ 目錄的情況
  // src/lib/utils/format.ts → src/lib/__tests__/utils/format.test.ts
  const altTestPath = filePath
    .replace('src/lib/', 'src/lib/__tests__/')
    .replace('.ts', '.test.ts');

  const exists = fs.existsSync(testPath) || fs.existsSync(altTestPath);

  return { exists, testPath };
}

// ============================================================
// Layer 3-4: 安全性檢查（P0 阻斷）
// ============================================================

/**
 * Layer 3: XSS/Injection 檢查
 * @param {string} content - 檔案內容
 * @returns {Array<{layer: number, category: string, message: string, suggestion: string}>}
 */
function checkXSSInjection(content) {
  const violations = [];

  const patterns = [
    {
      regex: /dangerouslySetInnerHTML/,
      message: '檢測到 dangerouslySetInnerHTML 使用',
      suggestion: '使用 DOMPurify 或 React children'
    },
    {
      regex: /\.innerHTML\s*=/,
      message: '檢測到 innerHTML 直接賦值',
      suggestion: '使用 textContent 或 React 渲染'
    },
    {
      regex: /\beval\s*\(/,
      message: '檢測到 eval() 使用（絕對禁止）',
      suggestion: '重構邏輯，移除動態執行'
    },
    {
      regex: /new\s+Function\s*\(/,
      message: '檢測到 new Function() 使用（絕對禁止）',
      suggestion: '重構邏輯，移除動態執行'
    }
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(content)) {
      violations.push({
        layer: 3,
        category: '安全性 - XSS/Injection',
        message: pattern.message,
        suggestion: pattern.suggestion
      });
    }
  }

  return violations;
}

/**
 * Layer 4: 敏感資料檢查
 * @param {string} content - 檔案內容
 * @returns {Array<{layer: number, category: string, message: string, suggestion: string}>}
 */
function checkSensitiveData(content) {
  const violations = [];

  // 排除測試檔案和 mock 資料
  const isTestContent = /\b(test|spec|mock|fixture)\b/i.test(content);

  const patterns = [
    {
      regex: /(?:const|let|var)\s+\w*API_KEY\w*\s*=\s*["'][^"']{10,}["']/i,
      message: '檢測到硬編碼 API Key',
      suggestion: '使用環境變數 process.env.NEXT_PUBLIC_API_KEY'
    },
    {
      regex: /(?:const|let|var)\s+\w*PASSWORD\w*\s*=\s*["'][^"']+["']/i,
      message: '檢測到硬編碼密碼',
      suggestion: '使用環境變數或安全存儲'
    },
    {
      regex: /(?:const|let|var)\s+\w*SECRET\w*\s*=\s*["'][^"']{10,}["']/i,
      message: '檢測到硬編碼 Secret',
      suggestion: '使用環境變數 process.env.JWT_SECRET'
    },
    {
      regex: /(?:const|let|var)\s+\w*TOKEN\w*\s*=\s*["'][^"']{20,}["']/i,
      message: '檢測到硬編碼 Token',
      suggestion: '使用安全存儲或環境變數'
    }
  ];

  // 測試內容跳過敏感資料檢查
  if (isTestContent) {
    return violations;
  }

  for (const pattern of patterns) {
    if (pattern.regex.test(content)) {
      violations.push({
        layer: 4,
        category: '安全性 - 敏感資料',
        message: pattern.message,
        suggestion: pattern.suggestion
      });
    }
  }

  return violations;
}

// ============================================================
// Layer 6-8: 領域規則檢查（P0 阻斷）
// ============================================================

/**
 * 判斷是否為 Rust 檔案
 * @param {string} filePath
 * @returns {boolean}
 */
function isRustFile(filePath) {
  return /\.rs$/.test(filePath);
}

/**
 * 判斷是否為 UI 檔案（React 元件）
 * @param {string} filePath
 * @returns {boolean}
 */
function isUIFile(filePath) {
  return /[/\\](components|pages|app)[/\\]/i.test(filePath) && /\.(tsx?|jsx?)$/.test(filePath);
}

/**
 * Layer 6: Rust unwrap() 禁止檢查
 * @param {string} content - 檔案內容
 * @returns {Array<{layer: number, category: string, message: string, suggestion: string}>}
 */
function checkRustUnwrap(content) {
  const violations = [];

  // 檢查 .unwrap() 使用（測試檔案除外）
  const hasUnwrap = /\.unwrap\(\)/.test(content);
  const hasExpect = /\.expect\(/.test(content);

  if (hasUnwrap) {
    violations.push({
      layer: 6,
      category: 'Rust 安全性',
      message: 'Production 程式碼不應使用 .unwrap()',
      suggestion: '使用 ? 運算子或 .unwrap_or_default() / .map_err()'
    });
  }

  if (hasExpect) {
    violations.push({
      layer: 6,
      category: 'Rust 安全性',
      message: '.expect() 在 production 程式碼中應謹慎使用',
      suggestion: '改用 ? 運算子，或確認 expect 訊息描述了不可能發生的原因'
    });
  }

  return violations;
}

/**
 * Layer 7: Git 術語洩漏檢查
 * @param {string} content - 檔案內容
 * @returns {Array<{layer: number, category: string, message: string, suggestion: string}>}
 */
function checkGitTerminologyLeakage(content) {
  const violations = [];

  // 檢查 UI 可見字串中是否包含 Git 術語
  const gitTerms = /["'`].*\b(branch|commit|merge|HEAD|checkout|stash|rebase|cherry-pick|remote|clone)\b.*["'`]/i;
  // 排除註解和程式碼中的 Git API 呼叫
  const isCodeUsage = /git2|git_|\.branch\(|\.commit\(|\.merge\(|\.checkout\(/i.test(content);

  if (gitTerms.test(content) && !isCodeUsage) {
    violations.push({
      layer: 7,
      category: 'Git 術語洩漏',
      message: 'UI 字串中偵測到 Git 術語',
      suggestion: '使用概念翻譯表：branch→工作副本、commit→儲存版本、merge→核准合併'
    });
  }

  return violations;
}

/**
 * Layer 8: Tauri 阻塞 I/O 檢查
 * @param {string} content - 檔案內容
 * @param {string} filePath - 檔案路徑
 * @returns {Array<{layer: number, category: string, message: string, suggestion: string}>}
 */
function checkTauriBlockingIO(content, filePath) {
  const violations = [];

  // 僅在 Rust Tauri command 檔案檢查
  if (!isRustFile(filePath)) {
    return violations;
  }

  // 檢查 Tauri command 是否使用同步 I/O
  const hasTauriCommand = /#\[tauri::command\]/.test(content);
  const hasBlockingIO = /std::fs::|std::net::|std::io::Read|std::io::Write/.test(content);
  const hasAsync = /async\s+fn/.test(content);

  if (hasTauriCommand && hasBlockingIO && !hasAsync) {
    violations.push({
      layer: 8,
      category: 'Tauri 阻塞 I/O',
      message: 'Tauri command 使用了同步 I/O',
      suggestion: '改用 async fn + tokio::fs / tokio::net'
    });
  }

  if (hasTauriCommand && !hasAsync) {
    // 僅在有 I/O 操作的 command 中警告
    if (/git2::|Repository::/.test(content)) {
      violations.push({
        layer: 8,
        category: 'Tauri 阻塞 I/O',
        message: 'Git 操作的 Tauri command 建議使用 async',
        suggestion: '加上 async 並用 tokio::task::spawn_blocking 包裝 git2 操作'
      });
    }
  }

  return violations;
}

// ============================================================
// Layer 5: React 規範檢查（P1 警告）
// ============================================================

/**
 * Layer 5: React 規範檢查 + M6 React Lifecycle Sentinel
 * @param {string} content - 檔案內容
 * @param {string} filePath - 檔案路徑
 * @returns {Array<{layer: number, category: string, message: string, suggestion: string}>}
 */
function checkReactPatterns(content, filePath) {
  const warnings = [];

  // 僅檢查 React 檔案
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx') && !filePath.endsWith('.ts')) {
    return warnings;
  }

  // 檢查直接 DOM 操作（原有 L5）
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
    if (/document\.getElementById|document\.querySelector/.test(content)) {
      warnings.push({
        layer: 5,
        category: 'React 規範',
        message: '建議使用 React ref 而非直接 DOM 操作',
        suggestion: 'const ref = useRef<HTMLDivElement>(null)'
      });
    }
  }

  // M6 React Lifecycle Sentinel — 危險模式偵測
  try {
    const lifecycleFindings = checkReactLifecycle(content, filePath);
    for (const finding of lifecycleFindings) {
      warnings.push({
        layer: 5,
        category: `React Lifecycle (${finding.id})`,
        message: finding.message,
        suggestion: finding.suggestion
      });
    }
  } catch {
    // 模式庫載入失敗 → 靜默跳過
  }

  return warnings;
}

// ============================================================
// Layer 9: Library-First 架構檢查（P1 警告）
// ============================================================

/**
 * Layer 9: Library-First 架構檢查
 * @param {string} content - 檔案內容
 * @param {string} filePath - 檔案路徑
 * @returns {Array<{layer: number, category: string, message: string, suggestion: string}>}
 */
function checkLibraryFirst(content, filePath) {
  const warnings = [];

  // 僅檢查元件檔案（排除 UI 元件）
  if (!filePath.includes('/components/') || filePath.includes('/components/ui/')) {
    return warnings;
  }

  // 計算函數行數（簡化檢測）
  const functionMatches = content.match(/function\s+\w+[^{]*\{|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{/g);
  if (functionMatches) {
    // 檢查是否有複雜的資料處理鏈
    if (/\.map\([^)]+\)\.filter\([^)]+\)\.map\(/.test(content)) {
      warnings.push({
        layer: 9,
        category: 'Library-First 架構',
        message: '元件內有複雜資料處理邏輯',
        suggestion: '考慮提取到 src/lib/ 作為獨立函數'
      });
    }
  }

  return warnings;
}

// ============================================================
// Layer 10: Codebase Impact 檢查（P2 提示）
// ============================================================

/**
 * Layer 10: 模組影響分析
 * 編輯 src/lib/** 或 src/types/** 時顯示下游影響摘要
 * @param {string} filePath - 檔案路徑
 * @returns {{layer: number, category: string, message: string, suggestion: string} | null}
 */
function checkCodebaseImpact(filePath) {
  const moduleName = extractModuleName(filePath);
  if (!moduleName) return null;

  const impact = getModuleImpact(moduleName);
  if (!impact || impact.refs < 10) return null;

  return {
    layer: 10,
    category: 'Codebase Impact',
    message: formatImpactMessage(moduleName, impact),
    suggestion: '修改前可用 codebase-map skill 查詢完整依賴關係'
  };
}

// Layer 11: Reserved for future Keeply-specific guards
// (Git terminology leakage is already handled by Layer 7)

/**
 * 檢查是否有 code-guard-ignore 註解
 * @param {string} content - 檔案內容
 * @returns {Set<number>} - 要忽略的層級集合
 */
function getIgnoredLayers(content) {
  const ignored = new Set();

  // 檢查檔案級別的忽略
  const fileIgnore = content.match(/\/\*\s*code-guard-disable\s+([\d,\s]+)\s*\*\//);
  if (fileIgnore) {
    fileIgnore[1].split(',').forEach(n => ignored.add(parseInt(n.trim())));
  }

  return ignored;
}

/**
 * 核心檢查邏輯
 */
async function processCodeGuard(input) {
  const toolInput = input.tool_input || {};
  const content = toolInput.content || toolInput.new_string || '';
  const filePath = toolInput.file_path || '';

  // 只檢查程式碼檔案
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  const isCodeFile = codeExtensions.some(ext => filePath.endsWith(ext));

  if (!content || !isCodeFile) {
    return { result: 'continue' };
  }

  const violations = [];  // P0 阻斷
  const warnings = [];    // P1 警告
  const infos = [];       // P2 提示
  const lines = content.split('\n');

  // 獲取要忽略的層級
  const ignoredLayers = getIgnoredLayers(content);

  // ========================================
  // Layer 1-2: 語法/型別檢查（P0）
  // ========================================

  // Layer 1: 檢查 console.log（排除註解）
  if (!ignoredLayers.has(1)) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;
      if (/console\.log\s*\(/.test(trimmed)) {
        violations.push({
          layer: 1,
          category: '語法禁止',
          message: '檢測到 console.log',
          suggestion: '使用 logger.info / logger.debug / logger.error'
        });
        break;
      }
    }

    // 檢查 debugger
    if (/\bdebugger\b/.test(content)) {
      violations.push({
        layer: 1,
        category: '語法禁止',
        message: '檢測到 debugger 語句',
        suggestion: '移除 debugger，使用 IDE 斷點'
      });
    }
  }

  // Layer 2: 檢查 'any' 型別
  if (!ignoredLayers.has(2)) {
    if (/:\s*any\b|<any>|\bas\s+any\b/.test(content)) {
      violations.push({
        layer: 2,
        category: '型別安全',
        message: '檢測到 any type',
        suggestion: '使用具體型別或 unknown'
      });
    }

    // 檢查 @ts-ignore（無說明）
    if (/@ts-ignore(?!\s*-\s*\w)/.test(content)) {
      violations.push({
        layer: 2,
        category: '型別安全',
        message: '檢測到 @ts-ignore 無說明',
        suggestion: '改用 @ts-expect-error 並加上說明'
      });
    }
  }

  // ========================================
  // Layer 3-4: 安全性檢查（P0）
  // ========================================

  if (!ignoredLayers.has(3)) {
    violations.push(...checkXSSInjection(content));
  }

  if (!ignoredLayers.has(4)) {
    violations.push(...checkSensitiveData(content));
  }

  // ========================================
  // Layer 6-8: 領域規則檢查（P0）
  // ========================================

  if (!ignoredLayers.has(6) && isRustFile(filePath)) {
    violations.push(...checkRustUnwrap(content));
  }

  if (!ignoredLayers.has(7) && isUIFile(filePath)) {
    violations.push(...checkGitTerminologyLeakage(content));
  }

  if (!ignoredLayers.has(8)) {
    violations.push(...checkTauriBlockingIO(content, filePath));
  }

  // ========================================
  // Layer 5, 9: 警告級別（P1）
  // ========================================

  if (!ignoredLayers.has(5)) {
    warnings.push(...checkReactPatterns(content, filePath));
  }

  if (!ignoredLayers.has(9)) {
    warnings.push(...checkLibraryFirst(content, filePath));
  }

  // ========================================
  // Layer 10: Codebase Impact（P2 提示）
  // ========================================

  if (!ignoredLayers.has(10)) {
    const impactCheck = checkCodebaseImpact(filePath);
    if (impactCheck) {
      infos.push(impactCheck);
    }
  }

  // ========================================
  // TDD 檢查（P2 提示）
  // ========================================

  const testCheck = checkTestFile(filePath);
  if (testCheck && !testCheck.exists) {
    infos.push({
      layer: 0,
      category: 'TDD',
      message: `建議先創建測試 ${testCheck.testPath}`,
      suggestion: 'TDD: 紅燈 → 綠燈 → 重構'
    });
  }

  // ========================================
  // 處理結果
  // ========================================

  if (violations.length > 0) {
    // P0 違規：阻止
    const violationText = violations.map(v =>
      `[Layer ${v.layer}] ${v.category}\n  └─ ${v.message}\n     修正：${v.suggestion}`
    ).join('\n\n');

    return {
      result: 'block',
      reason: `
❌ P0 Violation Detected (blocked by code-guard hook v3.0)

發現 ${violations.length} 個阻斷級別問題：

${violationText}

請修正後重試。

（可用 /* code-guard-disable 層級編號 */ 跳過特定檢查，但需說明原因）
`
    };
  }

  // P1 警告 + P2 提示：不阻斷
  if (warnings.length > 0 || infos.length > 0) {
    const warningText = warnings.map(w =>
      `[Layer ${w.layer}] ${w.category}: ${w.message}`
    ).join('\n');

    const infoText = infos.map(i =>
      `[${i.category}] ${i.message}`
    ).join('\n');

    let message = '';
    if (warnings.length > 0) {
      message += `\n⚠️ P1 警告（不阻斷）：\n${warningText}\n`;
    }
    if (infos.length > 0) {
      message += `\n📝 P2 提示：\n${infoText}\n`;
    }

    return {
      result: 'continue',
      message
    };
  }

  return { result: 'continue' };
}

// 包裝核心邏輯添加計時功能
const timedProcessCodeGuard = withTiming(processCodeGuard, 'code-guard');

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const response = await timedProcessCodeGuard(input);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(JSON.stringify({
      result: 'continue',
      error: error.message
    }));
  }
}

main();
