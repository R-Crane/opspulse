import { Router } from 'express'
import { store, queryLogs, logSummary } from '../db.js'

const router = Router()

// GET /api/logs?server=web-01&level=error&search=timeout&minutes=60&limit=200
router.get('/', (req, res) => {
  const { server, level, search } = req.query
  const minutes = Number(req.query.minutes) || 60
  const limit = Math.min(Number(req.query.limit) || 200, 500)
  const since = Date.now() - minutes * 60 * 1000

  const rows = queryLogs({ server, level, search, sinceTimestamp: since, limit })

  const withServerName = rows.map((r) => ({
    ...r,
    server_name: store.servers.get(r.server_id)?.name || r.server_id,
  }))

  res.json(withServerName)
})

// GET /api/logs/summary?minutes=60 - counts by level, for a quick error-rate readout
router.get('/summary', (req, res) => {
  const minutes = Number(req.query.minutes) || 60
  const since = Date.now() - minutes * 60 * 1000
  res.json(logSummary(since))
})

export default router
