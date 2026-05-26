#!/usr/bin/env node
/**
 * PostToolUse hook: 在 Write/Edit 後自動格式化程式碼
 * 對應 Boris Cherny 建議 #9
 *
 * "Claude usually generates well-formatted code out of the box,
 *  and the hook handles the last 10% to avoid formatting errors in CI later."
 *
 * @version 1.3.0
 * @since 2026-01-03
 * @updated 2026-01-14 - V57.1 整合 Meta-Orchestrator Verifier 層
 * @updated 2026-02-02 - V79.2 修復驗證整合：傳遞所有 staged files
 */

const { execSync } = require('child_process');
const path = require('path');

// V57.1: Meta-Orchestrator Verifier 整合
const { verifyOutput, formatVerificationReport } = require('./lib/output-verifier');
const { reflectOnFailure, formatReflectionReport } = require('./lib/failure-reflector');

// AgentOps 可觀測性整合
const { withTiming } = require('./lib/timing-wrapper');

/**
 * 核心格式化邏輯
 */
async function processPostToolUse(input) {
  const toolName = input.tool_name;
  const toolInput = input.tool_input || {};
  const filePath = toolInput.file_path || '';

  // 只處理 Edit/Write
  if (toolName !== 'Edit' && toolName !== 'Write') {
    return { result: 'continue' };
  }

  // 只處理 TypeScript/JavaScript 檔案
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx'];
  const ext = path.extname(filePath);
  if (!codeExtensions.includes(ext)) {
    return { result: 'continue' };
  }

  // 跳過 node_modules 和 .next
  if (filePath.includes('node_modules') || filePath.includes('.next')) {
    return { result: 'continue' };
  }

  const fileName = path.basename(filePath);
  let formatResult = '';
  let verifyResult = '';

  // Step 1: ESLint 自動修復（已停用 — 每次 Edit 耗費 ~2s，改由 lint-staged 在 commit 時執行）
  // 如需重新啟用，將下方 SKIP_ESLINT_AUTOFIX 改為 false
  const SKIP_ESLINT_AUTOFIX = true;
  if (!SKIP_ESLINT_AUTOFIX) {
    try {
      execSync(`npx eslint --fix --quiet "${filePath}"`, {
        cwd: process.cwd(),
        stdio: 'pipe',
        timeout: 10000
      });
      formatResult = `✓ ${fileName}`;
    } catch (error) {
      formatResult = `⚠ ${fileName}: lint code ${error.status || 'unknown'}`;

      // V57.1: 使用 Reflector 分析失敗
      const reflection = reflectOnFailure({ error: error.message || 'ESLint failed' });
      if (reflection.action === 'auto-recover') {
        verifyResult = `\n${formatReflectionReport(reflection)}`;
      }
    }
  }

  // Step 2: V79.2 約束驗證 - 使用所有 staged files
  const coreModules = ['src-tauri/src/git', 'src-tauri/src/nas', 'src/components/workspace'];
  const isCore = coreModules.some(m => filePath.includes(m));

  if (isCore) {
    // V79.2: 讀取所有 staged files 而非只傳遞當前檔案
    let stagedFiles = [filePath];
    try {
      const stagedOutput = execSync('git diff --cached --name-only', {
        encoding: 'utf-8',
        stdio: 'pipe',
        timeout: 5000
      });
      const allStaged = stagedOutput.trim().split('\n').filter(Boolean);
      if (allStaged.length > 0) {
        stagedFiles = allStaged;
      }
    } catch {
      // Git 操作失敗，使用當前檔案
    }

    const verification = verifyOutput('post-tool-hook', {
      cwd: process.cwd(),
      modifiedFiles: stagedFiles
    });

    if (verification.warnings.length > 0) {
      verifyResult += `\n⚠ ${verification.warnings.map(w => w.warning).join(', ')}`;
    }

    // V79.2: 如果驗證失敗，記錄錯誤
    if (!verification.passed && verification.failures.length > 0) {
      verifyResult += `\n❌ 驗證失敗: ${verification.failures.map(f => f.error || f.description).join('; ')}`;
    }
  }

  return {
    result: 'continue',
    additionalContext: formatResult + verifyResult
  };
}

// 包裝核心邏輯添加計時功能
const timedProcessPostToolUse = withTiming(processPostToolUse, 'post-tool-use');

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const response = await timedProcessPostToolUse(input);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(JSON.stringify({
      result: 'continue',
      error: error.message
    }));
  }
}

main();
