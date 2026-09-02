# HKD Pizza Point POS

Offline-first desktop POS for **Hashmi Ka Dera (HKD) Pizza Point**, built with Electron + React + TypeScript + SQLite (better-sqlite3).

## Getting started

```bash
npm install
npm run dev        # launches Vite + Electron in dev mode
```

On first launch the SQLite database is created and seeded automatically with the full HKD menu and two accounts:

| Role     | Username | Password      |
|----------|----------|---------------|
| Admin    | `admin`  | `admin123`    |
| Employee | `employee` | `employee123` |

**Change these passwords in production** (Admin → Employees → Reset Password).

Dev database lives at `./data/hkd.db`. Packaged-app database lives in the OS user-data directory (e.g. `%APPDATA%/HKD Pizza Point POS` on Windows).

## Building an installer

```bash
npm run build       # typecheck + build renderer/main/preload + electron-builder
```

`electron-builder.yml` targets Windows (`nsis`) as the primary platform, with `mac` (dmg) and `linux` (AppImage) targets available for development on other OSes. `better-sqlite3`'s native binding is rebuilt automatically for the target Electron version during packaging (`npmRebuild: true`).

If you need to run/debug the app itself (not just build it) against the Electron ABI locally, native modules must be rebuilt once for Electron instead of your system Node:

```bash
npx electron-rebuild -f -w better-sqlite3
```

## Architecture

- `electron/main` — main process: SQLite schema/seed/migrations, business logic (`services/`), IPC handlers (`ipc/`), printing, custom `hkd-media://` protocol for product/deal images.
- `electron/preload` — the only bridge exposed to the renderer (`window.hkd`), via `contextBridge`. No Node/Electron API is exposed directly.
- `shared/` — types and the `HkdApi` contract shared by main and renderer.
- `src/` — React renderer: POS screen, full Admin panel (Dashboard, Orders, Employees, Sessions, Menu, Deals, Reports, Printer Settings, General Settings, Audit Log, Backup/Restore), and the print-only invoice route.

### Key business rules implemented

- **Employee sessions never auto-close at midnight** — only an explicit "End Session" action ends one (`electron/main/services/sessions.ts`).
- **Business date** is a separate reporting concept from sessions, rolling over at a configurable hour (default 6AM, not midnight) — see Admin → General Settings.
- **Historical price integrity** — every order item stores a snapshot of name/variant/unit price at sale time; changing a live price never alters past invoices.
- **Deals** use a generalized slot model (`fixed` vs `choice` slots) so bundles like the 2 Large Pizza Deal can require an employee to pick specific pizzas without ever charging the individual pizza prices on top of the deal price.
- **Service charge** is a fixed PKR amount (not a %), configurable by Admin, and snapshotted per invoice.

## Known limitations / things to verify on real hardware

- Printing was implemented against Electron's standard wired/system-printer APIs (`webContents.getPrintersAsync` / `webContents.print`) and exercised via automated logic tests, but has not been verified against a physical thermal printer — do a real test print from Admin → Printer Settings once hardware is connected.
- Product/deal images ship as clean custom illustrations per category (no real food photography was provided); replace them anytime via Admin → Menu / Deals → upload image.
