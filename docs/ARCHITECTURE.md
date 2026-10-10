# Architecture

## Overview
```
┌──────────── Renderer (React, sandboxed) ────────────┐
│ features/* pages → TanStack Query hooks → lib/api.ts │
└──────────────────────────┬──────────────────────────┘
                window.api.invoke(channel, input)        (preload, contextBridge)
┌──────────────────────────▼──────────────────────────┐
│ Main process                                          │
│ ipc/  : zod-validate input, auth guard, map errors    │
│ services/ : business rules, transactions              │
│ db/   : node:sqlite + Drizzle, migrations             │
│ print/: hidden window → webContents.print / printToPDF│
│ backup/: SQLite online backup API                     │
└──────────────────────────┬──────────────────────────┘
                     userData/data/inventory.db (WAL)
```

Why Electron (not Tauri): identical Chromium rendering on Ubuntu (dev) and Windows (shop) — matters for
Urdu Nastaliq text and print layouts — and built-in silent printing to a named printer
(`webContents.print({ silent, deviceName })`), which thermal receipts need. No Rust toolchain required.

## Processes
- **Main** (`src/main`) owns the database, filesystem, printing and the login session. Single source
  of truth. SQLite access is synchronous, which is fine and fast for one user; keep each IPC call short.
- **Preload** (`src/preload`) exposes exactly one function: `window.api.invoke(channel, input)`.
- **Renderer** (`src/renderer`) is plain web code; it cannot import Node or Electron modules.

## IPC contract
`src/shared/ipc-contract.ts` declares every channel as `{ input; output }`. Both sides import it, so
a renamed field breaks the build, not the shop.

- Main: `handle(channel, zodSchema, fn, { public? })` in `src/main/ipc/registry.ts`
  - validates input with zod → `errors.validation` on failure
  - rejects when not logged in (unless `public`) → `errors.unauthorized`
  - returns `{ ok: true, data } | { ok: false, error: { code, params? } }`
- Renderer: `call(channel, input)` in `src/renderer/src/lib/api.ts` unwraps and throws `AppError`;
  UI shows `t(error.code, error.params)` in a toast.

## Data rules
- Money: integer paisa. Quantities: integer units.
- Stock: `stock_movements` is the ledger; `products.stock_qty` is a cache updated only by
  `services/stock.ts` in the same transaction. A "Recalculate stock" tool rebuilds the cache.
- Average cost: moving average updated on purchase (and purchase return); sale lines store `unit_cost`
  at time of sale so profit reports never change retroactively.
- Party balances: `ledger_entries` (debit = party owes us more, credit = owes us less / we owe them).
  Balance = opening + Σdebit − Σcredit. Positive = receivable, negative = payable.
- Cash/Bank: `cash_entries` per account (amount_in / amount_out).
- Posting a sale (one transaction): `sales` + `sale_items` → `stock_movements` (−qty) →
  `ledger_entries` (debit total, credit paid; only if a customer is chosen) → `cash_entries` (in = paid).
- Cancelling writes reversing rows and sets `status = 'cancelled'`; history is never rewritten.

## Database
- Driver: `node:sqlite` `DatabaseSync` (Electron 44 → Node 24, SQLite 3.53). `sqlite-adapter.ts` gives it
  the small better-sqlite3-shaped surface Drizzle's sync session uses (`prepare/run/all/get/raw/transaction`),
  so we get typed Drizzle queries + migrator with zero native code. Nested `transaction()` calls become
  savepoints.
- File: `app.getPath('userData')/data/inventory.db`. Pragmas: `journal_mode=WAL`, `foreign_keys=ON`,
  `synchronous=NORMAL`, `busy_timeout=5000`.
- Migrations: edit `src/main/db/schema.ts` → `npm run db:generate` → SQL in `drizzle/` → applied
  automatically on startup (`migrate()`), before any window opens. Packaged builds read them from
  `process.resourcesPath/drizzle`.
- Backups: `db.backup(path)` (online, consistent) to `userData/backups/` daily + on quit, keep last 30;
  manual backup/restore to a chosen folder. Restore = close DB, copy file, relaunch.

## Auth
One user row. Password hashed with Node `crypto.scrypt` (salt + hash, no native deps). The session
is a flag in the main process; it resets when the app quits. First run shows a setup screen.

## i18n & RTL
- i18next with `en.json` and `ur.json` (same keys). Language stored in `settings` and applied on boot.
- Switching sets `<html lang dir>`; layout uses logical CSS properties so it mirrors automatically.
- Fonts bundled: Inter (EN), Noto Nastaliq Urdu (UR). Nastaliq is tall: Urdu mode increases
  line-height and row heights via `[dir=rtl]` CSS.
- Product/party names have optional Urdu fields; display falls back to English.
- Numbers, codes, phone numbers render LTR (`.num`, `dir="ltr"`).

## Printing
1. Renderer calls `print:document` with `{ type, id, paper, mode: 'preview' | 'print' | 'pdf' }`.
2. Main builds HTML from a template in `src/main/print/templates/` (plain TS template functions with
   inline CSS sized for `A4 | A5 | 80mm | 58mm`), loads it into a hidden `BrowserWindow`.
3. `print` → `webContents.print({ silent, deviceName, pageSize })` using printer from Settings;
   `preview` → visible window with Print button; `pdf` → `printToPDF` and save dialog.

## Folder map
```
src/shared/      ipc-contract.ts, schemas/*.ts (zod), money.ts, types.ts
src/main/        index.ts, window.ts
  db/            client.ts, schema.ts, migrate.ts, test-db.ts
  services/      auth, settings, sequence, stock, products, parties, sales, purchases, accounts...
  ipc/           registry.ts, index.ts, <module>.ts
  print/         index.ts, templates/
  backup/        index.ts
src/preload/     index.ts, index.d.ts
src/renderer/src app.tsx, main.tsx, i18n/, lib/, components/ui, components/layout, features/<module>/
```

## Build & release
- `electron-builder`: Windows NSIS installer (x64), Linux AppImage + deb.
- No native modules: SQLite is `node:sqlite`, built into Electron, so Windows builds work from Ubuntu.
  The portable zip (`dist:win:zip`) needs nothing extra; the NSIS installer (`dist:win`) needs `wine`
  on Linux, or build it on GitHub Actions `windows-latest` — see `.claude/skills/release-build`.
- Installer is unsigned (code-signing certs cost money): Windows SmartScreen shows "More info → Run
  anyway" on first install only.
