import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, Search, ChevronRight } from "lucide-react";

type MenuRow = {
  id: string;
  hierarchyName: string;
  signInUrl: string;
  managementUrl: string;
  depth: number;
};

const initialRows: MenuRow[] = [
  { id: "1", hierarchyName: "Dashboard", signInUrl: "/signin", managementUrl: "/admin/dashboard", depth: 0 },
  { id: "2", hierarchyName: "Dashboard / Ecommerce", signInUrl: "/signin", managementUrl: "/admin/dashboard/ecommerce", depth: 1 },
  { id: "3", hierarchyName: "Dashboard / Analytics", signInUrl: "/signin", managementUrl: "/admin/dashboard/analytics", depth: 1 },
  { id: "4", hierarchyName: "Users", signInUrl: "/signin", managementUrl: "/admin/users", depth: 0 },
  { id: "5", hierarchyName: "Users / Profile", signInUrl: "/signin", managementUrl: "/admin/users/profile", depth: 1 },
  { id: "6", hierarchyName: "Users / Roles", signInUrl: "/signin", managementUrl: "/admin/users/roles", depth: 1 },
  { id: "7", hierarchyName: "Settings", signInUrl: "/signin", managementUrl: "/admin/settings", depth: 0 },
  { id: "8", hierarchyName: "Settings / Billing", signInUrl: "/signin", managementUrl: "/admin/settings/billing", depth: 1 },
];

export function MenuTable() {
  const [rows, setRows] = useState<MenuRow[]>(initialRows);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<MenuRow | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.hierarchyName.toLowerCase().includes(q) ||
        r.signInUrl.toLowerCase().includes(q) ||
        r.managementUrl.toLowerCase().includes(q),
    );
  }, [rows, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Menu</h1>
          <p className="text-sm text-muted-foreground">Manage menu hierarchy and route mapping.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Menu
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Hierarchy Name</th>
                <th className="px-6 py-3 font-medium">Sign in Url</th>
                <th className="px-6 py-3 font-medium">Management Url</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-accent/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center" style={{ paddingLeft: row.depth * 20 }}>
                      {row.depth > 0 && <ChevronRight className="mr-2 h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium">{row.hierarchyName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{row.signInUrl}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{row.managementUrl}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditing(row)}
                        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}
                        className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No menu items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(editing || creating) && (
        <MenuDialog
          row={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={(row) => {
            setRows((rs) => {
              const exists = rs.find((r) => r.id === row.id);
              return exists ? rs.map((r) => (r.id === row.id ? row : r)) : [...rs, row];
            });
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </div>
  );
}

function MenuDialog({
  row,
  onClose,
  onSave,
}: {
  row: MenuRow | null;
  onClose: () => void;
  onSave: (row: MenuRow) => void;
}) {
  const [form, setForm] = useState<MenuRow>(
    row ?? { id: crypto.randomUUID(), hierarchyName: "", signInUrl: "", managementUrl: "", depth: 0 },
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{row ? "Edit Menu" : "Add Menu"}</h2>
        <div className="mt-4 space-y-4">
          <Field
            label="Hierarchy Name"
            value={form.hierarchyName}
            onChange={(v) => setForm({ ...form, hierarchyName: v })}
            placeholder="e.g. Users / Profile"
          />
          <Field
            label="Sign in Url"
            value={form.signInUrl}
            onChange={(v) => setForm({ ...form, signInUrl: v })}
            placeholder="/signin"
          />
          <Field
            label="Management Url"
            value={form.managementUrl}
            onChange={(v) => setForm({ ...form, managementUrl: v })}
            placeholder="/admin/..."
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave({ ...form, depth: (form.hierarchyName.match(/\//g) ?? []).length })}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}