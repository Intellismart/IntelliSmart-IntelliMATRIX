# Operations Guide — Start/Stop, Reboot, and Cache

Date: 2025-09-29
Owner: Engineering Ops
Scope: How to run the app locally, reboot the server, clear caches, and verify changes. Windows PowerShell commands included.

1) Start in Development (hot reload)
- Command: npm run dev
- URL: http://localhost:3000
- Stop: Ctrl + C in the terminal

2) Reboot the Dev Server (when changes don’t appear)
- Stop the running dev server (Ctrl + C)
- Clear Next.js cache (optional, forces a clean rebuild next run):
  PowerShell:
  if (Test-Path .next) { Remove-Item -Recurse -Force .next }
- Start again: npm run dev

3) Build and Run Production Locally
- Build: 5
- Start: npm run start
- URL: http://localhost:3000 (uses optimized production build)
- Stop: Ctrl + C

4) Verify Recent Changes
- Hard refresh in the browser (Ctrl + F5)
- Open devtools → Network tab → Disable cache (while devtools open)
- Confirm the files you changed are being requested (look for 200/304 responses)

5) Data Store Notes
- The demo persists data to data/db.json.
- To reseed with defaults: Stop the app, delete data/db.json, then start again.
- The store migrates missing arrays (securityAlerts, cameras, transports) automatically.

6) Common Issues
- Port already in use: Stop other Node/Next processes. PowerShell: Get-Process -Name node (then Stop-Process -Id <PID> if needed)
- Stale UI: Clear .next as above, then restart dev server. Also clear the browser cache for the site.

7) Environment Variables
- SESSION_SECRET should be set in production for secure session signing.
- Create a .env.local and set SESSION_SECRET=your-strong-secret

8) Logs
- This demo logs to the console. For production, add structured logs and audit trails (see security-design.md).
