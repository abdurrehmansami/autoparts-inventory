# AutoParts Inventory

Offline desktop app for an auto parts shop: products & stock, sales, purchases, quotations,
customers/suppliers, cash book, bank book, ledgers and reports. English + اردو.
Runs on Windows 10/11 and Ubuntu. Free and open-source stack, no internet or server needed.

## Quick start (development)
```bash
npm install          # Node 22+
npm run dev          # opens the app with hot reload
npm test             # unit tests (run inside Electron's Node)
npm run typecheck
```
First launch asks for a shop name, username and password.

> Running from VS Code's integrated terminal? It sets `ELECTRON_RUN_AS_NODE=1`, which makes Electron
> start as plain Node. Run `unset ELECTRON_RUN_AS_NODE` first (or use a normal terminal).

## Installers
```bash
npm run dist:win     # Windows installer (.exe) — on Ubuntu needs `sudo apt install wine`
npm run dist:win:zip # Windows portable zip (no wine needed): unzip, run AutoPartsInventory.exe
npm run dist:linux   # AppImage + .deb
```
Or push a `v*` tag — GitHub Actions builds both (see `.github/workflows/release.yml`).

## Where data lives
| OS | Database |
|---|---|
| Windows | `%APPDATA%\AutoParts Inventory\data\inventory.db` |
| Linux | `~/.config/AutoParts Inventory/data/inventory.db` |

## Stack
Electron · React 19 · TypeScript · Tailwind 4 · TanStack Query/Table · i18next ·
SQLite (`node:sqlite`, built into Electron) · Drizzle ORM · Vitest · electron-builder

## Docs
- [CLAUDE.md](CLAUDE.md) — rules & conventions (for humans and Claude)
- [docs/PRD.md](docs/PRD.md) — requirements
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — design
- [docs/DB_SCHEMA.md](docs/DB_SCHEMA.md) — tables and posting rules
- [docs/ROADMAP.md](docs/ROADMAP.md) — progress
