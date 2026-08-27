$ErrorActionPreference = "Stop"
Write-Host "=== AEGRIS SERVER ANALYSIS VERIFY ===" -ForegroundColor Cyan
npm run lint
npm test
npm run build
npm audit
git diff --check
Write-Host "`n=== Forbidden browser writes ===" -ForegroundColor Cyan
$hits = git grep -n -E '\.(insert|upsert)\(' -- 'app/projects/[id]/page.tsx'
if ($LASTEXITCODE -eq 0 -and $hits) { $hits } else { Write-Host "No project-page insert/upsert calls." -ForegroundColor Green }
Write-Host "`n=== Status ===" -ForegroundColor Cyan
git status --short
