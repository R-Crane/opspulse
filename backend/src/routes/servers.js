import { Router } from 'express'
import { store, latestMetric, metricsSince } from '../db.js'
import { statusFor } from '../thresholds.js'

const router = Router()

// GET /api/servers - all servers with their latest metric + computed status
router.get('/', (req, res) => {
  const result = Array.from(store.servers.values()).map((s) => {
    const metric = latestMetric(s.id)
    return {
      ...s,
      latestMetric: metric || null,
      status: statusFor(metric),
    }
  })

  res.json(result)
})

// GET /api/servers/:id/metrics?minutes=30 - time series for charting
router.get('/:id/metrics', (req, res) => {
  const minutes = Number(req.query.minutes) || 30
  const since = Date.now() - minutes * 60 * 1000

  res.json(metricsSince(req.params.id, since))
})

export default router
