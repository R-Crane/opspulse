import { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import ServerCard from '../components/ServerCard'
import { fetchServers, fetchLogSummary } from '../lib/api'

export default function Dashboard() {
  const [servers, setServers] = useState([])
  const [summary, setSummary] = useState({ info: 0, warn: 0, error: 0 })
  const [error, setError] = useState(null)

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000) // matches backend tick rate
    return () => clearInterval(interval)
  }, [])

  async function load() {
    try {
      const [s, l] = await Promise.all([fetchServers(), fetchLogSummary(60)])
      setServers(s)
      setSummary(l)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const counts = servers.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1
      return acc
    },
    { healthy: 0, warning: 0, critical: 0 }
  )

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl font-semibold mb-1">Fleet overview</h1>
        <p className="text-slate-500 text-sm mb-8">Live status across {servers.length} servers · updates every 5s</p>

        {error && (
          <p className="text-critical text-sm mb-6">
            {error} — is the backend running on the URL set in VITE_API_URL?
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          <div className="border border-border rounded-lg p-5 bg-panel/60">
            <p className="text-3xl font-display font-semibold text-healthy">{counts.healthy}</p>
            <p className="text-sm text-slate-400 mt-1">Healthy</p>
          </div>
          <div className="border border-border rounded-lg p-5 bg-panel/60">
            <p className="text-3xl font-display font-semibold text-warning">{counts.warning}</p>
            <p className="text-sm text-slate-400 mt-1">Warning</p>
          </div>
          <div className="border border-border rounded-lg p-5 bg-panel/60">
            <p className="text-3xl font-display font-semibold text-critical">{counts.critical}</p>
            <p className="text-sm text-slate-400 mt-1">Critical</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Servers</h2>
          <p className="text-xs text-slate-500">
            Last hour: <span className="text-slate-300">{summary.info} info</span> ·{' '}
            <span className="text-warning">{summary.warn} warn</span> ·{' '}
            <span className="text-critical">{summary.error} error</span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {servers.map((s) => (
            <ServerCard key={s.id} server={s} />
          ))}
        </div>
      </main>
    </div>
  )
}
