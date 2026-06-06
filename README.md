# Wealth Manager Desktop — Split Demos

Two standalone apps rebuilt from `built-wealth-standalone.html`:

| App | Folder | Stack | Purpose |
|-----|--------|-------|---------|
| **FDC3 (new)** | `wealth-fdc3-react/` | React 18 + Vite + Tailwind | Panels share context via in-browser FDC3 agent |
| **Legacy (old)** | `wealth-legacy-angular/` | Angular 19 standalone + Tailwind | Siloed panels — 9 independent dropdowns |

## Run locally (side by side)

**Terminal 1 — React + FDC3**
```bash
cd wealth-fdc3-react
npm install
npm run dev
```
Default: http://localhost:5173

**Terminal 2 — Angular Legacy**
```bash
cd wealth-legacy-angular
npm install
npm start
```
Default: http://localhost:4200

## Production build

```bash
cd wealth-fdc3-react && npm run build    # → dist/
cd wealth-legacy-angular && npm run build  # → dist/wealth-legacy-angular/
```

## Demo script

See `FDC3 DEMO-PLAYBOOK.pdf` — use **Desktop 2 (Wealth Manager)** steps. Open both apps side by side to compare FDC3 vs legacy friction.
