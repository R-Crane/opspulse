import { Link } from 'react-router-dom'
import { StatusBadge } from './Badges'

function MetricBar({ label, value }) {
  const color = value >= 90 ? 'bg-critical' : value >= 75 ? 'bg-warning' : 'bg-healthy'
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span className="font-mono">{value?.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

export default function ServerCard({ server }) {
  const m = server.latestMetric

  return (
    <Link
      to={`/servers/${server.id}`}
      className="block border border-border bg-panel/60 hover:border-slate-600 rounded-lg p-5 transition"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-display font-semibold">{server.name}</p>
          <p className="text-xs text-slate-500 capitalize">{server.role}</p>
        </div>
        <StatusBadge status={server.status} />
      </div>

      {m ? (
        <div className="space-y-3">
          <MetricBar label="CPU" value={m.cpu} />
          <MetricBar label="Memory" value={m.memory} />
          <MetricBar label="Disk" value={m.disk} />
        </div>
      ) : (
        <p className="text-sm text-slate-500">No data yet</p>
      )}
    </Link>
  )
}
