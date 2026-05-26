/**
 * git-state.js - Cached cross-platform git state reader
 *
 * Shared utility for hooks that need git status/diff/log info.
 * Each git command has independent try/catch + timeout for graceful degradation.
 * Results are cached for 5 seconds to avoid redundant calls within a hook chain.
 *
 * @version 1.0.0
 * @since 2026-02-11
 */

const { execSync } = require('child_process');
const path = require('path');
const { extractModuleName } = require('./impact-map');

// In-memory cache (same process, same chain execution)
let _cache = { timestamp: 0, data: null };
const CACHE_TTL = 5000; // 5 seconds

/**
 * Get comprehensive git state in a single cached call.
 * @returns {{
 *   branch: string,
 *   modified: string[],
 *   staged: string[],
 *   untracked: string[],
 *   recentCommits: string[],
 * }}
 */
function getGitState() {
  if (Date.now() - _cache.timestamp < CACHE_TTL && _cache.data) {
    return _cache.data;
  }

  const state = {
    branch: 'unknown',
    modified: [],
    staged: [],
    untracked: [],
    recentCommits: [],
  };

  // git status --porcelain (single call, ~30-50ms)
  try {
    const status = execSync('git status --porcelain', {
      encoding: 'utf-8', stdio: 'pipe', timeout: 500,
    }).trim();

    if (status) {
      for (const line of status.split('\n')) {
        if (!line) continue;
        const xy = line.substring(0, 2);
        const file = line.substring(3);
        // Skip .claude/ internal files for cleaner output
        if (file.startsWith('.claude/')) continue;

        if (xy === '??') {
          state.untracked.push(file);
        } else {
          if (xy[0] !== ' ' && xy[0] !== '?') state.staged.push(file);
          if (xy[1] === 'M' || xy[1] === 'D') state.modified.push(file);
        }
      }
    }
  } catch { /* timeout or not a git repo - continue with empty */ }

  // git branch (~10-50ms on Windows)
  try {
    state.branch = execSync('git branch --show-current', {
      encoding: 'utf-8', stdio: 'pipe', timeout: 200,
    }).trim();
  } catch { /* ignore */ }

  // git log last 3 commits (~10-50ms on Windows)
  try {
    state.recentCommits = execSync('git log --oneline -3', {
      encoding: 'utf-8', stdio: 'pipe', timeout: 200,
    }).trim().split('\n').filter(Boolean);
  } catch { /* ignore */ }

  _cache = { timestamp: Date.now(), data: state };
  return state;
}

/**
 * Group file paths by module area.
 * @param {string[]} files - List of file paths
 * @returns {Record<string, string[]>} module key -> files mapping
 */
function categorizeByModule(files) {
  const groups = {};

  for (const file of files) {
    const normalized = file.replace(/\\/g, '/');

    const libMatch = normalized.match(/src\/lib\/([^/]+)/);
    const compMatch = normalized.match(/src\/components\/([^/]+)/);
    const typeMatch = /src\/types(\/|$)/.test(normalized);

    let key;
    if (libMatch) key = `lib/${libMatch[1]}`;
    else if (compMatch) key = `components/${compMatch[1]}`;
    else if (typeMatch) key = 'types';
    else if (normalized.startsWith('commands/')) key = 'commands';
    else continue; // Skip non-src files for brevity

    if (!groups[key]) groups[key] = [];
    groups[key].push(file);
  }

  return groups;
}

module.exports = { getGitState, categorizeByModule };
