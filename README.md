# OpsPulse

A server monitoring and log analysis dashboard — simulates a small fleet of servers, ingests metrics and logs, evaluates health against configurable thresholds, and surfaces it all in a live-updating dashboard.

**Live demo:** https://opspulse-ebon.vercel.app/

## Why I built this

DeskHub (my first portfolio project) leaned on a backend-as-a-service (Supabase) for the database and auth layer. OpsPulse fills a different gap: a backend I wrote and own end-to-end, containerized with Docker, with a CI pipeline that actually runs tests and builds images on every push. It's also closer to my day-to-day work as a System Administrator — this is the kind of tool I'd genuinely want at my job.

## Architecture

```
opspulse/
├── backend/     Express API + mock data generator + SQLite storage
├── frontend/    React + Vite dashboard (Recharts for time-series charts)
├── docker-compose.yml   Runs both services together locally
└── .github/workflows/ci.yml   Tests + builds on every push
```

- **Mock data generator** (`backend/src/mockData.js`) simulates 5 servers with realistic, drifting CPU/memory/disk values and occasionally triggers short "incidents" — a burst of elevated load paired with error-level log lines — so the dashboard has real signal to react to, not just flat lines.
- **Threshold engine** (`backend/src/thresholds.js`) evaluates each server's latest metrics against configurable warning/critical thresholds and derives a single status (healthy / warning / critical).
- **Log ingestion** stores structured log entries (timestamp, level, server, message) and exposes filtering by server, level, and free-text search.
- **Frontend** polls the API every 5 seconds (matching the backend's tick rate) to keep the dashboard live without needing websockets for a v1.

## Tech stack

- **Backend:** Node.js, Express, better-sqlite3
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
- Multi-user auth and per-team server grouping
- Long-term metric retention with downsampling (currently a 6-hour rolling window)
- Real metric collection (swap the mock generator for actual host stats via a library like `systeminformation`)

## What I'd improve with more time

- Persist metrics to Postgres instead of SQLite for concurrent write scalability
- Add integration tests hitting the actual Express routes, not just the threshold logic unit tests
- Alert history / acknowledgment workflow (currently status is always "live," with no record of past incidents)

