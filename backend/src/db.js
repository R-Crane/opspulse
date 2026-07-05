// In-memory data store. A real deployment would swap this for Postgres —
// see the README roadmap. Kept in-memory here on purpose: it removes native
// build dependencies entirely (no node-gyp / compiled bindings to break on
// different machines), which matters more for a demo project than
// durability across restarts.

export const store = {
  servers: new Map(), // id -> { id, name, role }
  metrics: [], // { server_id, cpu, memory, disk, timestamp }
  logs: [], // { id, server_id, level, message, timestamp }
}

let nextLogId = 1

export function upsertServer(server) {
  if (!store.servers.has(server.id)) {
    store.servers.set(server.id, server)
  }
}

export function insertMetric(metric) {
  store.metrics.push(metric)
}

export function insertLog(log) {
  store.logs.push({ id: nextLogId++, ...log })
}

export function latestMetric(serverId) {
  for (let i = store.metrics.length - 1; i >= 0; i--) {
    if (store.metrics[i].server_id === serverId) return store.metrics[i]
  }
  return null
}

export function metricsSince(serverId, sinceTimestamp) {
  return store.metrics.filter((m) => m.server_id === serverId && m.timestamp >= sinceTimestamp)
}

export function queryLogs({ server, level, search, sinceTimestamp, limit }) {
  let results = store.logs.filter((l) => l.timestamp >= sinceTimestamp)
  if (server) results = results.filter((l) => l.server_id === server)
  if (level) results = results.filter((l) => l.level === level)
  if (search) {
    const needle = search.toLowerCase()
    results = results.filter((l) => l.message.toLowerCase().includes(needle))
  }
  results = results.slice().sort((a, b) => b.timestamp - a.timestamp)
  return results.slice(0, limit)
}

export function logSummary(sinceTimestamp) {
  const summary = { info: 0, warn: 0, error: 0 }
  for (const l of store.logs) {
    if (l.timestamp >= sinceTimestamp) summary[l.level] = (summary[l.level] || 0) + 1
  }
  return summary
}

// Keep the dataset bounded so memory usage stays flat during a long-running demo.
export function pruneOldData(retentionMs) {
  const cutoff = Date.now() - retentionMs
  store.metrics = store.metrics.filter((m) => m.timestamp >= cutoff)
  store.logs = store.logs.filter((l) => l.timestamp >= cutoff)
}
