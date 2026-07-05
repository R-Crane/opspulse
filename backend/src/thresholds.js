// Central place for alert thresholds so they're easy to tune and easy to
// point to in an interview as "here's the rule engine."
export const THRESHOLDS = {
  cpu: { warning: 75, critical: 90 },
  memory: { warning: 80, critical: 92 },
  disk: { warning: 85, critical: 95 },
}

export function statusFor(metric) {
  if (!metric) return 'unknown'
  const levels = ['cpu', 'memory', 'disk'].map((key) => {
    const value = metric[key]
    if (value >= THRESHOLDS[key].critical) return 'critical'
    if (value >= THRESHOLDS[key].warning) return 'warning'
    return 'healthy'
  })
  if (levels.includes('critical')) return 'critical'
  if (levels.includes('warning')) return 'warning'
  return 'healthy'
}
