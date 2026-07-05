import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import MetricChart from '../components/MetricChart'
import { StatusBadge } from '../components/Badges'
import { fetchServers, fetchServerMetrics } from '../lib/api'

export default function ServerDetail() {
  const { id } = useParams()
  const [server, setServer] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [id])

  async function load() {
    const [servers, metrics] = await Promise.all([fetchServers(), fetchServerMetrics(id, 30)])
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

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link to="/" className="text-sm text-slate-400 hover:text-white transition">
          ← Back to dashboard
        </Link>

        <div className="flex items-center justify-between mt-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold">{server.name}</h1>
            <p className="text-sm text-slate-500 capitalize">{server.role}</p>
          </div>
          <StatusBadge status={server.status} />
        </div>

        <div className="grid gap-4">
          <MetricChart data={history} metricKey="cpu" label="CPU usage (%)" />
          <MetricChart data={history} metricKey="memory" label="Memory usage (%)" />
          <MetricChart data={history} metricKey="disk" label="Disk usage (%)" />
        </div>

        <Link
          to={`/logs?server=${server.id}`}
          className="inline-block mt-6 text-sm text-accent hover:underline"
        >
          View logs for this server →
        </Link>
      </main>
    </div>
  )
}
