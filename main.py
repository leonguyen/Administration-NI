"""TailAdmin dashboard rebuilt with NiceGUI (Python).

Replaces the original React + TypeScript (TanStack Start / Vite) frontend.
Run locally:            uv run python main.py
Run in production/Docker: python main.py   (honors $PORT, binds 0.0.0.0)
"""
import os

from nicegui import ui

import dashboard
import menu
from theme import GLOBAL_CSS


def _shared_setup(title: str) -> None:
    """Per-client global styling + head tags (NiceGUI 4 forbids global-scope UI)."""
    ui.add_css(GLOBAL_CSS)
    ui.colors(primary="#6d5efc")  # fallback; real palette comes from CSS tokens
    ui.add_head_html(
        f"<title>{title}</title>"
        '<meta name="description" content="TailAdmin dashboard built with NiceGUI">'
    )


@ui.page("/")
def index():
    _shared_setup("TailAdmin — Dashboard")
    dashboard.build()


@ui.page("/menu")
def menu_route():
    _shared_setup("Menu — TailAdmin")
    menu.menu_page()


if __name__ in {"__main__", "__mp_main__"}:
    # In production (Render/Docker) reload and browser auto-open are disabled and
    # the server binds to 0.0.0.0 on the port provided by the platform ($PORT).
    in_container = bool(os.environ.get("PORT")) or os.path.exists("/.dockerenv")
    port = int(os.environ.get("PORT", "8080"))
    ui.run(
        title="TailAdmin",
        favicon="🧩",
        dark=None,  # theme handled by CSS tokens + header toggle
        reload=not in_container,
        port=port,
        host="0.0.0.0",
        show=not in_container,
    )