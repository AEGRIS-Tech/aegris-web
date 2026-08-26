# Jak aplikovat AEGRIS repair pack

Balík zachovává adresářovou strukturu projektu. Nejsou v něm `.env.local`, `.git`, `node_modules` ani `.next`.

## Doporučený postup

1. Ujistěte se, že je současný repozitář commitnutý a čistý:
   `git status`
2. Udělejte zálohu nebo nový branch.
3. Obsah repair packu překopírujte do kořene `C:\Users\zamec\aegris-web` a povolte přepsání souborů.
4. Nové soubory (`proxy.ts`, auth callback/forgot/reset) musí zůstat v přesných cestách z balíku.
5. Spusťte:
   `npm ci`
   `npm run lint`
   `npm test`
   `npm run build`
6. Nastavte Supabase Auth Redirect URLs podle `AEGRIS_AUDIT_REPORT.md`.
7. Spusťte `npm run dev` a proveďte runtime checklist.

## Důležité

`AEGRIS_FIXED_FULL.zip` není náhrada za databázové migrace. Databázové RLS/policies nebyly součástí vstupního snapshotu a musí být samostatně exportovány a auditovány.
