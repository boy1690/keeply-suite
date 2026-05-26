#!/usr/bin/env node
/**
 * Retrospective Hook - 任務回顧學習 + M7 Fossil 萃取
 *
 * V2.0.0: Hook-First 架構
 * - 不再寫入 .claude/logs/retrospective/ 目錄（消除 merge conflict 風險）
 * - 只存 memory entry（semantic layer）
 * - 提高閾值 count >= 3（減少噪音）
 *
 * V3.0.0: M7 Failure Fossil Record
 * - Stop 時掃描 specs/ 找 ITERATE verdict 的 check-report.md
 * - 自動萃取 fossil 候選並存入 .claude/memory/fossils/
 * - 同時執行衰減（90 天未觸發 → 歸檔）
 *
 * V4.0.0: M10 Behavioral Protocol Library
 * - 高觸發 fossils (trigger_count >= 3) 自動升級為 protocol 草稿
 * - Protocol 衰減（90 天未使用 → 歸檔）
 * - Sonnet failure → protocol 萃取（由 speckit.implement Step 6.5 觸發）
 *
 * @version 4.0.0
 * @since 2026-01-13
 * @updated 2026-03-25 - V4: M10 Protocol 自動升級 + 衰減
 */

const { withTiming } = require('./lib/timing-wrapper');
const { getAllSkillStats, getTopPerformers, getLowPerformers, getRecentlyUsed } = require('./lib/skill-metrics');

let memoryEngine;
let learningEngine;
let fossilEngine;
let protocolEngine;
try {
  memoryEngine = require('./lib/memory-engine');
  learningEngine = require('./lib/learning-engine');
} catch {
  memoryEngine = null;
  learningEngine = null;
}
try {
  fossilEngine = require('./lib/fossil-engine');
} catch {
  fossilEngine = null;
}
try {
  protocolEngine = require('./lib/protocol-engine');
} catch {
  protocolEngine = null;
}

/**
 * 分析本次 session 的 skill 使用情況
 */
function analyzeSession() {
  const recentSkills = getRecentlyUsed(10);
  const topPerformers = getTopPerformers(3);
  const lowPerformers = getLowPerformers(3);
  const allStats = getAllSkillStats();

  return {
    recent_skills: recentSkills,
    top_performers: topPerformers,
    low_performers: lowPerformers,
    aggregates: allStats?.aggregates || null,
  };
}

/**
 * 提取並存儲 lessons-learned 到 semantic 記憶
 */
function extractAndStoreLessonsLearned(analysis) {
  if (!memoryEngine || !learningEngine) {
    return { stored: false, reason: 'engines not available' };
  }

  try {
    const lessons = [];

    // 1. 從錯誤模式學習（閾值 >= 3，減少噪音）
    const errors = learningEngine.getCommonErrors();
    for (const error of errors) {
      if (error.count >= 3) {
        lessons.push({
          type: 'error_pattern',
          pattern: error.errorPattern,
          skill: error.skill,
          frequency: error.count,
          insight: `Skill "${error.skill}" 常遇到此類錯誤，考慮加強防禦`
        });
      }
    }

    // 2. 從成功模式學習
    if (analysis.top_performers) {
      for (const skill of analysis.top_performers) {
        if (skill.success_rate > 0.85) {
          lessons.push({
            type: 'success_pattern',
            skill: skill.name,
            successRate: skill.success_rate,
            insight: `Skill "${skill.name}" 表現優異，可作為範本`
          });
        }
      }
    }

    // 3. 從低表現 skill 學習改進點
    if (analysis.low_performers) {
      for (const skill of analysis.low_performers) {
        if (skill.success_rate < 0.75) {
          lessons.push({
            type: 'improvement_needed',
            skill: skill.name,
            successRate: skill.success_rate,
            insight: `Skill "${skill.name}" 需要改進，成功率僅 ${Math.round(skill.success_rate * 100)}%`
          });
        }
      }
    }

    // 4. 無論如何都記錄 session 摘要
    if (analysis.recent_skills.length > 0 || analysis.aggregates?.total_invocations > 0) {
      lessons.push({
        type: 'session_summary',
        skills_used: analysis.recent_skills.map(s => s.name),
        total_invocations: analysis.aggregates?.total_invocations || 0,
        overall_success_rate: analysis.aggregates?.overall_success_rate || 0,
        timestamp: new Date().toISOString()
      });
    }

    // 5. 存入 semantic 記憶層（不再寫入 log 檔案）
    if (lessons.length > 0) {
      memoryEngine.storeSemantic({
        date: new Date().toISOString().split('T')[0],
        sessionId: `session-${Date.now()}`,
        lessonsCount: lessons.length,
        lessons
      }, {
        type: 'auto_lessons',
        source: 'retrospective-hook'
      });

      return { stored: true, count: lessons.length };
    }

    return { stored: false, reason: 'no lessons to store' };
  } catch (error) {
    return { stored: false, reason: error.message };
  }
}

// ============================================================
// M7: Fossil 萃取 + 衰減
// ============================================================

const fs = require('fs');
const path = require('path');

const SPECS_DIR = path.join(process.cwd(), 'specs');

/**
 * 掃描 specs/ 找 ITERATE check-report，萃取 fossil 候選
 * @returns {{ extracted: number, decayed: number, errors: string[] }}
 */
function processFossils() {
  if (!fossilEngine) return { extracted: 0, decayed: 0, errors: ['fossil-engine not available'] };

  const result = { extracted: 0, decayed: 0, errors: [] };

  try {
    // 1. 掃描活躍 spec 目錄找 check-report.md
    if (fs.existsSync(SPECS_DIR)) {
      const specDirs = scanSpecDirsWithCheckReport(SPECS_DIR);
      for (const { specId, checkReportPath, specDir } of specDirs) {
        try {
          const reportContent = fs.readFileSync(checkReportPath, 'utf-8');

          // 只對 ITERATE 或 ESCALATE verdict 萃取 fossil
          const verdictMatch = reportContent.match(/^verdict:\s*(ITERATE|ESCALATE)/m);
          if (!verdictMatch) continue;

          // 提取受影響檔案（從 check-report 或 plan.md Impact Map）
          const affectedFiles = extractAffectedFiles(specDir);

          // 萃取 fossil 候選
          const candidate = fossilEngine.extractFossilCandidate({
            specId,
            verdict: verdictMatch[1],
            checkReport: reportContent,
            affectedFiles
          });

          if (candidate) {
            // 檢查是否已有相似 fossil（避免重複）
            const existing = fossilEngine.loadAllFossils();
            const isDuplicate = existing.some(f =>
              f.source_version === candidate.source_version &&
              f.failure_type === candidate.failure_type
            );

            if (!isDuplicate) {
              const saveResult = fossilEngine.saveFossil(candidate);
              if (saveResult.success) {
                result.extracted++;
              } else {
                result.errors.push(`Save failed for ${specId}: ${saveResult.error}`);
              }
            }
          }
        } catch (e) {
          result.errors.push(`${specId}: ${e.message}`);
        }
      }
    }

    // 2. 執行衰減
    const decayResult = fossilEngine.runDecay();
    result.decayed = decayResult.archived.length;

  } catch (e) {
    result.errors.push(`Fossil processing error: ${e.message}`);
  }

  return result;
}

/**
 * 遞迴掃描 specs/ 找含有 check-report.md 的目錄（排除 .recycle-bin）
 */
function scanSpecDirsWithCheckReport(baseDir) {
  const results = [];
  try {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;

      const dirPath = path.join(baseDir, entry.name);

      // 檢查 check-report.md 是否存在
      const checkReportPath = path.join(dirPath, 'check-report.md');
      if (fs.existsSync(checkReportPath)) {
        results.push({
          specId: entry.name,
          specDir: dirPath,
          checkReportPath
        });
      }

      // 遞迴掃描子目錄（如 specs/M1-git-core/002-git-engine/）
      const subResults = scanSpecDirsWithCheckReport(dirPath);
      results.push(...subResults);
    }
  } catch {
    // 目錄不可讀 → 跳過
  }
  return results;
}

/**
 * 從 spec 目錄提取受影響檔案列表
 */
function extractAffectedFiles(specDir) {
  const files = [];

  // 嘗試從 plan.md 的 Impact Map 提取
  const planPath = path.join(specDir, 'plan.md');
  if (fs.existsSync(planPath)) {
    try {
      const content = fs.readFileSync(planPath, 'utf-8');
      // 匹配 | `src/...` | 格式的檔案路徑
      const pathMatches = content.match(/`(src\/[^`]+)`/g);
      if (pathMatches) {
        for (const m of pathMatches) {
          files.push(m.replace(/`/g, ''));
        }
      }
    } catch {
      // 忽略讀取錯誤
    }
  }

  return [...new Set(files)];
}

// ============================================================
// M10: Protocol 自動升級 + 衰減
// ============================================================

/**
 * 掃描高觸發 fossils → 自動升級為 protocol 草稿；執行 protocol 衰減
 * @returns {{ promoted: number, decayed: number, errors: string[] }}
 */
function processProtocols() {
  if (!protocolEngine || !fossilEngine) {
    return { promoted: 0, decayed: 0, errors: ['engines not available'] };
  }

  const result = { promoted: 0, decayed: 0, errors: [] };

  try {
    // 1. 掃描高觸發 fossils → 自動升級為 protocol 草稿
    const fossils = fossilEngine.loadAllFossils();
    const existingProtocols = protocolEngine.loadAllProtocols();

    for (const fossil of fossils) {
      if ((fossil.trigger_count || 0) < 3) continue;

      // 檢查是否已有對應 protocol（避免重複升級）
      const alreadyPromoted = existingProtocols.some(p =>
        p.source?.ref === fossil.id
      );
      if (alreadyPromoted) continue;

      const candidate = fossilEngine.promoteToProtocol(fossil.id);
      if (candidate) {
        const saveResult = protocolEngine.saveProtocol(candidate);
        if (saveResult.success) {
          result.promoted++;
        } else {
          result.errors.push(`Protocol save failed for ${fossil.id}: ${saveResult.error}`);
        }
      }
    }

    // 2. 執行 protocol 衰減
    const decayResult = protocolEngine.runDecay();
    result.decayed = decayResult.archived.length;

  } catch (e) {
    result.errors.push(`Protocol processing error: ${e.message}`);
  }

  return result;
}

/**
 * 核心回顧邏輯
 */
async function processRetrospective(input) {
  const analysis = analyzeSession();

  // 直接存入 memory，不寫 log 檔案
  const lessonsResult = extractAndStoreLessonsLearned(analysis);

  // M7: Fossil 萃取 + 衰減
  const fossilResult = processFossils();

  // M10: Protocol 自動升級 + 衰減
  const protocolResult = processProtocols();

  // 組合輸出摘要
  const parts = [];
  if (lessonsResult.stored) {
    const skillNames = analysis.recent_skills.map(s => s.name).join(', ');
    parts.push(`${lessonsResult.count} lessons stored (skills: ${skillNames || 'none'})`);
  }
  if (fossilResult.extracted > 0) {
    parts.push(`${fossilResult.extracted} fossil(s) extracted`);
  }
  if (fossilResult.decayed > 0) {
    parts.push(`${fossilResult.decayed} fossil(s) archived (decay)`);
  }
  if (protocolResult.promoted > 0) {
    parts.push(`${protocolResult.promoted} protocol(s) promoted from fossils`);
  }
  if (protocolResult.decayed > 0) {
    parts.push(`${protocolResult.decayed} protocol(s) archived (decay)`);
  }

  if (parts.length > 0) {
    return {
      result: 'continue',
      additionalContext: `Retrospective: ${parts.join('; ')}`
    };
  }

  return { result: 'continue' };
}

const timedProcessRetrospective = withTiming(processRetrospective, 'retrospective-hook');

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const response = await timedProcessRetrospective(input);
    console.log(JSON.stringify(response));
  } catch (error) {
    console.log(JSON.stringify({ result: 'continue', error: error.message }));
  }
}

main();
