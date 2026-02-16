# LumineerCo Service Provider — 24/7 AI Company Stack

This repository now contains a **working company starter** with:
- frontend for users/clients,
- backend API for operations,
- GitHub scheduled automation for 24/7 cycle artifacts.

## Architecture

## 1) Frontend (Users & Clients)
- Landing page: `index.html`
- Operations dashboard: `frontend/dashboard.html`
- Dashboard logic: `frontend/app.js`

Features:
- View live overview (clients/tasks/running tasks).
- Add clients and tasks from UI.
- Trigger automation cycle and view latest report.

## 2) Backend (Company Engine)
- API server: `backend/server.js`
- Persistent JSON storage:
  - `backend/data/clients.json`
  - `backend/data/tasks.json`
  - `backend/data/finance.json`
- Report output:
  - `backend/reports/latest.json`

Core endpoints:
- `GET /api/health`
- `GET /api/overview`
- `GET/POST /api/clients`
- `GET/POST /api/tasks`
- `POST /api/run-cycle`
- `GET /api/reports/latest`

## 3) GitHub 24/7 Automation
- Hourly workflow: `.github/workflows/company-24x7.yml`
- Hourly script: `scripts/company_cycle.py`
- Existing content workflow remains available:
  - `.github/workflows/automation-report.yml`
  - `scripts/generate_assets.py`

---

## Step-by-step setup (Only actions you need to do)

### Step 1 — Push this repo to your GitHub
1. Create a GitHub repository (or use existing).
2. Push this code to `main`.

### Step 2 — Enable GitHub Actions
1. Open your repo on GitHub.
2. Go to **Actions** tab.
3. Enable workflows if disabled.
4. Confirm these workflows exist:
   - `Deploy Static Site`
   - `Automation Reporting`
   - `Company 24x7 Cycle`

### Step 3 — Run locally once (verification)
```bash
# terminal 1: backend
node backend/server.js

# terminal 2: frontend
python3 -m http.server 4173
```
Open `http://localhost:4173/frontend/dashboard.html`.

### Step 4 — Use dashboard as operator panel
1. Keep API base URL as `http://localhost:8787`.
2. Click **Refresh Overview**.
3. Add one client and one task.
4. Click **Run Automation Cycle**.
5. Confirm latest report appears in the dashboard.

### Step 5 — Deploy publicly on GitHub Pages
1. In repo settings: **Pages**.
2. Source: **GitHub Actions**.
3. Run `Deploy Static Site` workflow.
4. Share your Pages URL with users/clients.

### Step 6 — Connect real business services (you only do this once)
1. Replace checkout stubs with Payhip/Ko-fi/Stripe links.
2. Deploy `webhooks/payment-handler/index.js` in your preferred serverless platform.
3. Add signature verification and email delivery provider.
4. Set business email for client communication.

### Step 7 — Operate 24/7 with minimal effort
- Let hourly + scheduled workflows run.
- Review generated artifacts and financial snapshots weekly.
- Scale offers and marketing based on reports.

---

## Important note
This stack is intentionally provider-agnostic and safe by default. For real production payments, you must complete KYC/compliance and wire secure webhook signature verification.
