---
name: release-build
description: Build installers — Windows .exe (NSIS) for the shop and Linux AppImage/deb — bump the version, and publish a release. Use when shipping a version to the shop PC.
---

# Release build

1. `npm run typecheck && npm test` must pass. Run the app once (`npm run dev`) and smoke-test:
   login, products search, language switch.
2. Bump `version` in `package.json` (semver; patch for fixes, minor for new screens). Add the
   changes to `CHANGELOG.md`.
3. Build:
   - Linux: `npm run dist:linux` → `release/<version>/*.AppImage`, `*.deb`
   - Windows: `npm run dist:win` → `release/<version>/AutoParts Inventory Setup <version>.exe`
     - From Ubuntu the NSIS installer needs `wine` (`sudo apt install wine`) — electron-builder runs the
       installer stub under wine to create the uninstaller and embed icon/version info. Without wine:
       `npm run dist:win:zip` gives a portable zip (verified working), or push a tag `v<version>` and
       let GitHub Actions (`.github/workflows/release.yml`, `windows-latest`, free) build the installer.
4. Installer is unsigned → on the shop PC Windows SmartScreen shows "Windows protected your PC":
   click **More info → Run anyway** (first install only).
5. Data lives in `%APPDATA%\AutoParts Inventory\data\inventory.db` and survives reinstall/upgrade.
   Migrations run automatically on first start of the new version. **Take a backup before
   upgrading** (Tools → Backup) until auto-backup ships.
6. `git tag v<version> && git push --tags` (only when the user asks to publish).

Linux note: Electron's Wayland backend crashes on Ubuntu 26.04, so the app runs under XWayland via
`--ozone-platform=x11` (in npm scripts and `linux.executableArgs` in electron-builder.yml).
