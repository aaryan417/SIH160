# SIH26160 — VPN Analyzer Dashboard

React + Vite dashboard for the backend scaffold. Five pages matching the
pipeline: Testbed configs → Capture sessions → Classification → Risk
assessment → Reports.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:8000 for local dev
npm run dev
```

Runs at `http://localhost:5173`. Requires the backend running at the URL
in `.env` (CORS is already configured for `localhost:5173` in the backend's
`app/config.py`).

**Production (Vercel):** add `VITE_API_URL=https://<your-backend-domain>`
in Vercel → Project → Settings → Environment Variables, then redeploy.


## What's real vs. what you'll need to extend

- **Real**: all five pages call the actual backend endpoints — configs,
  upload, list, classify, assess, report — with error handling on each
  request. Sessions persist across reloads via `GET /capture/sessions`.
- **Not built**: auth/login, PDF export of reports (the Reports page shows
  the report record, not a rendered document), and history/trend views
  across sessions.
