// Real external status checks. Each service in SERVICES is polled on a timer
// (see index.js) against the provider's own public status source — no
// simulated data here anymore.
//
// Coverage varies by provider on purpose:
//  - GitHub and Apple publish real machine-readable status feeds, so those
//    two report full incident status.
//  - AWS's official Health API requires a paid Business/Enterprise support
//    plan and SigV4-signed requests, so there's no free authenticated option.
//    We use the public "all services" RSS feed instead, which is open and
//    unauthenticated but only tells us whether *any* incident is currently
//    posted, not per-service detail.
//  - Sony and Nintendo don't publish a documented public status API at all
//    (status.playstation.com is a JS single-page app with no open endpoint,
//    and Nintendo's network status page is plain HTML meant for humans).
//    For those two we do a lightweight HTTPS reachability check against
//    their real status page instead of pretending to have incident data we
//    don't actually have.

const FETCH_TIMEOUT_MS = 8000

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

async function checkGithub() {
  const start = Date.now()
  const res = await fetchWithTimeout('https://www.githubstatus.com/api/v2/status.json')
  const responseTimeMs = Date.now() - start
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const indicator = data.status?.indicator || 'none'
  const statusMap = { none: 'operational', minor: 'degraded', major: 'outage', critical: 'outage' }
  return {
    status: statusMap[indicator] || 'unknown',
    message: data.status?.description || 'Status unavailable',
    responseTimeMs,
  }
}

async function checkAppleICloud() {
  const start = Date.now()
  const res = await fetchWithTimeout(
    'https://www.apple.com/support/systemstatus/data/system_status_en_US.js'
  )
  const responseTimeMs = Date.now() - start
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const text = await res.text()

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    // Some Apple status endpoints wrap the JSON in a JSONP callback like
    // callbackName({...}) — unwrap it if a direct parse fails.
    const open = text.indexOf('(')
    const close = text.lastIndexOf(')')
    parsed = JSON.parse(text.slice(open + 1, close))
  }

  const services = parsed.services || []
  const upStates = ['resolved', 'completed']
  const relevant = services.filter((s) => /icloud/i.test(s.serviceName || ''))

  const down = relevant.filter((s) => {
    const events = s.events || []
    if (events.length === 0) return false
    return !upStates.includes((events[0]?.eventStatus || '').toLowerCase())
  })

  let status = 'operational'
  if (down.length > 0) {
    status = down.length >= Math.max(1, Math.ceil(relevant.length / 2)) ? 'outage' : 'degraded'
  }

  const message =
    down.length === 0
      ? 'All iCloud services operational'
      : `${down.length} iCloud service(s) reporting issues: ${down
          .map((s) => s.serviceName)
          .join(', ')}`

  return { status, message, responseTimeMs }
}

async function checkAws() {
  const start = Date.now()
  const res = await fetchWithTimeout('https://status.aws.amazon.com/rss/all.rss')
  const responseTimeMs = Date.now() - start
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const xml = await res.text()

  const itemCount = (xml.match(/<item>/g) || []).length
  const titles = [...xml.matchAll(/<title>(.*?)<\/title>/g)].map((m) => m[1])
  // The feed's own title is the first <title> tag — drop it, keep a few incidents.
  const incidentTitles = titles.slice(1, 4)

  const status = itemCount === 0 ? 'operational' : itemCount > 5 ? 'outage' : 'degraded'
  const message =
    itemCount === 0
      ? 'All AWS services operational'
      : `${itemCount} active AWS notice(s): ${incidentTitles.join('; ')}`

  return { status, message, responseTimeMs }
}

// Sony and Nintendo don't expose a public incident API, so this checks that
// their real status page actually responds — a genuine network check, just
// a shallower signal than the statuspage-backed services above.
function makeReachabilityCheck(url, label) {
  return async function checkReachability() {
    const start = Date.now()
    const res = await fetchWithTimeout(url, { redirect: 'follow' })
    const responseTimeMs = Date.now() - start
    if (!res.ok) {
      return {
        status: 'degraded',
        message: `${label} returned HTTP ${res.status} — see the official status page for details`,
        responseTimeMs,
      }
    }
    return {
      status: 'operational',
      message: `${label} is reachable. No public incident API is published, so this reflects reachability rather than full incident status.`,
      responseTimeMs,
    }
  }
}

export const SERVICES = [
  {
    id: 'github',
    name: 'GitHub',
    vendor: 'GitHub',
    role: 'code hosting',
    statusPageUrl: 'https://www.githubstatus.com',
    check: checkGithub,
  },
  {
    id: 'icloud',
    name: 'Apple iCloud',
    vendor: 'Apple',
    role: 'cloud services',
    statusPageUrl: 'https://www.apple.com/support/systemstatus/',
    check: checkAppleICloud,
  },
  {
    id: 'aws',
    name: 'AWS',
    vendor: 'Amazon Web Services',
    role: 'cloud infrastructure',
    statusPageUrl: 'https://health.aws.amazon.com/health/status',
    check: checkAws,
  },
  {
    id: 'psn',
    name: 'PlayStation Network',
    vendor: 'Sony',
    role: 'gaming network',
    statusPageUrl: 'https://status.playstation.com/en-us/',
    check: makeReachabilityCheck('https://status.playstation.com/en-us/', 'PlayStation Network'),
  },
  {
    id: 'nintendo',
    name: 'Nintendo Switch Online',
    vendor: 'Nintendo',
    role: 'gaming network',
    statusPageUrl: 'https://www.nintendo.co.jp/netinfo/en_US/index.html',
    check: makeReachabilityCheck(
      'https://www.nintendo.co.jp/netinfo/en_US/index.html',
      'Nintendo network status page'
    ),
  },
]
