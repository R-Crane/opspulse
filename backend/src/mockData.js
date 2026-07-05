import { upsertServer, insertMetric, insertLog } from './db.js'

export const SERVERS = [
  { id: 'web-01', name: 'web-01', role: 'web' },
  { id: 'web-02', name: 'web-02', role: 'web' },
  { id: 'api-01', name: 'api-01', role: 'api' },
  { id: 'db-01', name: 'db-01', role: 'database' },
  { id: 'worker-01', name: 'worker-01', role: 'background-worker' },
]

// In-memory running state per server so metrics drift smoothly instead of
// jumping randomly every tick — closer to how real utilization behaves.
const state = new Map(
  SERVERS.map((s) => [
    s.id,
    {
      cpu: 20 + Math.random() * 20,
      memory: 30 + Math.random() * 20,
      disk: 40 + Math.random() * 15,
      incidentTicksRemaining: 0,
    },
  ])
)

const LOG_TEMPLATES = {
  info: [
    'Health check passed',
    'Request completed in {ms}ms',
    'Scheduled job finished successfully',
    'Cache refreshed',
    'Connection pool size: {n}',
  ],
  warn: [
    'Response time elevated: {ms}ms',
    'Connection pool nearing capacity ({n}/50)',
    'Retrying failed request (attempt {n})',
    'Disk usage above 80%',
  ],
  error: [
    'Database connection timeout',
    'Unhandled exception in request handler',
    'Failed to write to disk: ENOSPC',
    'Upstream service returned 503',
    'Out of memory: killing process',
  ],
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fillTemplate(tpl) {
  return tpl
    .replace('{ms}', Math.floor(50 + Math.random() * 900))
    .replace('{n}', Math.floor(1 + Math.random() * 50))
}

function recordMetric(serverId, cpu, memory, disk) {
  insertMetric({ server_id: serverId, cpu, memory, disk, timestamp: Date.now() })
}

function recordLog(serverId, level, message) {
  insertLog({ server_id: serverId, level, message, timestamp: Date.now() })
}

export function seedServers() {
  for (const s of SERVERS) upsertServer(s)
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

// One tick = one simulated round of metrics + occasional log lines per server.
// Randomly triggers short "incidents" (a burst of elevated load + error logs)
// so the dashboard has something interesting to show, not just flat lines.
export function tick() {
  for (const server of SERVERS) {
    const s = state.get(server.id)

    if (s.incidentTicksRemaining === 0 && Math.random() < 0.015) {
      s.incidentTicksRemaining = 4 + Math.floor(Math.random() * 6)
    }

    const inIncident = s.incidentTicksRemaining > 0
    if (inIncident) s.incidentTicksRemaining -= 1

    const drift = () => (Math.random() - 0.5) * 6
    const pressure = inIncident ? 25 + Math.random() * 15 : 0

    s.cpu = clamp(s.cpu + drift() + (inIncident ? pressure * 0.4 : 0), 5, 99)
    s.memory = clamp(s.memory + drift() * 0.6 + (inIncident ? pressure * 0.3 : 0), 10, 98)
    s.disk = clamp(s.disk + Math.random() * 0.3, 10, 99) // disk only creeps up

    recordMetric(server.id, s.cpu, s.memory, s.disk)

    // Log volume: baseline chatter, more (and worse) during incidents.
    const logCount = inIncident ? 2 + Math.floor(Math.random() * 3) : Math.random() < 0.4 ? 1 : 0
    for (let i = 0; i < logCount; i++) {
      let level = 'info'
      const roll = Math.random()
      if (inIncident) {
        level = roll < 0.5 ? 'error' : roll < 0.85 ? 'warn' : 'info'
      } else {
        level = roll < 0.03 ? 'error' : roll < 0.12 ? 'warn' : 'info'
      }
      recordLog(server.id, level, fillTemplate(pick(LOG_TEMPLATES[level])))
    }
  }
}
