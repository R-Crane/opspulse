import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import MetricChart from '../components/MetricChart'
import { StatusBadge } from '../components/Badges'
import VendorIcon from '../components/VendorIcon'
import { fetchServers, fetchServerMetrics } from '../lib/api'

export default function ServerDetail() {
  const { id } = useParams()
  const [server, setServer] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [id])

  async function load() {
    const [servers, metrics] = await Promise.all([fetchServers(), fetchServerMetrics(id, 180)])
    setServer(servers.find((s) => s.id === id) || null)
    setHistory(metrics)
  }

  if (!server) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <p className="text-slate-400 text-sm max-w-4xl mx-auto px-6 py-10">Loading…</p>
      </div>
    )
  }

  const m = server.latestMetric

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/" className="text-sm text-slate-400 hover:text-white transition">
          ← Back to dashboard
        </Link>

        <div className="flex items-center justify-between mt-4 mb-2 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <VendorIcon vendor={server.vendor} />
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold truncate">{server.name}</h1>
              <p className="text-sm text-slate-500 capitalize truncate">{server.role}</p>
            </div>
          </div>
          <StatusBadge status={server.status} />
        </div>

        {m && (
          <div className="mb-8">
            <p className="text-slate-300 text-sm">{m.message}</p>
            <p className="text-xs text-slate-500 mt-1">
              Last checked {new Date(m.timestamp).toLocaleTimeString()} ·{' '}
              {m.responseTimeMs != null ? `${m.responseTimeMs}ms response time` : 'no response time recorded'}
            </p>
          </div>
        )}

        <div className="grid gap-4">
          <MetricChart data={history} metricKey="responseTimeMs" label="Response time (ms)" />
        </div>

        <div className="flex flex-wrap gap-4 mt-6">
          <a
            href={server.statusPageUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-accent hover:underline"
          >
            Official status page →
          </a>
          <Link
            to={`/logs?server=${server.id}`}
            className="text-sm text-accent hover:underline"
          >
            View status history for this service →
          </Link>
        </div>
      </main>
    </div>
  )
}
