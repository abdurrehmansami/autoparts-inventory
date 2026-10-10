# Roadmap

Tick items as they land. Each phase ends with a Windows installer the owner can try.

## Phase 0 — Foundation
- [x] Docs: PRD, architecture, schema, roadmap, CLAUDE.md, skills
- [x] Electron + React + TS scaffold, Tailwind, Urdu/English i18n with RTL
- [x] SQLite + Drizzle schema + startup migrations
- [x] Typed IPC with zod + auth guard
- [x] First-run setup + login (single user)
- [x] App shell modelled on the old app (menu bar, toolbar, status bar), language switch
- [x] Products module (list, search, create/edit) — reference implementation for other modules
- [x] GitHub Actions workflow: build Windows + Linux installers on `v*` tag (not yet run — needs a GitHub repo)
- [ ] App icon (resources/icon.png 512×512)

## Phase 1 — Daily selling (MVP)
- [ ] Categories, brands (inline create from product form)
- [ ] Parties: customers & suppliers CRUD, opening balance
- [ ] Opening stock + stock adjustment
- [ ] Sale entry (keyboard-first grid, walk-in or customer, paid/credit) + cancel
- [ ] Purchase entry + cancel, avg cost update
- [ ] Printing: invoice A4/A5/80mm/58mm, preview, silent print, PDF
- [ ] Settings screen: shop info, printers, paper sizes, stock warnings
- [ ] Automatic + manual backup/restore
- [ ] Find (F3): search product by any number/name/vehicle

## Phase 2 — Accounts
- [ ] Cash & bank accounts, opening balances
- [ ] Receipts / payments vouchers
- [ ] Party ledger with running balance, print
- [ ] Cash Book, Bank Book, transfers, expenses
- [ ] Sale return, purchase return
- [ ] Quotations + convert to sale

## Phase 3 — Reports
- [ ] Sales / purchase reports (period, party, product)
- [ ] Profit report, day close summary
- [ ] Stock report, stock valuation, low stock, item movement history
- [ ] Receivables / payables
- [ ] Rate comparison
- [ ] Export to Excel and PDF

## Phase 4 — Polish & migration
- [ ] Vehicle fitment + cross-reference UI
- [ ] Excel/CSV importer (products, parties, opening balances)
- [ ] Import from old Express Inventory DB (when a copy is available)
- [ ] Recalculate-stock tool, audit log viewer
- [ ] Auto-update via GitHub Releases (optional)
