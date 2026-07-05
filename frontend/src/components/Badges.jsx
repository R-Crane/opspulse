const STATUS_STYLES = {
  healthy: 'bg-healthy/15 text-healthy border-healthy/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  critical: 'bg-critical/15 text-critical border-critical/30',
  unknown: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

const STATUS_DOT = {
  healthy: 'bg-healthy',
  warning: 'bg-warning',
  critical: 'bg-critical',
  unknown: 'bg-slate-500',
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
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
