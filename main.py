"""TailAdmin dashboard rebuilt with NiceGUI (Python).

Replaces the original React + TypeScript (TanStack Start / Vite) frontend.
Run with:  uv run python main.py   (or: uv run nicegui main.py)
"""
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
    ui.run(
        title="TailAdmin",
        favicon="🧩",
        dark=None,  # theme handled by CSS tokens + header toggle
        reload=True,
        port=8080,
        show=True,
    )