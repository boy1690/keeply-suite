/**
 * Audit Logger Hook
 *
 * V1.0.0: 記錄所有 tool use 到審計日誌
 *
 * 目的：
 * - 追蹤所有工具的使用情況
 * - 記錄成功/失敗狀態
 * - 便於事後分析和除錯
 *
 * Hook 事件：
 * - PreToolUse: 工具使用前
 * - PostToolUse: 工具使用後
 */

const fs = require('fs');
const path = require('path');

// ========== Configuration ==========

const AUDIT_LOG_PATH = path.join(__dirname, '../logs/audit.log');
const MAX_LOG_LINES = 5000;
const TRIM_TO_LINES = 2000;

// ========== Hook Definition ==========

module.exports = {
  name: 'audit-logger',
  version: '1.0.0',
  description: '記錄所有 tool use 到審計日誌',
  events: ['PreToolUse', 'PostToolUse'],

  /**
   * Hook handler
   * @param {Object} input - Hook input
   * @param {string} toolUseId - Tool use ID
   * @param {Object} context - Hook context
   * @returns {Object} Hook result
   */
  async handle(input, toolUseId, context) {
    const timestamp = new Date().toISOString();
    const hookEvent = process.env.CLAUDE_HOOK_EVENT || input.hook_event_name || 'PreToolUse';

    try {
      if (hookEvent === 'PreToolUse') {
        // 記錄工具使用前
        const toolName = input.tool_name;
        const toolInput = input.tool_input || {};

        // 構建日誌訊息
        const logEntry = formatPreToolUseLog(timestamp, toolUseId, toolName, toolInput);
        appendLog(logEntry);

        // Debug mode: 輸出到 stderr（不影響 stdout）
        if (process.env.DEBUG_AUDIT === 'true') {
          console.error(`[AUDIT] ${logEntry}`);
        }
      }

      if (hookEvent === 'PostToolUse') {
        // 記錄工具使用後
        const toolName = input.tool_name;
        const toolResult = input.tool_result || '';
        const success = !toolResult.includes('error') && !toolResult.includes('Error');
        const error = success ? null : toolResult.substring(0, 100);

        const logEntry = formatPostToolUseLog(timestamp, toolUseId, toolName, success, error);
        appendLog(logEntry);

        if (process.env.DEBUG_AUDIT === 'true') {
          console.error(`[AUDIT] ${logEntry}`);
        }
      }

      // 檢查日誌大小並輪替
      rotateLogsIfNeeded();

      return { result: 'continue' }; // 允許操作繼續
    } catch (error) {
      // Hook 錯誤不應中斷主流程
      console.error('[AUDIT] Failed to write audit log:', error.message);
      return { result: 'continue' };
    }
  }
};

// ========== Helper Functions ==========

/**
 * 格式化 PreToolUse 日誌
 */
function formatPreToolUseLog(timestamp, toolUseId, toolName, toolInput) {
  const summary = getToolInputSummary(toolName, toolInput);
  return `[${timestamp}] PRE  ${toolUseId} ${toolName} ${summary}`;
}

/**
 * 格式化 PostToolUse 日誌
 */
function formatPostToolUseLog(timestamp, toolUseId, toolName, success, error) {
  const status = success ? 'SUCCESS' : 'FAILED';
  const errorMsg = error ? ` (${error})` : '';
  return `[${timestamp}] POST ${toolUseId} ${toolName} ${status}${errorMsg}`;
}

/**
 * 取得工具輸入摘要（避免過長）
 */
function getToolInputSummary(toolName, toolInput) {
  switch (toolName) {
    case 'Read':
      return `file=${toolInput.file_path || 'N/A'}`;

    case 'Write':
      return `file=${toolInput.file_path || 'N/A'} size=${(toolInput.content || '').length}`;

    case 'Edit':
      return `file=${toolInput.file_path || 'N/A'}`;

    case 'Bash':
      // 只顯示命令的前 50 字元
      const cmd = (toolInput.command || '').substring(0, 50);
      return `cmd="${cmd}${cmd.length === 50 ? '...' : ''}"`;

    case 'Glob':
      return `pattern="${toolInput.pattern || 'N/A'}"`;

    case 'Grep':
      return `pattern="${toolInput.pattern || 'N/A'}" in="${toolInput.path || '.'}"`;

    case 'Task':
      return `subagent=${toolInput.subagent_type || 'N/A'}`;

    default:
      // MCP tools
      if (toolName.startsWith('mcp__')) {
        const simpleName = toolName.replace('mcp__', '').replace(/__/g, '.');
        return `[MCP] ${simpleName}`;
      }
      return '';
  }
}

/**
 * 寫入日誌檔案
 */
function appendLog(message) {
  try {
    const dir = path.dirname(AUDIT_LOG_PATH);

    // 確保目錄存在
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 寫入日誌
    fs.appendFileSync(AUDIT_LOG_PATH, message + '\n', 'utf8');
  } catch (error) {
    console.error('[AUDIT] Failed to append log:', error.message);
  }
}

/**
 * 日誌自動截斷（line-count based，比 size-based 更可預測）
 */
function rotateLogsIfNeeded() {
  try {
    if (!fs.existsSync(AUDIT_LOG_PATH)) return;

    const content = fs.readFileSync(AUDIT_LOG_PATH, 'utf8');
    const lines = content.split('\n');

    if (lines.length > MAX_LOG_LINES) {
      const trimmed = lines.slice(-TRIM_TO_LINES).join('\n');
      fs.writeFileSync(AUDIT_LOG_PATH, trimmed, 'utf8');
    }
  } catch (error) {
    console.error('[AUDIT] Failed to rotate logs:', error.message);
  }
}

// ========== CLI Entry Point ==========

/**
 * 主函式 - Hook 入口（stdin 模式）
 */
async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    const input = JSON.parse(Buffer.concat(chunks).toString());
    const toolUseId = input.tool_use_id || `tool-${Date.now()}`;

    // 呼叫 handle 方法
    const result = await module.exports.handle(input, toolUseId, {});
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(JSON.stringify({ result: 'continue' }));
  }
}

// CLI 執行
if (require.main === module) {
  main();
}

// ========== Exports ==========

// 提供查詢函數（供外部使用）
module.exports.queryLogs = function(options = {}) {
  const {
    toolName,
    startTime,
    endTime,
    maxLines = 1000
  } = options;

  try {
    if (!fs.existsSync(AUDIT_LOG_PATH)) {
      return [];
    }

    const content = fs.readFileSync(AUDIT_LOG_PATH, 'utf8');
    const lines = content.split('\n').filter(Boolean);

    let filtered = lines;

    // 篩選工具名稱
    if (toolName) {
      filtered = filtered.filter(line => line.includes(toolName));
    }

    // 篩選時間範圍
    if (startTime || endTime) {
      filtered = filtered.filter(line => {
        const match = line.match(/\[(.+?)\]/);
        if (!match) return false;

        const timestamp = new Date(match[1]);
        if (startTime && timestamp < new Date(startTime)) return false;
        if (endTime && timestamp > new Date(endTime)) return false;

        return true;
      });
    }

    // 限制行數
    if (filtered.length > maxLines) {
      filtered = filtered.slice(-maxLines);
    }

    return filtered;
  } catch (error) {
    console.error('[AUDIT] Failed to query logs:', error.message);
    return [];
  }
};
