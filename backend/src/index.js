import express from 'express'
import cors from 'cors'
import { SERVICES } from './externalStatus.js'
import { upsertServer, insertMetric, insertLog, pruneOldData } from './db.js'
import serversRouter from './routes/servers.js'
import logsRouter from './routes/logs.js'

const app = express()
const PORT = process.env.PORT || 4000
// These are real third-party status endpoints, not something we own — poll
// gently instead of hammering them like the old 5s fake-metrics tick did.
const POLL_INTERVAL_MS = 60 * 1000
const RETENTION_MS = 6 * 60 * 60 * 1000 // keep 6 hours of history for the demo

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))
app.use('/api/servers', serversRouter)
app.use('/api/logs', logsRouter)

for (const s of SERVICES) {
  upsertServer({
    id: s.id,
    name: s.name,
    vendor: s.vendor,
    role: s.role,
    statusPageUrl: s.statusPageUrl,
  })
}

// Tracks each service's last known status so we only write a log line when
// something actually changes, instead of logging "still fine" every minute.
const lastStatus = new Map()

function levelFor(status) {
  if (status === 'outage') return 'error'
  if (status === 'degraded' || status === 'unknown') return 'warn'
  return 'info'
}

async function pollOne(service) {
  try {
    const result = await service.check()
    insertMetric({
      server_id: service.id,
      status: result.status,
      responseTimeMs: result.responseTimeMs,
      message: result.message,
      timestamp: Date.now(),
    })

    if (lastStatus.get(service.id) !== result.status) {
      insertLog({
        server_id: service.id,
        level: levelFor(result.status),
        message: result.message,
        timestamp: Date.now(),
      })
      lastStatus.set(service.id, result.status)
    }
  } catch (err) {
    insertMetric({
      server_id: service.id,
      status: 'unknown',
      responseTimeMs: null,
      message: `Status check failed: ${err.message}`,
      timestamp: Date.now(),
    })

    if (lastStatus.get(service.id) !== 'unknown') {
      insertLog({
        server_id: service.id,
        level: 'warn',
        message: `Status check failed: ${err.message}`,
        timestamp: Date.now(),
      })
      lastStatus.set(service.id, 'unknown')
    }
  }
}

async function pollAll() {
  await Promise.all(SERVICES.map(pollOne))
}

setInterval(pollAll, POLL_INTERVAL_MS)
setInterval(() => pruneOldData(RETENTION_MS), 5 * 60 * 1000)

// Run once immediately on boot so the dashboard isn't empty on first load.
pollAll()

app.listen(PORT, () => {
  console.log(`OpsPulse backend running on port ${PORT}`)
})
