# Graha Remedy App — Preview Run Doc

## How to reproduce uncommitted artifacts
- No `.env.local` needed — backend defaults to port 3001, frontend to 5173
- Dependencies already installed in both `frontend/` and `backend/`
- Backend must be built before `npm start`: `cd backend && npm run build` (tsc → dist/)
- `data/users.json` + `data/reports.json` ship pre-seeded as empty stores and are read/written by the file-backed JSON store
- Optional env for auth: `JWT_SECRET` (defaults to an insecure dev secret with a warning when unset)
- Optional env for GA4: `VITE_GA4_ID` in the frontend (absent = no tracking at all)

## How to run the servers

Both servers currently run as launchd jobs so they outlive this thread:
- `graha-backend` on port 3001 (`node dist/index.js`)
- `graha-frontend` on port 5173 (`npx vite --port 5173`)

### Backend (port 3001)
```bash
# (re)start after code changes — rebuild first
cd /Users/pranesh/Desktop/Graha-Remedy-App/backend && npm run build
launchctl remove graha-backend 2>/dev/null
launchctl submit -l graha-backend -- /bin/sh -c \
  'cd /Users/pranesh/Desktop/Graha-Remedy-App/backend && exec /usr/bin/env PORT=3001 node dist/index.js > /tmp/graha-backend.log 2>&1'
```

### Frontend (port 5173)
```bash
launchctl remove graha-frontend 2>/dev/null
launchctl submit -l graha-frontend -- /bin/sh -c \
  'cd /Users/pranesh/Desktop/Graha-Remedy-App/frontend && exec npx vite --port 5173 --strictPort > /tmp/graha-frontend.log 2>&1'
```

### Verify
- Backend: `curl http://localhost:3001/api/health`
- Frontend: `curl http://localhost:5173`
- Auth round-trip: register → cookie jar → save report → `/api/reports/mine` (see session history)

### Cleanup
```bash
launchctl remove graha-backend 2>/dev/null; launchctl remove graha-frontend 2>/dev/null
kill $(lsof -ti:3001) $(lsof -ti:5173) 2>/dev/null
```
