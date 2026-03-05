# ACS — Accounting Concierge Services

## Project Overview

ACS is a French-language Progressive Web App (PWA) for villa property management and expense tracking. It is built for a concierge service operating in Thailand (Thai Baht currency, Bangkok timezone).

The entire app lives in two files:
- `index.html` — All HTML, CSS, and JavaScript in one self-contained file
- `sw.js` — Service Worker for scheduled push notifications at 19h Bangkok time

## Architecture

**No build system.** No npm, no bundler, no transpiler. Open `index.html` directly in a browser.

**Data persistence:** `localStorage` only. All client/villa data is stored in the browser under `acs_*` keys. There is no backend.

**Single-page app pattern:** Multiple `<div class="screen">` elements are toggled with `display:none/flex`. Navigation via the bottom `<nav>` calls `goPage(name)`.

**Two roles:**
- `admin` — hardcoded credentials (`ADMIN` object), sees all clients and global KPIs
- clients — stored in `localStorage` under `acs_clients`, each with villas, history, and a 4-digit PIN

## CSS Conventions

CSS classes use heavily abbreviated names (mostly 2–3 chars), often in French:
- `tb` = topbar, `nav` = bottom navigation, `ct` = content area
- `kc`/`kr` = KPI card/row, `vc` = villa card
- `or`/`or2`/`or3` = gold colors (from French *or* = gold)
- `noir`/`blanc`/`gris` = black/white/grey
- `mov` = modal overlay, `ms` = modal sheet
- `hi` = history item, `mg` = month group
- `sh` = section header, `fl` = form label, `fi` = form input

CSS variables are defined in `:root`. Use them, do not hardcode colors.

## JavaScript Conventions

- Global state: `CU` (current user), `CLIENTS` (all clients object), `pin` (current PIN input)
- Storage helpers: `save(key, value)` and `load(key, default)` — they auto-prefix with `acs_`
- All monetary values are in Thai Baht (฿), formatted with `fmt(amount)`
- PIN functions (`pk`, `pdel`, `updDots`) are declared early in `<head>` to be available before body parses

## Key Functions

| Function | Description |
|---|---|
| `tryLogin()` | Validates username + 4-digit PIN |
| `initApp()` | Switches from login screen to app, dispatches to `buildAdmin()` or `buildClient()` |
| `buildClient()` | Renders dashboard + history for a client user |
| `buildAdmin()` | Renders admin dashboard with all clients overview |
| `goPage(name)` | Switches active content panel and nav highlight |
| `openDeclaration()` | Opens the monthly expense declaration form (modal) |
| `openAddVilla(mode)` | Opens 3-step villa creation form |
| `openAddClient()` | Opens client creation form (admin only) |
| `fmt(n)` | Formats a number as Thai Baht (e.g. `12 500 ฿`) |
| `showToast(msg)` | Shows a brief overlay notification |
| `save(k, v)` / `load(k, def)` | localStorage wrapper with `acs_` prefix |

## Service Worker (`sw.js`)

Schedules a daily push notification at 19:00 Bangkok time (UTC+7). The main app sends a `SCHEDULE_19H` message with `villaNames` and `userName` after login. A `TEST_NOTIF` message fires immediately for testing.

## UI/UX Notes

- Mobile-first, designed for phone screens (no desktop layout)
- Dark theme: near-black backgrounds, gold accents
- Fonts: **Cormorant Garamond** (headings/numbers) + **DM Sans** (body)
- All user-facing text is in **French**
- The app uses `height:100vh; overflow:hidden` on `body` — do not break this
- Bottom nav is `position:fixed`, content areas have `padding-bottom:5.5rem` to avoid overlap

## External Dependencies (CDN only)

- **jsPDF** (`https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`) — PDF export
- **Google Fonts** — Cormorant Garamond, DM Sans

## Development Workflow

Since there is no build step, development is:
1. Edit `index.html` or `sw.js`
2. Open/refresh `index.html` in a browser
3. Use browser DevTools for debugging
4. Test on mobile viewport (or use DevTools device emulation)

To test push notifications, the app must be served over HTTPS or `localhost` (service workers require a secure context).

## Admin Access

- **Username:** `admin`
- **PIN:** `0000`

Client credentials are managed by the admin through the app UI and persisted in `localStorage`.

## Branch Convention

Development branches follow: `claude/<description>-<session-id>`
