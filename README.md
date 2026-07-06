# OpsPulse

A live status dashboard for real third-party services — polls each provider's own public status source, computes a live operational / degraded / outage state, and surfaces it in a dashboard with response-time history and a status-change log.

**Live demo:** https://opspulse-ebon.vercel.app/

## Why I built this

DeskHub (my first portfolio project) leaned on a backend-as-a-service (Supabase) for the database and auth layer. OpsPulse fills a different gap: a backend I wrote and own end-to-end, containerized with Docker, with a CI pipeline that actually runs tests and builds images on every push. It started out simulating a fake server fleet; it now checks real, live infrastructure instead, which is a lot closer to what monitoring tooling actually looks like in my day job as a System Administrator.

## What it monitors

| Service | Source | Coverage |
|---|---|---|
| GitHub | [githubstatus.com](https://www.githubstatus.com/api) — public Statuspage JSON API | Full incident status |
| Apple iCloud | Apple's public system status feed | Full incident status, filtered to iCloud-related services |
| AWS | [status.aws.amazon.com](https://status.aws.amazon.com/rss/all.rss) — public RSS feed | Aggregate — any active notice across all AWS services (AWS's authenticated per-service Health API requires a paid Business/Enterprise support plan, so it's out of reach for a project like this) |
| PlayStation Network | Reachability check against Sony's own status page | Sony doesn't publish a public incident API, so this is a real HTTPS reachability check against their status domain, not full incident detail |
| Nintendo Switch Online | Reachability check against Nintendo's network status page | Same caveat as PSN — no public API, so it's a reachability check |

Each service is genuinely polled on a timer; nothing here is simulated or hard-coded.

## Architecture

```
opspulse/
├── backend/     Express API + real external status polling + in-memory storage
├── frontend/    React + Vite dashboard (Recharts for response-time history)
├── docker-compose.yml   Runs both services together locally
└── .github/workflows/ci.yml   Tests + builds on every push
```

- **Status polling** (`backend/src/externalStatus.js`) checks each provider on a 60-second interval, normalizes whatever shape that provider returns into `{ status, message, responseTimeMs }`, and gracefully falls back to an `unknown` status (rather than crashing) if a provider's endpoint is unreachable or its response shape changes.
- **Status normalization** (`backend/src/thresholds.js`) is a thin pass-through today, but it's the one seam every downstream consumer (routes, frontend) reads through — kept from the original threshold-engine design so status logic has a single place to live if it needs to get smarter later.
- **Change-driven logging** only writes a log entry when a service's status actually changes, instead of logging "still fine" on every poll — so the Logs page reads like a real incident history.
- **Frontend** polls the API every 15 seconds to keep the dashboard live without needing websockets for a v1.

## Tech stack

- **Backend:** Node.js, Express, native `fetch`
- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Containerization:** Docker, docker-compose
- **CI:** GitHub Actions (test, build, and Docker image build on every push)

## Running locally with Docker (recommended)

```bash
docker compose up --build
```
- Backend API: http://localhost:4000
- Frontend: http://localhost:5173

## Running locally without Docker

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend** (separate terminal):
```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:4000, adjust if needed
npm run dev
```

## Running tests

```bash
cd backend
npm test
```

## Roadmap (cut from v1 to ship faster)

- Real alert delivery (email/Slack) instead of dashboard-only status
- WebSocket push instead of polling
- Per-region AWS status instead of the single aggregate "any active notice" signal
- Persisting status history to a real database instead of an in-memory store (currently a 6-hour rolling window that resets on restart)
- Swapping the PSN/Nintendo reachability checks for real incident data if either ever publishes a public status API

## What I'd improve with more time

- Persist status history to Postgres instead of in-memory storage, for durability across restarts
- Add integration tests hitting the actual Express routes and mocking the external HTTP calls, not just the status-normalization unit tests
- Retry/backoff handling for transient failures against third-party endpoints, so a single dropped request doesn't flip a service to "unknown" for a full poll cycle
