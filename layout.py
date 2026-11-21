"""DashboardLayout: sidebar navigation + top header + dark-mode toggle.

Mirrors src/components/tailadmin/DashboardLayout.tsx.
"""
from nicegui import ui

NAV_SECTIONS = [
    ("Menu", [
        ("Dashboard", ["Ecommerce"], "/"),
        ("Calendar", [], None),
        ("User Profile", [], None),
        ("Forms", ["Form Elements"], None),
        ("Tables", ["Basic Tables"], None),
        ("Menu", ["Menu Hierarchy"], "/menu"),
        ("Pages", ["Blank Page", "404 Error"], None),
    ]),
    ("Others", [
        ("Charts", ["Line Chart", "Bar Chart"], None),
        ("UI Elements", ["Alerts", "Buttons", "Badge"], None),
        ("Authentication", ["Sign In", "Sign Up"], None),
    ]),
]


def _nav_button(label, active, route):
    cls = "ta-nav-item active" if active else "ta-nav-item"
    btn = ui.button(label, on_click=(lambda: ui.navigate.to(route)) if route else None)
    btn.classes(cls)
    btn.props("flat dense no-caps align=left")
    return btn


def _sidebar_section(title, items, active_label):
    with ui.column().classes("w-full gap-1 mb-6"):
        ui.label(title.upper()).classes(
            "text-xs font-semibold tracking-wider px-3 mb-1"
        ).style("color: var(--muted-foreground)")
        for label, children, route in items:
            active = label == active_label
            has_children = bool(children)
            with ui.element("div").classes("w-full"):
                with ui.row().classes("items-center w-full no-wrap"):
                    _nav_button(label, active, route).classes("flex-grow")
                    if has_children:
                        ui.icon("expand_more").classes("text-sm").style(
                            "color: var(--muted-foreground)"
                        )
                if has_children:
                    # Always render children so the expand affordance is visible.
                    with ui.column().classes("w-full pl-11 gap-1 mt-1"):
                        for child in children:
                            link = ui.link(child, "#").classes(
                                "text-sm px-3 py-2 rounded"
                            ).style("color: var(--muted-foreground); text-decoration:none")
                            link.classes("hover:opacity-80")


def dashboard_layout(active_label, content_builder):
    """Build header + sidebar, then render page content via content_builder()."""
    dark = ui.dark_mode()

    # Header
    with ui.header().classes(
        "items-center justify-between px-4 lg:px-6"
    ).style("background: color-mix(in oklab, var(--card) 85%, transparent); "
           "border-bottom: 1px solid var(--border); height: 4rem"):
        with ui.row().classes("items-center gap-3 w-full no-wrap"):
            ui.button(icon="menu", on_click=lambda: left_drawer.toggle()).props(
                "flat dense round"
            ).style("color: var(--foreground)")
            # Search box
            with ui.element("div").classes("relative hidden md:block flex-1").style(
                "max-width: 28rem"
            ):
                ui.icon("search").classes("absolute left-3 top-1/2").style(
                    "transform: translateY(-50%); color: var(--muted-foreground); z-index: 1"
                )
                ui.input(placeholder="Search or type command...").props(
                    "borderless dense"
                ).classes("ta-input").style("padding-left: 2.5rem")
            with ui.row().classes("items-center gap-2 ml-auto no-wrap"):
                # Theme toggle
                def toggle_theme():
                    dark.toggle()
                    theme_btn.name = "light_mode" if dark.value else "dark_mode"
                theme_btn = ui.button(
                    icon="light_mode" if dark.value else "dark_mode",
                    on_click=toggle_theme,
                ).props("flat round").style("color: var(--foreground)")
                # Notifications
                with ui.element("div").classes("relative"):
                    ui.button(icon="notifications").props("flat round dense").style(
                        "color: var(--foreground)"
                    )
                    ui.element("div").classes("w-2 h-2 rounded-full").style(
                        "background: var(--primary); position:absolute; top:6px; right:6px"
                    )
                # Profile chip
                with ui.row().classes(
                    "items-center gap-2 rounded-full pl-1 pr-3"
                ).style("border: 1px solid var(--border)"):
                    with ui.element("div").classes(
                        "flex items-center justify-center rounded-full text-sm font-semibold"
                    ).style(
                        "width:2rem;height:2rem;background: color-mix(in oklab, var(--primary) 20%, transparent); color: var(--primary)"
                    ):
                        ui.label("M").classes("text-sm font-semibold")
                    ui.label("Musharof").classes("hidden sm:block text-sm font-medium")
                    ui.icon("expand_more").classes("text-sm").style(
                        "color: var(--muted-foreground)"
                    )

    # Sidebar
    with ui.left_drawer(value=True).classes(
        "gap-0"
    ).style("background: var(--card); border-right: 1px solid var(--border); width: 18rem") as left_drawer:
        with ui.row().classes("items-center gap-2 px-6").style("height: 4rem"):
            ui.element("div").classes(
                "flex items-center justify-center rounded-lg"
            ).style(
                "width:2.25rem;height:2.25rem;background: var(--primary); color: var(--primary-foreground)"
            )
            ui.label("TailAdmin").classes("text-lg font-semibold")
        with ui.column().classes("w-full px-4 py-4 overflow-y-auto"):
            for title, items in NAV_SECTIONS:
                _sidebar_section(title, items, active_label)

    # Page content
    with ui.column().classes("w-full p-4 lg:p-6").style("padding-left: 0"):
        content_builder()