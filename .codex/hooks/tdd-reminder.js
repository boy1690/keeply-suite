#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, security/detect-non-literal-fs-filename */
/**
 * PreToolUse hook: TDD 紀律提醒
 * 偵測寫入 src/*.ts 檔案時，檢查對應測試檔是否存在
 *
 * @version 1.1.0
 * @since 2025-12-26
 * @updated 2026-01-12 - AgentOps 可觀測性整合
 */

const fs = require('fs');
const path = require('path');

// AgentOps 可觀測性整合
const { withTiming } = require('./lib/timing-wrapper');

// 排除的路徑模式
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  '__tests__',
  '.test.',
  '.spec.',
  'test.',
  'spec.',
  '.d.ts'
];

// 推斷測試檔路徑
function getTestPaths(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);

  return [
    // 同目錄 __tests__ 資料夾
    path.join(dir, '__tests__', `${baseName}.test${ext}`),
    path.join(dir, '__tests__', `${baseName}.spec${ext}`),
    // 同目錄
    path.join(dir, `${baseName}.test${ext}`),
    path.join(dir, `${baseName}.spec${ext}`),
    // e2e 目錄
    path.join(process.cwd(), 'e2e', `${baseName}.spec${ext}`)
  ];
}

/**
 * 核心檢查邏輯
 */
async function processTddReminder(input) {
  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || '';

  // 只檢查 src/ 下的 .ts/.tsx 檔案
  const isSourceFile = filePath.includes('src') &&
                      (filePath.endsWith('.ts') || filePath.endsWith('.tsx'));

  // 排除測試檔和其他不需要的檔案
  const isExcluded = EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));

  if (!isSourceFile || isExcluded) {
    return { result: 'continue' };
  }

  // 檢查對應測試檔是否存在
  const testPaths = getTestPaths(filePath);
  const existingTestPath = testPaths.find(p => fs.existsSync(p));

  if (existingTestPath) {
    // 測試檔存在，無需提醒
    return { result: 'continue' };
  }

  // 測試檔不存在，發出 TDD 提醒
  const relativePath = path.relative(process.cwd(), filePath);
  const suggestedTestPath = testPaths[0]; // 建議的測試檔路徑
  const relativeTestPath = path.relative(process.cwd(), suggestedTestPath);

  return {
    result: 'continue',
    additionalContext: `
**TDD Reminder** (auto-injected by tdd-reminder hook)

正在寫入: ${relativePath}
對應測試: ${relativeTestPath} (不存在)

Iron Law: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST

建議流程:
1. 先寫失敗測試 (RED)
2. 執行測試確認失敗原因正確
3. 寫最少程式碼讓測試通過 (GREEN)
4. 重構保持測試綠燈 (REFACTOR)

Red Flags (如果符合，考慮重來):
- 先寫碼後測試
- 測試立刻通過
- '只是這次例外'
- '已經手動測試過了'
- '測試寫在後面效果一樣'

這是提醒而非阻擋。如確實不需要測試（如型別定義檔），可忽略此訊息。
`
  };
}

// 包裝核心邏輯添加計時功能
const timedProcessTddReminder = withTiming(processTddReminder, 'tdd-reminder');

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const response = await timedProcessTddReminder(input);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(JSON.stringify({
      result: 'continue',
      error: error.message
    }));
  }
}

main();
