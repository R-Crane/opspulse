const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path) {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`)
  return res.json()
}

export function fetchServers() {
  return request('/api/servers')
}

export function fetchServerMetrics(id, minutes = 30) {
  return request(`/api/servers/${id}/metrics?minutes=${minutes}`)
}

export function fetchLogs({ server, level, search, minutes = 60, limit = 200 } = {}) {
  const params = new URLSearchParams()
  if (server) params.set('server', server)
  if (level) params.set('level', level)
  if (search) params.set('search', search)
  params.set('minutes', minutes)
  params.set('limit', limit)
  return request(`/api/logs?${params.toString()}`)
}

export function fetchLogSummary(minutes = 60) {
  return request(`/api/logs/summary?minutes=${minutes}`)
}
