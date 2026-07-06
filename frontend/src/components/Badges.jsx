const STATUS_STYLES = {
  operational: 'bg-healthy/15 text-healthy border-healthy/30',
  degraded: 'bg-warning/15 text-warning border-warning/30',
  outage: 'bg-critical/15 text-critical border-critical/30',
  unknown: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

const STATUS_DOT = {
  operational: 'bg-healthy',
  degraded: 'bg-warning',
  outage: 'bg-critical',
  unknown: 'bg-slate-500',
}

const STATUS_LABEL = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
  unknown: 'Unknown',
}

export function StatusBadge({ status }) {
  const key = STATUS_STYLES[status] ? status : 'unknown'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[key]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[key]}`} />
      {STATUS_LABEL[key]}
    </span>
  )
}

const LEVEL_STYLES = {
  info: 'text-slate-400',
  warn: 'text-warning',
  error: 'text-critical',
}

export function LevelTag({ level }) {
  return (
    <span className={`font-mono text-xs uppercase font-semibold ${LEVEL_STYLES[level]}`}>
      {level}
    </span>
  )
}
