#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * PreToolUse hook: Worktree 安全驗證提醒
 * 偵測 git worktree add 命令，提供安全建議
 *
 * @version 1.1.0
 * @since 2025-12-26
 * @updated 2026-01-12 - AgentOps 可觀測性整合
 */

const fs = require('fs');
const path = require('path');

// AgentOps 可觀測性整合
const { withTiming } = require('./lib/timing-wrapper');

/**
 * 核心檢查邏輯
 */
async function processWorktreeGuard(input) {
  const toolInput = input.tool_input || {};
  const command = toolInput.command || '';

  // 只檢查 git worktree add 命令
  if (!command.includes('git worktree add')) {
    return { result: 'continue' };
  }

  const warnings = [];

  // 檢查 .gitignore 是否包含 .worktrees/
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  let hasWorktreesIgnored = false;

  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    hasWorktreesIgnored = gitignoreContent.includes('.worktrees/') ||
                         gitignoreContent.includes('.worktrees');
  }

  if (!hasWorktreesIgnored) {
    warnings.push(`
.worktrees/ 尚未加入 .gitignore
建議先執行：echo '.worktrees/' >> .gitignore && git add .gitignore`);
  }

  // 檢查是否使用推薦的 .worktrees/ 目錄
  const usesRecommendedDir = command.includes('.worktrees/');
  if (!usesRecommendedDir) {
    warnings.push(`
建議使用專案內 .worktrees/ 目錄：
git worktree add .worktrees/[功能名] -b [類型]/[功能名]`);
  }

  // 組合提醒訊息
  return {
    result: 'continue',
    additionalContext: `
**Worktree Safety Reminder** (auto-injected by worktree-guard hook)

${warnings.length > 0 ? warnings.join('\n') : ''}

Baseline Test Reminder:
建立 worktree 後請執行基線測試：
\`\`\`bash
cd .worktrees/[功能名]
npm install
npm run test -- --run && npm run type-check
\`\`\`

Finishing Options (完成後 4 選項):
1. Merge locally → 合併到 main → 刪除分支 → 清理 worktree
2. Push and create PR → 推送並建立 PR → 保留 worktree
3. Keep as-is → 保留不動
4. Discard → 確認後刪除
`
  };
}

// 包裝核心邏輯添加計時功能
const timedProcessWorktreeGuard = withTiming(processWorktreeGuard, 'worktree-guard');

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const response = await timedProcessWorktreeGuard(input);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(JSON.stringify({
      result: 'continue',
      error: error.message
    }));
  }
}

main();
