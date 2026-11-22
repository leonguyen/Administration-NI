"""Ecommerce dashboard page: metric cards + bar/radial/area charts.

Mirrors src/components/tailadmin/EcommerceDashboard.tsx.
"""
from nicegui import ui

import data
from layout import dashboard_layout


def _metric(icon, label, value, delta, up):
    with ui.card().classes("w-full").style(
        "border-radius:1rem; border:1px solid var(--border); background:var(--card)"
    ):
        with ui.element("div").classes(
            "flex items-center justify-center rounded-xl"
        ).style(
            "width:3rem;height:3rem;background:var(--secondary)"
        ):
            ui.icon(icon).classes("text-2xl").style("color: var(--foreground)")
        with ui.row().classes("items-end justify-between mt-5 w-full no-wrap"):
            with ui.column().classes("gap-0"):
                ui.label(label).classes("text-sm").style("color: var(--muted-foreground)")
                ui.label(value).classes("text-2xl font-bold tracking-tight")
            badge = "up" if up else "down"
            arrow = "arrow_upward" if up else "arrow_downward"
            with ui.element("span").classes(f"ta-badge {badge}"):
                ui.icon(arrow).classes("text-xs")
                ui.label(delta)


def _monthly_target():
    with ui.card().classes("w-full").style(
        "border-radius:1rem; border:1px solid var(--border); background:var(--card)"
    ):
        with ui.row().classes("items-start justify-between w-full no-wrap"):
            with ui.column().classes("gap-0"):
                ui.label("Monthly Target").classes("text-base font-semibold")
                ui.label("Target you've set for each month").classes("text-sm").style(
                    "color: var(--muted-foreground)"
                )
            ui.button(icon="more_horiz").props("flat dense round").style(
                "color: var(--muted-foreground)"
            )
        # Radial gauge via echart gauge
        gauge = ui.echart({
            "series": [{
                "type": "gauge",
                "startAngle": 180,
                "endAngle": 0,
                "min": 0,
                "max": 100,
                "radius": "100%",
                "progress": {"show": True, "width": 18, "roundCap": True,
                             "itemStyle": {"color": "var(--primary)"}},
                "axisLine": {"lineStyle": {"width": 18,
                             "color": [[1, "var(--secondary)"]]}},
                "pointer": {"show": False},
                "axisTick": {"show": False},
                "splitLine": {"show": False},
                "axisLabel": {"show": False},
                "detail": {
                    "valueAnimation": True,
                    "offsetCenter": [0, "-10%"],
                    "fontSize": 28, "fontWeight": "bold",
                    "formatter": "{value}%",
                    "color": "var(--foreground)",
                },
                "title": {"show": True, "offsetCenter": [0, "25%"],
                          "fontSize": 12, "color": "var(--success-foreground)"},
                "data": [{"value": 75.55, "name": "+10%"}],
            }],
        }).classes("w-full").style("height: 14rem")
        ui.label("You earn $3287 today, it's higher than last month. "
                 "Keep up your good work!").classes(
            "text-sm text-center px-6 pb-4"
        ).style("color: var(--muted-foreground)")
        with ui.row().classes("w-full text-center").style(
            "border-top:1px solid var(--border)"
        ):
            for i, (lbl, val, up) in enumerate([
                ("Target", "$20K", False),
                ("Revenue", "$20K", True),
                ("Today", "$20K", True),
            ]):
                with ui.column().classes("flex-1 items-center py-4 gap-0"):
                    ui.label(lbl).classes("text-xs").style("color: var(--muted-foreground)")
                    with ui.row().classes("items-center justify-center gap-1"):
                        ui.label(val).classes("text-sm font-semibold")
                        ui.icon("arrow_upward" if up else "arrow_downward").classes(
                            "text-xs"
                        ).style("color: var(--success-foreground)" if up
                                else "color: var(--danger)")


def _monthly_sales():
    with ui.card().classes("w-full").style(
        "border-radius:1rem; border:1px solid var(--border); background:var(--card)"
    ):
        with ui.row().classes("items-center justify-between w-full mb-2 no-wrap"):
            ui.label("Monthly Sales").classes("text-base font-semibold")
            ui.button(icon="more_horiz").props("flat dense round").style(
                "color: var(--muted-foreground)"
            )
        ui.echart({
            "grid": {"top": 10, "right": 0, "left": 0, "bottom": 0,
                     "containLabel": True},
            "tooltip": {"trigger": "axis"},
            "xAxis": {
                "type": "category",
                "data": [d["m"] for d in data.MONTHLY_SALES],
                "axisLine": {"lineStyle": {"color": "var(--border)"}},
                "axisTick": {"show": False},
                "axisLabel": {"color": "var(--muted-foreground)"},
            },
            "yAxis": {
                "type": "value",
                "axisLine": {"show": False},
                "axisTick": {"show": False},
                "splitLine": {"lineStyle": {"color": "var(--border)",
                                            "type": "dashed"}},
                "axisLabel": {"color": "var(--muted-foreground)"},
            },
            "series": [{
                "type": "bar",
                "data": [d["v"] for d in data.MONTHLY_SALES],
                "itemStyle": {"color": "var(--primary)", "borderRadius": [6, 6, 0, 0]},
                "barMaxWidth": 28,
            }],
        }).classes("w-full").style("height: 16rem")


def _statistics():
    with ui.card().classes("w-full").style(
        "border-radius:1rem; border:1px solid var(--border); background:var(--card)"
    ):
        with ui.row().classes("items-start justify-between w-full mb-6 no-wrap"):
            with ui.column().classes("gap-0"):
                ui.label("Statistics").classes("text-base font-semibold")
                ui.label("Target you've set for each month").classes("text-sm").style(
                    "color: var(--muted-foreground)"
                )
            with ui.row().classes("items-center gap-3 no-wrap"):
                with ui.element("div").classes("flex rounded-lg p-1").style(
                    "background: var(--secondary)"
                ):
                    ui.select(["Monthly", "Quarterly", "Annually"],
                              value="Monthly").props("borderless dense").classes(
                        "w-32"
                    )
                with ui.row().classes("items-center gap-2").style(
                    "border:1px solid var(--border); border-radius:.5rem; padding:.5rem .75rem"
                ):
                    ui.icon("calendar_today").classes("text-base")
                    ui.label("Jun 29 to Jul 05").classes("text-sm")
        ui.echart({
            "grid": {"top": 10, "right": 10, "left": 0, "bottom": 0,
                     "containLabel": True},
            "tooltip": {"trigger": "axis"},
            "xAxis": {
                "type": "category",
                "boundaryGap": False,
                "data": [d["m"] for d in data.STATISTICS],
                "axisLine": {"lineStyle": {"color": "var(--border)"}},
                "axisTick": {"show": False},
                "axisLabel": {"color": "var(--muted-foreground)"},
            },
            "yAxis": {
                "type": "value",
                "axisLine": {"show": False},
                "axisTick": {"show": False},
                "splitLine": {"lineStyle": {"color": "var(--border)",
                                            "type": "dashed"}},
                "axisLabel": {"color": "var(--muted-foreground)"},
            },
            "series": [
                {
                    "name": "Sales", "type": "line", "smooth": True,
                    "data": [d["sales"] for d in data.STATISTICS],
                    "lineStyle": {"color": "var(--primary)", "width": 2},
                    "itemStyle": {"color": "var(--primary)"},
                    "areaStyle": {"color": "var(--primary)", "opacity": 0.15},
                },
                {
                    "name": "Revenue", "type": "line", "smooth": True,
                    "data": [d["revenue"] for d in data.STATISTICS],
                    "lineStyle": {"color": "oklch(0.75 0.15 265)", "width": 2},
                    "itemStyle": {"color": "oklch(0.75 0.15 265)"},
                    "areaStyle": {"color": "oklch(0.75 0.15 265)", "opacity": 0.1},
                },
            ],
        }).classes("w-full").style("height: 18rem")


def ecommerce_dashboard():
    with ui.column().classes("w-full gap-6").style("max-width: 1400px"):
        with ui.grid().classes("w-full gap-6 grid-cols-1 lg:grid-cols-3"):
            with ui.column().classes("gap-6 lg:col-span-2"):
                with ui.grid().classes("w-full gap-6 grid-cols-1 sm:grid-cols-2"):
                    _metric("group", "Customers", "3,782", "11.01%", True)
                    _metric("inventory_2", "Orders", "5,359", "9.05%", False)
                with ui.element("div").classes("sm:col-span-2"):
                    _monthly_sales()
            _monthly_target()
        _statistics()


def build():
    dashboard_layout("Dashboard", ecommerce_dashboard)