#!/usr/bin/env node
/**
 * Memory Engine - 三層記憶管理引擎
 *
 * @version 1.0.0 - V57.2 新增
 * @since 2026-01-14
 * @see https://arxiv.org/abs/2512.11303 (SMITH Memory Architecture)
 * @see https://arxiv.org/abs/2502.12110 (A-MEM Agentic Memory)
 *
 * 三層記憶架構：
 * - Episodic: 具體執行軌跡、任務上下文、錯誤記錄（30天）
 * - Semantic: 學到的知識、Skill 語意、跨 Session 經驗（90天）
 * - Procedural: 工具使用方式、工作流程模式、Best Practice（180天）
 */

const fs = require('fs');
const path = require('path');

// 記憶存儲目錄
const MEMORY_DIR = path.join(__dirname, '..', '..', 'memory');
const LAYERS = ['episodic', 'semantic', 'procedural'];

// 確保目錄存在
for (const layer of LAYERS) {
  const layerDir = path.join(MEMORY_DIR, layer);
  if (!fs.existsSync(layerDir)) {
    fs.mkdirSync(layerDir, { recursive: true });
  }
}

// 記憶層配置
const LAYER_CONFIG = {
  episodic: {
    description: '具體執行軌跡、任務上下文、錯誤記錄',
    retentionDays: 30,
    maxEntries: 1000
  },
  semantic: {
    description: '學到的知識、Skill 語意、跨 Session 經驗',
    retentionDays: 90,
    maxEntries: 500
  },
  procedural: {
    description: '工具使用方式、工作流程模式、Best Practice',
    retentionDays: 180,
    maxEntries: 200
  }
};

/**
 * 獲取記憶層檔案路徑
 * @param {string} layer - 記憶層名稱
 * @returns {string} 檔案路徑
 */
function getLayerFile(layer) {
  return path.join(MEMORY_DIR, layer, 'memories.json');
}

/**
 * 讀取記憶層
 * @param {string} layer - 記憶層名稱
 * @returns {object[]} 記憶列表
 */
function readLayer(layer) {
  const file = getLayerFile(layer);
  if (!fs.existsSync(file)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * 寫入記憶層
 * @param {string} layer - 記憶層名稱
 * @param {object[]} memories - 記憶列表
 */
function writeLayer(layer, memories) {
  const file = getLayerFile(layer);
  fs.writeFileSync(file, JSON.stringify(memories, null, 2));
}

/**
 * 存儲記憶
 * @param {string} layer - 記憶層（episodic/semantic/procedural）
 * @param {object} content - 記憶內容
 * @param {object} metadata - 元數據
 * @returns {object} 存儲的記憶
 */
function store(layer, content, metadata = {}) {
  if (!LAYERS.includes(layer)) {
    throw new Error(`Invalid layer: ${layer}. Must be one of: ${LAYERS.join(', ')}`);
  }

  const memory = {
    id: `mem-${layer.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    layer,
    content,
    metadata: {
      ...metadata,
      createdAt: new Date().toISOString(),
      accessCount: 0,
      lastAccessed: null
    }
  };

  const memories = readLayer(layer);
  memories.push(memory);

  // 限制條目數量
  const config = LAYER_CONFIG[layer];
  if (memories.length > config.maxEntries) {
    memories.splice(0, memories.length - config.maxEntries);
  }

  writeLayer(layer, memories);

  return memory;
}

/**
 * 檢索記憶
 * @param {string} layer - 記憶層
 * @param {object} query - 查詢條件
 * @returns {object[]} 匹配的記憶
 */
function retrieve(layer, query = {}) {
  const memories = readLayer(layer);

  let results = memories;

  // 按關鍵字過濾
  if (query.keywords) {
    const keywords = Array.isArray(query.keywords) ? query.keywords : [query.keywords];
    results = results.filter(m => {
      const content = JSON.stringify(m.content).toLowerCase();
      return keywords.some(kw => content.includes(kw.toLowerCase()));
    });
  }

  // 按時間範圍過濾
  if (query.since) {
    const since = new Date(query.since);
    results = results.filter(m => new Date(m.metadata.createdAt) >= since);
  }

  // 按元數據過濾
  if (query.metadata) {
    for (const [key, value] of Object.entries(query.metadata)) {
      results = results.filter(m => m.metadata[key] === value);
    }
  }

  // 限制數量
  if (query.limit) {
    results = results.slice(-query.limit);
  }

  // 更新訪問計數
  for (const result of results) {
    result.metadata.accessCount++;
    result.metadata.lastAccessed = new Date().toISOString();
  }

  if (results.length > 0) {
    writeLayer(layer, memories);
  }

  return results;
}

/**
 * 存儲 Episodic 記憶（執行軌跡）
 */
function storeEpisodic(content, metadata = {}) {
  return store('episodic', content, {
    type: 'execution_trace',
    ...metadata
  });
}

/**
 * 存儲 Semantic 記憶（知識）
 */
function storeSemantic(content, metadata = {}) {
  return store('semantic', content, {
    type: 'learned_knowledge',
    ...metadata
  });
}

/**
 * 存儲 Procedural 記憶（流程）
 */
function storeProcedural(content, metadata = {}) {
  return store('procedural', content, {
    type: 'workflow_pattern',
    ...metadata
  });
}

/**
 * 跨層檢索
 * @param {object} query - 查詢條件
 * @returns {object} 各層結果
 */
function retrieveAll(query = {}) {
  return {
    episodic: retrieve('episodic', query),
    semantic: retrieve('semantic', query),
    procedural: retrieve('procedural', query)
  };
}

/**
 * 獲取記憶統計
 * @returns {object} 統計數據
 */
function getStats() {
  const stats = {
    totalMemories: 0,
    byLayer: {}
  };

  for (const layer of LAYERS) {
    const memories = readLayer(layer);
    stats.byLayer[layer] = {
      count: memories.length,
      maxEntries: LAYER_CONFIG[layer].maxEntries,
      retentionDays: LAYER_CONFIG[layer].retentionDays
    };
    stats.totalMemories += memories.length;
  }

  return stats;
}

/**
 * 清理過期記憶
 * @returns {object} 清理結果
 */
function cleanup() {
  const result = { cleaned: {} };

  for (const layer of LAYERS) {
    const config = LAYER_CONFIG[layer];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - config.retentionDays);

    const memories = readLayer(layer);
    const before = memories.length;

    const filtered = memories.filter(m =>
      new Date(m.metadata.createdAt) >= cutoff
    );

    writeLayer(layer, filtered);
    result.cleaned[layer] = before - filtered.length;
  }

  return result;
}

/**
 * 遷移記憶（從 Episodic 到 Semantic）
 * 當某個模式重複出現時，將其提升為語意記憶
 * @param {string} memoryId - 記憶 ID
 * @param {string} fromLayer - 來源層
 * @param {string} toLayer - 目標層
 */
function migrate(memoryId, fromLayer, toLayer) {
  const fromMemories = readLayer(fromLayer);
  const index = fromMemories.findIndex(m => m.id === memoryId);

  if (index === -1) {
    return { success: false, error: 'Memory not found' };
  }

  const memory = fromMemories[index];

  // 在目標層創建新記憶
  const newMemory = store(toLayer, memory.content, {
    ...memory.metadata,
    migratedFrom: fromLayer,
    originalId: memory.id
  });

  // 從來源層移除
  fromMemories.splice(index, 1);
  writeLayer(fromLayer, fromMemories);

  return { success: true, newId: newMemory.id };
}

module.exports = {
  store,
  retrieve,
  retrieveAll,
  storeEpisodic,
  storeSemantic,
  storeProcedural,
  getStats,
  cleanup,
  migrate,
  LAYER_CONFIG,
  LAYERS
};