# 🚀 CASA MX - Server Management

> **Documentation note:** Operational runbook lives here, but canonical project status/history is maintained in `COMPLETE_PROJECT_DOCUMENTATION.md`.

**Last Updated**: March 10, 2026

## Runtime Prerequisite

✅ **Required Node.js version**: 18.x, 19.x, or 20.x  
❌ **Unsupported for this stack**: Node 24.x

Check your version before starting servers:

```powershell
node -v
```

## Current Status

✅ **Backend Server**: Running on `http://localhost:3001`
✅ **Frontend Server**: Running on `http://localhost:3000`

---

## How to Ensure Both Servers Always Run

### Option 1: Use the Auto-Restart Script (Recommended)

This script will automatically restart either server if it crashes:

```powershell
cd c:\Users\axelj\casa-mx
.\keep-servers-running.ps1
```

**Features:**
- Monitors both servers every 10 seconds
- Auto-restarts if backend (3001) crashes
- Auto-restarts if frontend (3000) crashes
- Automatic cleanup on exit
- Visual status indicators

### Option 2: Manual Start (Without Auto-Restart)

If you want to start them manually in separate terminals:

**Terminal 1 - Backend:**
```powershell
cd c:\Users\axelj\casa-mx-backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\axelj\casa-mx
npm run dev
```

### `start-servers.ps1` Behavior

- Attempts automatic `nvm` switch to Node `20.19.0` when `nvm-windows` is installed.
- Then validates runtime compatibility before launching backend/frontend processes.

---

## Verify Servers Are Running

Check both ports are listening:

```powershell
Get-NetTCPConnection -LocalPort 3000,3001 -State Listen | Select-Object LocalPort, State
```

Expected output:
```
LocalPort  State
---------  -----
     3000 Listen
     3001 Listen
```

---

## Troubleshooting

### "Connection Refused" on /properties

1. Check if servers are running:
   ```powershell
   Get-NetTCPConnection -LocalPort 3000,3001 -State Listen
   ```

2. If only 3001 shows, frontend crashed. Restart it:
   ```powershell
   cd c:\Users\axelj\casa-mx
   npm run dev
   ```

3. If only 3000 shows, backend crashed. Restart it:
   ```powershell
   cd c:\Users\axelj\casa-mx-backend
   npm run dev
   ```

### Intermittent E2E redirect on protected upload routes

If Playwright intermittently lands on home/login instead of upload pages (for example `/upload/sale`), verify:

1. Frontend and backend are both reachable before tests start.
2. Auth session hydration has completed before asserting protected-route content.

This was stabilized in Mar 2026 by gating protected-route redirects until auth hydration is ready.

### Kill All Node Processes (Nuclear Option)

If servers are stuck:

```powershell
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3
# Then restart servers manually or use the auto-restart script
```

---

## Key Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web UI |
| Backend | http://localhost:3001 | API Server |
| Health Check | http://localhost:3001/health | Backend status |

---

## Recent Changes

✅ **Feb 25, 2026:**
- Added dropdown menu for Properties (Vender/Rentar/Buscar/Publicar)
- Fixed property publishing to show in listings
- Backend API fully integrated with frontend
- Created auto-restart monitoring script

✅ **Mar 9, 2026:**
- Stabilized backend container startup (Prisma runtime compatibility via Debian slim image)
- Fixed backend ESM runtime import issue for maps routes by using `.js` extensions in TS imports
- Verified backend health endpoint responds on `http://localhost:3001/health`
- Added runtime guards to fail fast when Node version is unsupported
- Migrated request flow from frontend mock storage to backend `/requests` API routes

---

## Notes

- The backend may show Redis warnings, but these are non-critical (falls back to direct DB queries)
- Frontend should compile within 5 seconds
- Both servers should respond immediately after startup
- Data persists in PostgreSQL database (not localStorage)
