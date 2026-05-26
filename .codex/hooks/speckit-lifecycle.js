#!/usr/bin/env node
/**
 * SDD Lifecycle Hook
 *
 * UserPromptSubmit hook: 掃描 specs/ 找所有進行中的 SDD 規格，
 * 注入 phase-aware 提示引導 agent 走正確的 SDD 步驟。
 *
 * M3 Ambiguity Hard Gate (v4.0):
 * 當 prompt 包含 /speckit.tasks 時，掃描 active spec 的 checklists/
 * 偵測未解決的 [Gap] 和 [Ambiguity] 標記。HIGH 級 → BLOCK。
 *
 * M4 Contract Verification Gate (v5.0):
 * 當 prompt 包含 /speckit.tasks 時，掃描 active spec 的 plan.md
 * 偵測 Runtime Contract Verification 表中的 FAIL 項目。任何 FAIL → BLOCK。
 *
 * @version 6.0.0
 * @since 2026-03-12
 * @updated 2026-03-25 - V237: Flow Continuity Alert (Anti-Amnesia)
 */

const path = require('path');

const SPECS_DIR = path.join(process.cwd(), 'specs');

// Phase-aware 提示映射（SDD）
const PHASE_HINTS = {
  discovered: '打 /sdd 進入 Research 階段（技術研究）',
  researched: '使用 /speckit.specify 產生規格書',
  needs_clarify: '使用 /speckit.clarify 解決模糊標記',
  specify: '使用 /speckit.plan 產生技術方案',
  plan: '使用 /speckit.checklist 檢查規格品質',
  needs_checklist: '使用 /speckit.checklist 檢查規格品質',
  needs_tasks: '使用 /speckit.tasks 拆解任務',
  tasks: '使用 /speckit.implement 執行實作',
  needs_analyze: '使用 /speckit.analyze 交叉檢查一致性',
  implement_done: '使用 /speckit.check 驗證 → 通過後 /speckit.renew 收尾'
};

// Phase-aware 提示映射（WEB）
const IBV_PHASE_HINTS = {
  intent_done: '打 /web {name} 繼續（ARCHITECT 階段：AI 自主研究+規劃）',
  architect_done: '打 /web {name} 繼續（VISUAL GATE：確認外觀）',
  building: '打 /web {name} 繼續（BUILD 階段：AI 自主建置）',
  build_done: '打 /web {name} 繼續（DELIVER 階段：驗收結果）',
  delivered: '已完成交付'
};

async function main() {
  try {
    let inputData = '';
    for await (const chunk of process.stdin) {
      inputData += chunk;
    }

    const parsed = JSON.parse(inputData);
    const rawText = (parsed.prompt || parsed.message || parsed.content || '').trim();

    // /speckit.* 和 /verify 和 /web.*|/ibv.* 有自己的工作流 → 跳過
    // 例外：/speckit.tasks 需要 M3 Ambiguity Gate 檢查
    // 例外：/speckit.specify|plan|renew 需要 M8 Bridge Impact Check 提醒
    // /sdd 需要 phase 提示 → 不跳過
    // /web 和 /ibv 需要 phase 提示 → 不跳過（但 /web.architect|build|deliver 跳過）
    const isTasksCommand = /^\/?speckit\.tasks\b/i.test(rawText);
    const isBridgeAwareCommand = /^\/?speckit\.(specify|plan|renew)\b/i.test(rawText);
    const isIbvSubCommand = /^\/?(?:ibv|web)\.(architect|build|deliver)\b/i.test(rawText);

    if ((/^\/(speckit\.|verify\b)/i.test(rawText) || isIbvSubCommand) && !isTasksCommand && !isBridgeAwareCommand) {
      console.log(JSON.stringify({ result: 'continue' }));
      return;
    }

    // === M8 Bridge Impact Check Reminder (Constitution Art.19) ===
    if (isBridgeAwareCommand) {
      const fs = require('fs');
      const bridgesDir = path.join(process.cwd(), '.speckit', 'bridges');
      try {
        const bridgeFiles = fs.readdirSync(bridgesDir).filter(f => f.endsWith('.md') && f !== 'TEMPLATE.md');
        if (bridgeFiles.length > 0) {
          const cmdMatch = rawText.match(/speckit\.(specify|plan|renew)/i);
          const cmd = cmdMatch ? cmdMatch[1].toLowerCase() : '';
          const hints = {
            specify: 'Step 3.6.5: Impact Map 涉及 bus source file → 讀取 Bridge Spec 預填消費者。STABLE 變更 → 強制 clarify。',
            plan: 'Step 2.4.5: 修改 bus exports → 建立 Bridge Contract Update 任務。',
            renew: 'Step 8.5: 掃描新增 bridge import → append Consumer Registry + patch version bump。'
          };
          const hint = hints[cmd] || '';
          console.log(JSON.stringify({
            result: 'continue',
            additionalContext: `\n⚠️  M8 Bridge Impact Check (Constitution Art.19)\nBridge Specs: ${bridgeFiles.join(', ')}\n→ ${hint}\n`
          }));
        } else {
          console.log(JSON.stringify({ result: 'continue' }));
        }
      } catch {
        // .speckit/bridges/ 不存在 → 無需提醒
        console.log(JSON.stringify({ result: 'continue' }));
      }
      return;
    }

    // === M3 + M4 Gates for /speckit.tasks ===
    if (isTasksCommand) {
      const hasAmbiguityBypass = /AMBIGUITY-BYPASS:\s*.+/i.test(rawText);
      const hasContractBypass = /CONTRACT-BYPASS:\s*.+/i.test(rawText);

      try {
        const sddState = require('./lib/sdd-state');
        const activeSpecs = sddState.findActiveSpecs();
        const advisoryMessages = [];

        for (const spec of activeSpecs) {
          // 只檢查有 plan/checklist 的 spec（plan 之後的階段）
          if (!['plan', 'needs_checklist', 'tasks', 'needs_tasks'].includes(spec.phase)) continue;

          // M3: Ambiguity Hard Gate — 未解決 Gap 檢查
          if (!hasAmbiguityBypass) {
            const gapResult = sddState.detectUnresolvedGaps(spec.dir);
            if (gapResult.highGaps > 0) {
              const report = sddState.formatGateReport(gapResult);
              console.log(JSON.stringify({
                result: 'block',
                reason: `M3 Ambiguity Hard Gate — ${spec.id}\n${report}`
              }));
              return;
            }
            if (gapResult.totalGaps > 0) {
              advisoryMessages.push(sddState.formatGateReport(gapResult));
            }
          }

          // M4: Contract Verification Gate — plan.md FAIL 檢查
          if (!hasContractBypass) {
            const contractResult = sddState.detectContractFailures(spec.dir);
            if (contractResult.totalFails > 0) {
              const report = sddState.formatContractReport(contractResult);
              console.log(JSON.stringify({
                result: 'block',
                reason: `M4 Contract Verification Gate — ${spec.id}\n${report}`
              }));
              return;
            }
          }
        }

        // All gates passed
        if (advisoryMessages.length > 0) {
          console.log(JSON.stringify({
            result: 'continue',
            additionalContext: advisoryMessages.join('\n')
          }));
        } else {
          console.log(JSON.stringify({ result: 'continue' }));
        }
      } catch (e) {
        console.error(`[speckit-lifecycle] M3/M4 gate error: ${e.message}`);
        console.log(JSON.stringify({ result: 'continue' }));
      }
      return;
    }

    // 用 sdd-state.findActiveSpecs() 掃描所有非 renewed 的 spec（含所有 phase）
    let sddState;
    let activeSpecs = [];
    try {
      sddState = require('./lib/sdd-state');
      activeSpecs = sddState.findActiveSpecs();
    } catch {
      // sdd-state 載入失敗 → 無法提供 phase 提示
      console.log(JSON.stringify({ result: 'continue' }));
      return;
    }

    if (activeSpecs.length === 0) {
      console.log(JSON.stringify({ result: 'continue' }));
      return;
    }

    // 分離 SDD 和 IBV specs
    let sddSpecs = [];
    let ibvSpecs = [];
    try {
      for (const spec of activeSpecs) {
        if (sddState.isIbvSpec(spec.dir)) {
          const ibvPhase = sddState.detectIbvPhase(spec.dir);
          ibvSpecs.push({ ...spec, ibvPhase });
        } else {
          sddSpecs.push(spec);
        }
      }
    } catch {
      sddSpecs = activeSpecs;
    }

    // 格式化提醒
    const lines = [''];
    if (sddSpecs.length > 0) {
      lines.push('📋 SDD 進行中的規格:');
      for (const spec of sddSpecs) {
        const hint = PHASE_HINTS[spec.phase] || '打 /sdd 繼續';
        lines.push(`   - ${spec.id} [${spec.phase}] → ${hint}`);
      }
    }
    if (ibvSpecs.length > 0) {
      lines.push('📋 WEB 進行中的規格:');
      for (const spec of ibvSpecs) {
        const hint = (IBV_PHASE_HINTS[spec.ibvPhase] || '打 /web 繼續').replace('{name}', spec.id);
        lines.push(`   - ${spec.id} [WEB:${spec.ibvPhase}] → ${hint}`);
      }
    }
    lines.push('');

    // === V237: Flow Continuity Alert (Anti-Amnesia) ===
    try {
      const flowChecklist = sddState.getFlowChecklist();
      if (flowChecklist) {
        lines.push(flowChecklist);

        // 檢查是否有 spec 在 auto-chain zone
        const state = sddState.loadState();
        const autoChainSpecs = Object.entries(state.flowTracker || {})
          .filter(([, t]) => t.inAutoChain);

        if (autoChainSpecs.length > 0) {
          lines.push('');
          for (const [specId, tracker] of autoChainSpecs) {
            if (tracker.workflow === 'ibv' || tracker.workflow === 'web') {
              lines.push('>>> WEB FLOW CONTINUITY ALERT <<<');
              lines.push('你在 WEB AUTO-CHAIN ZONE。');
              lines.push('DO NOT 等待使用者輸入。立即執行下一步。');
              lines.push(`  ACTION: /web.${tracker.nextStep} ${specId}`);
              lines.push('>>>>>>>>>>>>>>>>>>>>>>>>>>><<<');
            } else {
              lines.push('>>> SDD FLOW CONTINUITY ALERT <<<');
              lines.push('你在 EXECUTION ZONE (自動連鎖區)。');
              lines.push('DO NOT 等待使用者輸入。立即執行下一步。');
              lines.push(`  ACTION: /speckit.${tracker.nextStep} ${specId}`);
              lines.push('>>>>>>>>>>>>>>>>>>>>>>>>>>><<<');
            }
          }
        }
      }
    } catch { /* flow tracker not available — skip silently */ }

    console.log(JSON.stringify({
      result: 'continue',
      additionalContext: lines.join('\n')
    }));

  } catch (error) {
    console.error(`[speckit-lifecycle] Error: ${error.message}`);
    console.log(JSON.stringify({ continue: true }));
  }
}

main();
