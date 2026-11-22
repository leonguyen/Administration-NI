"""Menu hierarchy management: searchable CRUD table + add/edit dialog.

Mirrors src/components/tailadmin/MenuTable.tsx.
"""
import uuid

from nicegui import ui

import data
from layout import dashboard_layout


class MenuStore:
    """In-memory store standing in for the original React useState data."""

    def __init__(self):
        self.rows = [dict(r) for r in data.MENU_ROWS]


def _menu_dialog(row, on_save, on_close):
    editing = row is not None
    form = dict(row) if row else {
        "id": str(uuid.uuid4()),
        "hierarchyName": "",
        "signInUrl": "",
        "managementUrl": "",
        "depth": 0,
    }

    with ui.dialog() as dialog, ui.card().classes("w-full").style(
        "max-width:32rem; border-radius:1rem; background:var(--card)"
    ):
        ui.label("Edit Menu" if editing else "Add Menu").classes("text-lg font-semibold")

        name_input = ui.input(
            label="Hierarchy Name", value=form["hierarchyName"],
            placeholder="e.g. Users / Profile",
        ).classes("w-full").props("outlined dense")
        signin_input = ui.input(
            label="Sign in Url", value=form["signInUrl"], placeholder="/signin",
        ).classes("w-full").props("outlined dense")
        mgmt_input = ui.input(
            label="Management Url", value=form["managementUrl"],
            placeholder="/admin/...",
        ).classes("w-full").props("outlined dense")

        def _save():
            saved = {
                "id": form["id"],
                "hierarchyName": name_input.value or "",
                "signInUrl": signin_input.value or "",
                "managementUrl": mgmt_input.value or "",
                "depth": (name_input.value or "").count("/"),
            }
            on_save(saved)
            dialog.close()

        with ui.row().classes("justify-end gap-2 w-full mt-4 no-wrap"):
            ui.button("Cancel", on_click=lambda: (on_close(), dialog.close())).props(
                "flat dense"
            ).classes("ta-btn-ghost")
            ui.button("Save", on_click=_save).classes("ta-btn-primary")

    return dialog


def menu_page():
    store = MenuStore()

    def content():
        with ui.column().classes("w-full gap-6"):
            # Header row
            with ui.row().classes("items-center justify-between w-full no-wrap"):
                with ui.column().classes("gap-0"):
                    ui.label("Menu").classes("text-2xl font-semibold")
                    ui.label("Manage menu hierarchy and route mapping.").classes(
                        "text-sm"
                    ).style("color: var(--muted-foreground)")
                ui.button("Add Menu", icon="add", on_click=lambda: _open(None)).classes(
                    "ta-btn-primary"
                )

            # Table card
            with ui.card().classes("w-full").style(
                "border-radius:1rem; border:1px solid var(--border); background:var(--card)"
            ):
                with ui.row().classes("items-center justify-between w-full").style(
                    "border-bottom:1px solid var(--border)"
                ):
                    search = ui.input(placeholder="Search menu...").props(
                        "outlined dense"
                    ).classes("w-full").style("max-width:24rem")
                    count_label = ui.label().classes("text-sm").style(
                        "color: var(--muted-foreground)"
                    )

                table = ui.table(
                    columns=[
                        {"name": "hierarchyName", "label": "Hierarchy Name",
                         "field": "hierarchyName", "align": "left"},
                        {"name": "signInUrl", "label": "Sign in Url",
                         "field": "signInUrl", "align": "left"},
                        {"name": "managementUrl", "label": "Management Url",
                         "field": "managementUrl", "align": "left"},
                        {"name": "actions", "label": "Actions",
                         "field": "actions", "align": "right"},
                    ],
                    rows=[],
                    row_key="id",
                ).classes("w-full").props("flat separator=cell")

                # Custom cells (HTML in plain cell text is escaped, so use slots).
                table.add_slot("body-cell-hierarchyName", r"""
                    <q-td :props="props">
                        <span class="font-medium"
                              :style="'padding-left:' + (props.row.depth || 0) * 20 + 'px'">
                            <span v-if="props.row.depth > 0" class="ta-muted" style="margin-right:6px">›</span>
                            {{ props.row.hierarchyName }}
                        </span>
                    </q-td>
                """)
                table.add_slot("body-cell-signInUrl", r"""
                    <q-td :props="props">
                        <span style="font-family:monospace;font-size:.75rem;color:var(--muted-foreground)">
                            {{ props.row.signInUrl }}
                        </span>
                    </q-td>
                """)
                table.add_slot("body-cell-managementUrl", r"""
                    <q-td :props="props">
                        <span style="font-family:monospace;font-size:.75rem;color:var(--muted-foreground)">
                            {{ props.row.managementUrl }}
                        </span>
                    </q-td>
                """)
                table.add_slot("body-cell-actions", r"""
                    <q-td :props="props">
                        <div class="flex justify-end gap-2">
                            <button class="ta-icon-btn" @click="$parent.$emit('edit', props.row.id)" title="Edit">✏️</button>
                            <button class="ta-icon-btn danger" @click="$parent.$emit('delete', props.row.id)" title="Delete">🗑️</button>
                        </div>
                    </q-td>
                """)

                def refresh():
                    q = (search.value or "").strip().lower()
                    rows = store.rows
                    if q:
                        rows = [r for r in rows if q in r["hierarchyName"].lower()
                                or q in r["signInUrl"].lower()
                                or q in r["managementUrl"].lower()]
                    count_label.text = f"{len(rows)} items"
                    table.rows = rows

                search.on_value_change(lambda _: refresh())

                def on_edit(row_id):
                    row = next((r for r in store.rows if r["id"] == row_id), None)
                    if row:
                        _open(row)

                def on_delete(row_id):
                    store.rows = [r for r in store.rows if r["id"] != row_id]
                    refresh()

                table.on("edit", lambda e: on_edit(e.args))
                table.on("delete", lambda e: on_delete(e.args))

                def _open(row):
                    def save(saved):
                        existing = any(r["id"] == saved["id"] for r in store.rows)
                        if existing:
                            store.rows = [saved if r["id"] == saved["id"] else r
                                          for r in store.rows]
                        else:
                            store.rows.append(saved)
                        refresh()

                    _menu_dialog(row, save, lambda: None)

                refresh()

    dashboard_layout("Menu", content)