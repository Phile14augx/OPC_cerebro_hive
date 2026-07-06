# CerebroHive — Scripts

> **Note:** In Next.js, the frontend and backend (API routes) are served by the
> **same process** on the same port. There is no separate backend server to start.

---

## Available Scripts

| Script | What it does |
|---|---|
| `start-dev.bat` / `start-dev.ps1` | Starts the **development** server with hot-reload (Turbopack) on `http://localhost:3000` |
| `start-prod.bat` / `start-prod.ps1` | Runs `npm run build` then `npm run start` — use this for **production** |
| `stop-server.bat` / `stop-server.ps1` | Kills any Node.js process listening on port 3000 |

---

## How to Run

### From PowerShell (recommended)

```powershell
# Development (hot-reload)
.\scripts\start-dev.ps1

# Production (build first, then serve)
.\scripts\start-prod.ps1

# Stop the server
.\scripts\stop-server.ps1
```

### From Windows Explorer

Double-click any `.bat` file — no terminal needed.

> If you see a PowerShell execution policy error, run this once as Administrator:
> ```powershell
> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

---

## URLs

| Route | Description |
|---|---|
| `http://localhost:3000` | Main website |
| `http://localhost:3000/dashboard` | Client dashboard |
| `http://localhost:3000/enterprise/dashboard` | Corporate L&D dashboard |
| `http://localhost:3000/api/dashboard` | Dashboard API |
| `http://localhost:3000/api/tickets` | Support tickets API |
| `http://localhost:3000/api/leads` | Leads capture API |
| `http://localhost:3000/api/contact` | Contact form API |
| `http://localhost:3000/api/academy/enroll` | Academy enrollment API |
| `http://localhost:3000/api/enterprise/employees` | Employee management API |

---

## Data Persistence

All API data is stored in `data/db.json` at the project root.  
The file is auto-created with seed data on the first API request.
