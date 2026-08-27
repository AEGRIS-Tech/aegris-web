# AEGRIS server-authoritative analysis hardening

## Order matters
Do **not** apply the SQL migration before the matching application code is deployed/tested. The old browser flow needs write access that this migration removes.

## 1. Apply package on branch
Copy the package contents over the repository while on `hardening/server-analysis`.

## 2. Static verification
Run:

```powershell
npm ci
npm run lint
npm test
npm run build
npm audit
git diff --check
git status
```

All commands must pass before continuing.

## 3. Local runtime test before DB migration
Start the app and verify login, project detail, weather and existing data rendering. Do not expect the hardened analysis write path to work until the migration is applied, because `mark_aegris_alert_read` does not exist yet; analysis itself still uses service role and can be exercised if desired.

## 4. Apply SQL in Supabase
Open Supabase SQL Editor and run the complete file:

`supabase/migrations/20260826_server_authoritative_analysis.sql`

Run it once as one script. If it raises the orphan-NDVI exception, stop and inspect the orphan rows; do not delete them blindly.

## 5. Runtime verification after migration
1. Login as a normal user.
2. Open an owned project.
3. Run analysis once.
4. Confirm a new `analysis` row, matching `aegris_recommendations` row and active `aegris_alerts` row appear in the UI.
5. Refresh the page; result must persist.
6. Mark an alert as read; it must disappear from unread alerts.
7. Run analysis again; duplicate unread alerts of the same type must not accumulate.
8. Confirm another user's project cannot be read or analyzed.

## 6. Security verification SQL

```sql
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('analysis','aegris_recommendations','aegris_alerts','ndvi_history')
order by tablename, policyname;

select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.ndvi_history'::regclass
  and contype = 'f';
```

Expected: output tables retain ownership SELECT policies; client INSERT/UPDATE policies for authoritative outputs are gone; `ndvi_history_project_id_fkey` exists.

## 7. Commit only after runtime verification

```powershell
git add -A
git commit -m "Make analysis persistence server authoritative"
git push -u origin hardening/server-analysis
```
