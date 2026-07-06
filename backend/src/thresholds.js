// Status normalization. Real external status checks already return one of
// 'operational' | 'degraded' | 'outage' | 'unknown' directly (see
// externalStatus.js) — this just guards against a missing metric so routes
// never have to null-check on their own.
export function statusFor(metric) {
  if (!metric) return 'unknown'
  return metric.status || 'unknown'
}
