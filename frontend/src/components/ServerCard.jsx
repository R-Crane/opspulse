import { Link } from 'react-router-dom'
import { StatusBadge } from './Badges'
import VendorIcon from './VendorIcon'

function timeAgo(timestamp) {
  if (!timestamp) return 'never'
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export default function ServerCard({ server }) {
  const m = server.latestMetric

  return (
    <Link
      to={`/servers/${server.id}`}
      className="block border border-border bg-panel/60 hover:border-slate-600 rounded-lg p-5 transition"
    >
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <VendorIcon vendor={server.vendor} />
          <div className="min-w-0">
            <p className="font-display font-semibold truncate">{server.name}</p>
            <p className="text-xs text-slate-500 capitalize truncate">{server.role}</p>
          </div>
        </div>
        <StatusBadge status={server.status} />
      </div>

      {m ? (
        <div className="space-y-2">
          <p className="text-sm text-slate-300 line-clamp-2">{m.message}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-mono">
              {m.responseTimeMs != null ? `${m.responseTimeMs}ms` : '—'}
            </span>
            <span>Checked {timeAgo(m.timestamp)}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">No data yet</p>
      )}
    </Link>
  )
}
