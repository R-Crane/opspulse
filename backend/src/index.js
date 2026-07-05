import express from 'express'
import cors from 'cors'
import { seedServers, tick } from './mockData.js'
import { pruneOldData } from './db.js'
import serversRouter from './routes/servers.js'
import logsRouter from './routes/logs.js'

const app = express()
const PORT = process.env.PORT || 4000
const TICK_INTERVAL_MS = 5000
const RETENTION_MS = 6 * 60 * 60 * 1000 // keep 6 hours of data for the demo

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))
app.use('/api/servers', serversRouter)
app.use('/api/logs', logsRouter)

seedServers()

// The mock data generator runs on a timer, standing in for a real metrics
// collection agent (e.g. node_exporter) that would poll actual hosts.
setInterval(tick, TICK_INTERVAL_MS)
setInterval(() => pruneOldData(RETENTION_MS), 5 * 60 * 1000)

// Run a few ticks immediately on boot so the dashboard isn't empty on first load.
for (let i = 0; i < 5; i++) tick()

app.listen(PORT, () => {
  console.log(`OpsPulse backend running on port ${PORT}`)
})
