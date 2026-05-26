/**
 * impact-map.js - Module Impact Analysis Data
 *
 * O(1) lookup for module impact during code-guard checks.
 * Data derived from Keeply codebase architecture analysis.
 * Only includes modules with refs >= 10 to filter low-impact noise.
 *
 * Regenerate source: npx tsx scripts/generate-codebase-map.ts
 * Then manually sync MODULE_IMPACT_MAP from SKILL.md Section C.
 *
 * @version 1.0.0
 * @since 2026-02-10
 */

/**
 * @typedef {Object} ModuleImpact
 * @property {number} refs - Number of files that import this module
 * @property {string} type - Module classification (Hub/Core/Consumer/Leaf/Infra/Helper)
 * @property {string[]} libConsumers - lib modules that depend on this
 * @property {string[]} componentConsumers - component directories that use this
 * @property {string} verify - Required verification after changes
 */

/** @type {Record<string, ModuleImpact>} */
const MODULE_IMPACT_MAP = {
  'types': {
    refs: 50,
    type: 'Hub',
    libConsumers: ['tauri-commands', 'utils'],
    componentConsumers: ['workspace', 'history', 'sync', 'ui'],
    verify: 'type-check + cargo check + 全量測試'
  },
  'utils': {
    refs: 30,
    type: 'Hub',
    libConsumers: ['tauri-commands'],
    componentConsumers: ['workspace', 'history', 'sync', 'ui'],
    verify: 'type-check + 全量測試'
  },
  'tauri-commands': {
    refs: 25,
    type: 'Core',
    libConsumers: [],
    componentConsumers: ['workspace', 'history', 'sync'],
    verify: 'type-check + cargo test'
  },
  'git': {
    refs: 20,
    type: 'Core',
    libConsumers: ['worktree', 'sync'],
    componentConsumers: ['workspace', 'history'],
    verify: 'cargo test + type-check'
  },
  'worktree': {
    refs: 15,
    type: 'Core',
    libConsumers: ['sync'],
    componentConsumers: ['workspace'],
    verify: 'cargo test + type-check'
  },
  'sync': {
    refs: 12,
    type: 'Core',
    libConsumers: [],
    componentConsumers: ['sync', 'workspace'],
    verify: 'cargo test + type-check'
  },
  'stores': {
    refs: 20,
    type: 'Hub',
    libConsumers: [],
    componentConsumers: ['workspace', 'history', 'sync', 'ui'],
    verify: 'type-check + npm test'
  },
  'hooks': {
    refs: 15,
    type: 'Helper',
    libConsumers: [],
    componentConsumers: ['workspace', 'history', 'sync'],
    verify: 'type-check'
  }
};

/**
 * Extract module name from file path.
 * Handles both Windows (backslash) and Unix (forward slash) paths.
 *
 * @param {string} filePath - Absolute or relative file path
 * @returns {string | null} Module name (e.g., "git") or null
 */
function extractModuleName(filePath) {
  const normalized = filePath.replace(/\\/g, '/');

  // React: src/lib/<module>/
  const libMatch = normalized.match(/\/src\/lib\/([^/]+)/);
  if (libMatch) return libMatch[1];

  // React: src/types/
  if (/\/src\/types(\/|$)/.test(normalized)) return 'types';

  // React: src/stores/
  if (/\/src\/stores(\/|$)/.test(normalized)) return 'stores';

  // React: src/hooks/
  if (/\/src\/hooks(\/|$)/.test(normalized)) return 'hooks';

  // React: src/components/<module>/
  const compMatch = normalized.match(/\/src\/components\/([^/]+)/);
  if (compMatch) return compMatch[1];

  // Rust: src-tauri/src/git/
  if (/\/src-tauri\/src\/git(\/|$)/.test(normalized)) return 'git';

  // Rust: src-tauri/src/nas/
  if (/\/src-tauri\/src\/nas(\/|$)/.test(normalized)) return 'sync';

  // Rust: src-tauri/src/commands/
  if (/\/src-tauri\/src\/commands(\/|$)/.test(normalized)) return 'tauri-commands';

  // Rust: src-tauri/src/state/
  if (/\/src-tauri\/src\/state(\/|$)/.test(normalized)) return 'stores';

  return null;
}

/**
 * Get impact information for a module.
 * @param {string} moduleName - Module name (e.g., "git")
 * @returns {ModuleImpact | null}
 */
function getModuleImpact(moduleName) {
  return MODULE_IMPACT_MAP[moduleName] || null;
}

/**
 * Format impact message for code-guard hook display.
 *
 * @param {string} moduleName
 * @param {ModuleImpact} impact
 * @returns {string}
 */
function formatImpactMessage(moduleName, impact) {
  const prefix = moduleName === 'types' ? '@/types' : `@/lib/${moduleName}`;
  const lines = [
    `Impact Analysis (codebase-map):`,
    `Editing ${prefix} (${impact.refs} files depend on this, ${impact.type} module)`
  ];

  if (impact.libConsumers.length > 0) {
    const list = impact.libConsumers.slice(0, 6).join(', ');
    const more = impact.libConsumers.length > 6 ? ` +${impact.libConsumers.length - 6}` : '';
    lines.push(`  lib consumers: ${list}${more}`);
  }

  if (impact.componentConsumers.length > 0) {
    const list = impact.componentConsumers.slice(0, 6).join(', ');
    const more = impact.componentConsumers.length > 6 ? ` +${impact.componentConsumers.length - 6}` : '';
    lines.push(`  component consumers: ${list}${more}`);
  }

  lines.push(`  verify: ${impact.verify}`);

  return lines.join('\n');
}

module.exports = {
  MODULE_IMPACT_MAP,
  extractModuleName,
  getModuleImpact,
  formatImpactMessage
};
