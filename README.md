# TailAdmin — NiceGUI

A rebuild of the original TailAdmin dashboard using [NiceGUI](https://nicegui.io)
(Python). The previous React + TypeScript frontend (TanStack Start / Vite / Tailwind /
shadcn) has been removed and replaced by a pure-Python NiceGUI app.

## Screens

- `/` — Ecommerce dashboard: metric cards, monthly-sales bar chart, monthly-target
  radial gauge, and a statistics area/line chart (echarts).
- `/menu` — Menu hierarchy management: searchable CRUD table with add/edit dialog.

Both share a `DashboardLayout` (collapsible sidebar + top header with search, theme
toggle, notifications, and profile chip). Colors come from the original `styles.css`
oklch tokens (see `theme.py`). Data is in-memory mock data (`data.py`).

## Requirements

- Python 3.10+
- [uv](https://docs.astral.sh/uv/) (recommended)

## Run

```bash
uv sync                 # install dependencies (nicegui)
uv run python main.py   # start the app
```

Then open http://localhost:8080

`reload=True` is enabled, so the server restarts automatically when you edit files.

## Structure

```
main.py       # entry point, routes (/ and /menu)
theme.py      # TailAdmin color tokens + global CSS
layout.py     # DashboardLayout: sidebar + header + dark mode
dashboard.py  # EcommerceDashboard page
menu.py       # MenuTable page (CRUD + search + dialog)
data.py       # mock data
```

## Notes

- This was originally a Lovable-connected React project. The TypeScript/React app was
  removed and this NiceGUI app is now the project's application.
- The old Supabase config/migrations are left in `supabase/` but are not used by the
  NiceGUI app (data is mock/in-memory).