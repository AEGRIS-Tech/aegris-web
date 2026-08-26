# AEGRIS – technický audit snapshotu db0b3f9

Datum auditu: 26. 8. 2026

## 1. Shrnutí

AEGRIS je funkční pre-production AgTech SaaS/MVP, nikoli pouze UI prototyp. Snapshot obsahuje přibližně 15 849 řádků TypeScript/TSX, reálné Supabase Auth/DB flow, mapy, správu projektů, Copernicus Sentinel-2 NDVI analýzu, datové quality gates, weather integraci, decision engine, alerty, doporučení, dashboard, tisknutelné reporty a DEMO onboarding.

Decision engine má 47 testovacích scénářů. Poslední uživatelsky ověřený production build snapshotu db0b3f9 prošel na Next.js 16.3.0.

Celkový stav před opravami: přibližně 72–78 % k robustnímu MVP a 55–65 % k production-ready B2B SaaS.

Tento opravný snapshot řeší vysokou část dokončitelných problémů čistě v repozitáři. Neřeší věci, které nelze bezpečně dokončit bez databázových migrací/RLS konfigurace a provozní infrastruktury.

## 2. Co je hotové a funkční

### Aplikace a frontend
- Next.js App Router aplikace s dashboardem, projekty, mapou, detailem projektu, editací, reporty, DEMO, login/registrací a nastavením.
- Produkční build původního snapshotu prošel.
- Projektové detailní UI je rozsáhlé a napojené na reálná data.

### Autentizace
- Supabase Auth login funguje přes `signInWithPassword`.
- DEMO invite flow používá Supabase invitation mechanismus.
- Session problémy z testování byly reprodukovány jako systémový čas Windows (`JWT issued at future`), nikoli jako chyba heslového loginu.

### Projekty a vlastnictví
- Projekty jsou na klientu filtrovány podle `user_id`.
- Kritické serverové API `/api/analysis`, `/api/analysis/history`, `/api/dashboard` a `/api/weather` ověřují autentizovaného uživatele.
- Weather endpoint je svázaný s `projectId` a server ověřuje vlastnictví projektu před načtením souřadnic.

### Sentinel-2 / NDVI
- Server získává Copernicus OAuth token.
- Analýza používá skutečný polygon projektu, ne pouze bod.
- Polygon se převádí do UTM a statistika pracuje v 10m rozlišení.
- SCL + dataMask maskuje nevhodné pixely.
- Existuje quality gate na validní část geometrie.
- Historie se agreguje v intervalech a vrací mean/median/p05/p95/min/max a kvalitu dat.
- Analysis lock blokuje paralelní analýzy projektu.
- Stale lock cleanup řeší zablokované běhy.
- RPC rate limit omezuje počet analýz.

### Decision engine
- Existuje samostatný doménový decision engine.
- Zpracovává NDVI trend, plodinu, růstovou fázi, počasí a půdní profil.
- Má 47 testovacích scénářů.
- Výstupem je level, priorita, score, shrnutí, doporučení a akce.

### Dashboard a reporty
- Dashboard API agreguje projekty, analýzy, doporučení a alerty.
- Počítá kritické projekty, nepřečtené alerty a poslední analýzy.
- Report detail je tisknutelný přes `window.print()` a má print CSS.

### DEMO
- Veřejná DEMO žádost validuje délky a e-mail.
- Aktivace je chráněná `CRON_SECRET`.
- Existující Auth účet není veřejnou DEMO žádostí přepsán na DEMO.
- DEMO profil má start a expiraci.

## 3. Opravy zahrnuté v tomto balíku

### P1 – Auth/session ochrana
Původně existoval `lib/supabase/proxy.ts`, ale nebyl připojený žádným root `proxy.ts`/middleware entrypointem. Ochrana rout tedy byla mrtvý kód.

Oprava:
- přidán root `proxy.ts`,
- ochrana rozšířena na dashboard, projekty, mapu, reporty, settings a AI,
- session refresh je aktivní,
- přihlášený uživatel je z login/register přesměrován na dashboard.

### P1 – Obnova hesla
Původní aplikace neměla skutečný password recovery flow.

Oprava:
- `/auth/forgot-password`,
- `/auth/callback`,
- `/auth/reset-password`,
- login obsahuje „Zapomenuté heslo?“,
- callback používá `exchangeCodeForSession`,
- reset používá `updateUser({ password })`.

Nutná externí konfigurace Supabase je uvedena níže.

### P1 – DEMO callback
DEMO invite redirect je veden přes `/auth/callback?next=/auth/accept-invite`, aby PKCE/session flow mělo explicitní serverový callback.

### P1 – Starý DEMO accept endpoint
`/api/demo/accept` byl pozůstatek staršího vlastního tokenového systému a nebyl použit aktuálním klientem. Zbytečně obsahoval admin password update surface.

Oprava:
- endpoint nyní vrací HTTP 410 a žádnou admin operaci neprovádí.

### P1/P2 – MapLibre runtime
Repo používalo `maplibre-gl@6.1.0`, ale několik komponent explicitně odkazovalo na CSP worker verze `5.24.0`. Dashboard zároveň načítal mapovou větev staticky a reprodukoval MIME/module chybu.

Oprava:
- explicitní worker URL sjednocena na 6.1.0,
- WorldMap má stejný worker,
- dashboard WorldMap je client-only dynamic import (`ssr:false`),
- NewProjectModal WorldMap je client-only dynamic import,
- ProjectMap v detailu projektu je client-only dynamic import.

Toto je nejpravděpodobnější oprava reprodukované mapové MIME chyby, ale musí se po nasazení runtime ověřit.

### P2 – Supabase klienti
- `lib/supabase.ts` nyní re-exportuje jediný browser client.
- `lib/supabase/server.ts` už není prázdný a poskytuje server SSR client helper.

### P2 – Nastavení
Původní settings byly pouze lokální React state, odhlášení bylo obyčejný odkaz na `/login` a e-mail nebyl zobrazen.

Oprava:
- reálný Auth uživatel,
- reálné `signOut`,
- preference se ukládají do localStorage,
- UI potvrzuje uložení.

Poznámka: preference zatím nejsou serverově synchronizované mezi zařízeními.

### P2 – Registrace
- validace 8 znaků,
- potvrzení hesla,
- bezpečnější chybový stav,
- callback pro potvrzení e-mailu.

### P2 – `/api/statistics`
Původně byl prázdný `export {}` a nebyl nikde použit. Nyní explicitně vrací HTTP 410 a vysvětluje, že Sentinel statistiky jsou součástí `/api/analysis`.

### P2 – Security headers
Přidáno:
- `X-Content-Type-Options: nosniff`,
- `X-Frame-Options: DENY`,
- `Referrer-Policy`,
- omezená `Permissions-Policy`,
- odstraněn `X-Powered-By`.

### P3 – tsconfig
Odstraněn historický odkaz `proxy.ts.bak` z include.

## 4. Co zůstává nedokončené / vyžaduje další etapu

### P0 – Databázové migrace a RLS nejsou ve snapshotu
Repo neobsahuje SQL migrace ani verzovanou definici RLS policies. Přitom frontend přímo čte a zapisuje do Supabase tabulek.

Bez exportu skutečných policies nelze poctivě potvrdit tenant isolation.

Před ostrým nasazením je nutné verzovat:
- tabulky,
- constraints,
- indexy,
- RLS policies,
- RPC `consume_analysis_rate_limit`,
- analysis lock unikátní constraint,
- foreign keys.

Toto je největší production blocker.

### P1 – Výsledky decision engine se ukládají z browseru
Sentinel data vznikají serverově, ale klient následně:
- počítá decision engine,
- insertuje `analysis`,
- upsertuje `aegris_recommendations`,
- mění/vytváří `aegris_alerts`.

To znamená, že business výsledek není server-authoritative. I při správném RLS může uživatel přes vlastní klient upravit hodnoty svého reportu/analýzy.

Správná další architektura:
1. server načte projekt, plodinu, stage, soil a weather,
2. server spustí Sentinel analýzu,
3. server spustí decision engine,
4. server atomicky uloží analysis + recommendation + alert,
5. klient dostane pouze hotový výsledek.

To je další nejdůležitější refaktor.

### P1 – NDVI history zápis není transakční
`/api/analysis` smaže existující `ndvi_history` a následně vloží nová data. Pokud insert selže po delete, historie může zůstat prázdná.

Doporučení: přesunout refresh historie do DB RPC/transakce.

### P1 – DEMO abuse protection
`POST /api/demo` je veřejný a po úspěšné žádosti spouští invite flow. Chybí serverless rate limit / CAPTCHA / Turnstile.

Před veřejnou kampaní přidat např. Cloudflare Turnstile + durable rate limit. Současná kontrola duplicitního e-mailu není plnohodnotná anti-abuse ochrana.

### P1 – Unikátnost DEMO e-mailu
Aplikační check není atomický. Databáze by měla mít unikátní constraint/index nad normalizovaným e-mailem nebo jinou idempotentní strategii.

### P2 – Stateful analysis přes GET
`GET /api/analysis` spouští externí výpočet, mění lock/rate-limit a zapisuje NDVI historii. Semanticky má být `POST`.

Není to okamžitý blocker, ale před stabilním API doporučuji změnit.

### P2 – Observability
Je mnoho `console.error`, ale chybí centralizované error tracking/log correlation.

Doporučení: Sentry/Axiom/Datadog nebo Vercel logging + request correlation ID.

### P2 – Dependency/security audit
V auditním prostředí nebylo možné přistoupit na npm registry, takže aktuální `npm audit` nemohl být nezávisle zopakován. Spusťte jej lokálně po čistém `npm ci`.

### P2 – MapLibre worker z CDN
Oprava sjednocuje verzi, ale worker je stále externí runtime závislost na unpkg. Pro vyšší provozní odolnost je vhodné worker později self-hostovat.

### P3 – README a provozní dokumentace
Původní README je default create-next-app. Pro týmový provoz je potřeba dokumentovat DB schema, env proměnné, Supabase redirect URL, release checklist a incident recovery.

## 5. Supabase nastavení nutné po aplikaci oprav

Authentication → URL Configuration:

Site URL (production):
- `https://aegris-web.vercel.app`

Redirect URLs přidejte minimálně:
- `http://localhost:3000/auth/callback`
- `https://aegris-web.vercel.app/auth/callback`

Pokud Supabase konfigurace vyžaduje wildcard pro query parametry, použijte bezpečně scoped varianty podle dokumentace projektu, ne globální cizí domény.

## 6. Nutné env proměnné

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `CRON_SECRET`
- `SENTINEL_CLIENT_ID`
- `SENTINEL_CLIENT_SECRET`

Service role, CRON secret a Sentinel secret nikdy nesmí být `NEXT_PUBLIC_*`.

## 7. Release checklist

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. `npm audit`
6. runtime login/logout
7. password recovery
8. DEMO invitation
9. dashboard load bez 401
10. dashboard mapa bez MIME/module error
11. project create/edit/delete
12. weather vlastního projektu
13. weather cizího/nepřihlášeného projektu → 404/401
14. Sentinel analýza s polygonem
15. paralelní analysis → 409
16. rate limit → 429
17. report print
18. expired demo enforcement
19. Supabase RLS adversarial test s dvěma uživateli

## 8. Hodnota AEGRIS v Kč

Toto není znalecký posudek ani investiční valuace; jde o technicko-produktový odhad podle auditovaného rozsahu.

### Replacement cost současného systému
Kolik by přibližně stálo objednat znovu obdobný funkční systém od profesionálního týmu:

**1,5–3,5 mil. Kč**

Rozpětí zahrnuje frontend, Supabase backend, mapy, Copernicus integraci, NDVI quality logic, decision engine, reporty, DEMO flow a hardening. Nezahrnuje dlouhodobou agronomickou validaci a enterprise provoz.

### Samostatná hodnota kódu/IP bez prokázaných tržeb
Pokud by se oceňovalo pouze existující technické aktivum bez zákaznického traction:

**0,8–2,0 mil. Kč**

Kód se obvykle prodává za méně než jeho replacement cost, protože kupující přebírá maintenance a produktové riziko.

### Orientační pre-revenue hodnota projektu/společnosti
Pokud nejsou opakované tržby, ale systém je funkční a vlastní doménovou logiku:

**2,5–7 mil. Kč**

Pokud budou 3–5 reálných pilotů, měřitelný agronomický přínos a první opakované tržby, rozumný další pás může být přibližně:

**6–15 mil. Kč**

Největší zvýšení hodnoty teď nevznikne přidáním dalších obrazovek. Vznikne z:
- server-authoritative decision pipeline,
- prokázané RLS bezpečnosti,
- agronomické validace,
- pilotů a retence,
- měřitelné ekonomické úspory/výnosu pro zákazníka.

## 9. Aktuální skóre

Před auditním repair packem:
- Funkční MVP: 7,5/10
- Bezpečnost aplikace: 6,5/10 (bez možnosti ověřit RLS)
- Datová/analytická logika: 8/10
- Production readiness: 5,5–6/10
- Produktová úplnost: 7/10

Po aplikaci tohoto repair packu a úspěšném runtime testu auth/map:
- Funkční MVP: 8/10
- Aplikační security: 7–7,5/10 (RLS stále neověřeno)
- Production readiness: 6,5/10

K production-ready 8,5+/10 stále chybí hlavně verzované DB/RLS, serverová persistence decision výsledků, anti-abuse a observability.
