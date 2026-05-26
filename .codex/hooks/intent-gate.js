#!/usr/bin/env node
/**
 * Intent Gate Hook: Modification Intent Enforcement + SDD Awareness
 *
 * Detects modification intent and enforces think-first workflow.
 * For SDD-scale work, injects phase-aware guidance (specify→plan→tasks→implement→renew).
 * Skill matching is delegated to Claude Code's native Progressive Disclosure.
 *
 * @version 3.0.0
 * @since 2026-01-04
 * @updated 2026-03-05 - V157: Remove redundant skill matching (ETH Zurich: broad context hurts)
 * @updated 2026-03-09 - V175: Auto-start workflow tracker on modification intent
 * @updated 2026-03-17 - V3: SDD awareness + implement mode tracking
 */

const MODIFY_KEYWORDS = [
  '改', '修', '調', '重構', '新增', '加', '建', '優化', '處理', '實作',
  '刪除', '移除', '更新', '調整', '整合', '拆分', '合併',
  'refactor', 'add', 'fix', 'update', 'implement', 'create', 'delete',
  'remove', 'change', 'modify', 'build', 'optimize', 'integrate'
];

/**
 * SDD phase → 下一步指引映射
 *
 * 權威流程：specify → clarify → plan → checklist → tasks → analyze → implement → renew
 */
const SDD_PHASE_GUIDANCE = {
  needs_clarify: { next: '/speckit.clarify', msg: 'Spec 有未解決的 [NEEDS CLARIFICATION]，先執行 /speckit.clarify' },
  specify: { next: '/speckit.plan', msg: 'Spec 已建立但無 plan，先執行 /speckit.plan' },
  needs_checklist: { next: '/speckit.checklist', msg: 'Plan 已建立但無 checklist，先執行 /speckit.checklist' },
  needs_tasks: { next: '/speckit.tasks', msg: 'Checklist 完成，先執行 /speckit.tasks 拆解任務' },
  tasks: { next: '/speckit.implement', msg: 'Tasks 進行中 — 用 /speckit.implement 執行實作' },
  needs_analyze: { next: '/speckit.analyze', msg: 'Tasks 完成，建議執行 /speckit.analyze 交叉檢查一致性' },
  implement_done: { next: '/speckit.check', msg: '實作已完成，執行 /speckit.check 驗證 → 通過後 /speckit.renew 收尾' }
};

async function processIntentGate(input) {
  const prompt = input.prompt || '';
  const lowerPrompt = prompt.toLowerCase();
  const isModifyIntent = MODIFY_KEYWORDS.some(kw => lowerPrompt.includes(kw.toLowerCase()));

  // SDD implement mode tracking（不論是否有修改意圖都要檢查）
  try {
    const sddState = require('./lib/sdd-state');
    if (sddState.isImplementCommand(prompt)) {
      sddState.setImplementActive(true);
    }

    // SDD-BYPASS 檢查
    const bypassReason = sddState.checkBypass(prompt);
    if (bypassReason) {
      sddState.logBypass(bypassReason);
    }
  } catch { /* sdd-state failure must not block */ }

  // Skill 命令已有自己的工作流——跳過 modification intent 偵測
  // /speckit.* 有 SDD lifecycle，/sdd 是 orchestrator，/ibv 是 IBV orchestrator，/verify 等工具命令
  // 同時檢查 prompt 和 message 欄位（UserPromptSubmit 可能用不同欄位名）
  const rawText = (input.prompt || input.message || input.content || '').trim();
  const isSkillCommand = /^\/(speckit\.|sdd\b|ibv\b|web\b|web\.|verify\b)/i.test(rawText);
  if (isSkillCommand) {
    return { result: 'continue' };
  }

  if (isModifyIntent) {
    // V175: Auto-start workflow tracker
    let workflowHint = '';
    try {
      const tracker = require('./lib/workflow-tracker');
      if (!tracker.getStatus().active) {
        tracker.start('modification_flow', { trigger: prompt.slice(0, 100) });
      }
      workflowHint = '\n' + tracker.getProgressHint();
    } catch { /* tracker failure must not block intent gate */ }

    // SDD awareness: 偵測進行中的 spec 並注入階段指引
    // think-first Step 1.1 會判斷是否路由到 SDD，這裡只提供 context
    let sddHint = '';
    try {
      const sddState = require('./lib/sdd-state');
      if (!sddState.checkBypass(prompt)) {
        const activeSpecs = sddState.findActiveSpecs();
        if (activeSpecs.length > 0) {
          const spec = activeSpecs[0];
          const guidance = SDD_PHASE_GUIDANCE[spec.phase];
          if (guidance) {
            sddHint = `\n**SDD Context**: Spec \`${spec.id}\` 在 \`${spec.phase}\` 階段 — think-first Step 1.1 將判斷是否路由至 SDD`;
          }
        }
      }
    } catch { /* sdd-state failure must not block */ }

    return {
      result: 'continue',
      additionalContext: '**Modification Intent** — think-first 工作流必須啟動。先確認需求再動手。' + workflowHint + sddHint
    };
  }
  return { result: 'continue' };
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) { chunks.push(chunk); }
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    console.log(JSON.stringify(await processIntentGate(input)));
  } catch (error) {
    console.log(JSON.stringify({ result: 'continue' }));
  }
}
main();
