$ErrorActionPreference = "Stop"

Write-Host "=== AEGRIS VERIFY ===" -ForegroundColor Cyan

Write-Host "\n1/6 Git status" -ForegroundColor Yellow
git status --short

Write-Host "\n2/6 Install clean dependencies" -ForegroundColor Yellow
npm ci

Write-Host "\n3/6 Lint" -ForegroundColor Yellow
npm run lint

Write-Host "\n4/6 Tests" -ForegroundColor Yellow
npm test

Write-Host "\n5/6 Production build" -ForegroundColor Yellow
npm run build

Write-Host "\n6/6 Security greps" -ForegroundColor Yellow
Write-Host "Internal API details fields:"
git grep -n "details:" -- "app/api/**/*.ts" 2>$null
Write-Host "Legacy MapLibre worker versions:"
git grep -n "maplibre-gl@5\.24\.0" -- app 2>$null
Write-Host "Direct weather lat/lon endpoint calls:"
git grep -n "/api/weather?latitude" -- app 2>$null

Write-Host "\nAutomated checks completed. Continue with runtime checklist in AEGRIS_AUDIT_REPORT.md." -ForegroundColor Green
