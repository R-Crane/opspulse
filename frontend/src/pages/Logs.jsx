import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { LevelTag } from '../components/Badges'
import { fetchLogs, fetchServers } from '../lib/api'

const LEVELS = ['all', 'info', 'warn', 'error']

export default function Logs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [logs, setLogs] = useState([])
  const [servers, setServers] = useState([])
  const [search, setSearch] = useState('')

  const serverFilter = searchParams.get('server') || ''
  const levelFilter = searchParams.get('level') || 'all'

  useEffect(() => {
    fetchServers().then(setServers)
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [serverFilter, levelFilter, search])

  async function load() {
    const data = await fetchLogs({
      server: serverFilter || undefined,
      level: levelFilter !== 'all' ? levelFilter : undefined,
      search: search || undefined,
      minutes: 120,
      limit: 200,
    })
    setLogs(data)
  }

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-2xl font-semibold mb-6">Logs</h1>

        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={serverFilter}
            onChange={(e) => updateParam('server', e.target.value)}
            className="bg-panel border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All servers</option>
            {servers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <div className="flex gap-1">
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => updateParam('level', l === 'all' ? '' : l)}
                className={`px-3 py-1.5 rounded-md text-sm capitalize border transition ${
                  levelFilter === l
                    ? 'bg-accent border-accent text-white'
                    : 'border-border text-slate-400 hover:border-slate-500'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search message…"
            className="bg-panel border border-border rounded-md px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
          {logs.length === 0 && (
            <p className="text-sm text-slate-500 px-4 py-6 text-center">No logs match these filters.</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="px-4 py-3 flex items-start gap-4 text-sm hover:bg-panel/60">
              <span className="text-xs text-slate-500 font-mono shrink-0 w-16 pt-0.5">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <LevelTag level={log.level} />
              <span className="text-xs text-slate-500 shrink-0">{log.server_name}</span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
