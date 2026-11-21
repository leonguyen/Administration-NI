"""TailAdmin color palette + global CSS, ported from the original styles.css."""

# The exact oklch tokens from the React app's styles.css.
LIGHT_TOKENS = {
    "--background": "oklch(0.985 0.005 250)",
    "--foreground": "oklch(0.22 0.03 260)",
    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.22 0.03 260)",
    "--primary": "oklch(0.58 0.2 265)",
    "--primary-foreground": "oklch(0.99 0 0)",
    "--secondary": "oklch(0.96 0.01 255)",
    "--secondary-foreground": "oklch(0.3 0.03 260)",
    "--muted": "oklch(0.96 0.01 255)",
    "--muted-foreground": "oklch(0.55 0.02 260)",
    "--accent": "oklch(0.94 0.02 260)",
    "--accent-foreground": "oklch(0.3 0.03 260)",
    "--border": "oklch(0.92 0.01 255)",
    "--destructive": "oklch(0.577 0.245 27.325)",
    "--success": "oklch(0.72 0.16 155)",
    "--success-foreground": "oklch(0.25 0.08 155)",
    "--success-bg": "oklch(0.95 0.05 155)",
    "--danger": "oklch(0.63 0.22 20)",
    "--danger-bg": "oklch(0.96 0.04 20)",
}

DARK_TOKENS = {
    "--background": "oklch(0.129 0.042 264.695)",
    "--foreground": "oklch(0.984 0.003 247.858)",
    "--card": "oklch(0.208 0.042 265.755)",
    "--card-foreground": "oklch(0.984 0.003 247.858)",
    "--primary": "oklch(0.929 0.013 255.508)",
    "--primary-foreground": "oklch(0.208 0.042 265.755)",
    "--secondary": "oklch(0.279 0.041 260.031)",
    "--secondary-foreground": "oklch(0.984 0.003 247.858)",
    "--muted": "oklch(0.279 0.041 260.031)",
    "--muted-foreground": "oklch(0.704 0.04 256.788)",
    "--accent": "oklch(0.279 0.041 260.031)",
    "--accent-foreground": "oklch(0.984 0.003 247.858)",
    "--border": "oklch(1 0 0 / 10%)",
    "--destructive": "oklch(0.704 0.191 22.216)",
    "--success": "oklch(0.696 0.17 162.48)",
    "--success-foreground": "oklch(0.984 0.003 247.858)",
    "--success-bg": "oklch(0.30 0.08 155)",
    "--danger": "oklch(0.704 0.191 22.216)",
    "--danger-bg": "oklch(0.30 0.08 20)",
}

GLOBAL_CSS = """
:root {
  --radius: 0.75rem;
  %(light)s
}
body.dark {
  %(dark)s
}
body {
  background-color: var(--background) !important;
  color: var(--foreground);
}

/* Card surface used across the dashboard */
.ta-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 1rem;
  color: var(--card-foreground);
}
.ta-muted { color: var(--muted-foreground); }

/* Sidebar nav links */
.ta-nav-item {
  display: flex; align-items: center; gap: .75rem;
  width: 100%%; padding: .625rem .75rem; border-radius: .5rem;
  font-size: .875rem; font-weight: 500; color: var(--foreground);
  background: transparent; border: none; cursor: pointer; text-decoration: none;
  transition: background .15s, color .15s;
}
.ta-nav-item:hover { background: var(--accent); }
.ta-nav-item.active {
  background: color-mix(in oklab, var(--primary) 12%%, transparent);
  color: var(--primary);
}

/* Primary button */
.ta-btn-primary {
  background: var(--primary); color: var(--primary-foreground);
  border-radius: .5rem; padding: .5rem 1rem; font-size: .875rem; font-weight: 500;
  border: none; cursor: pointer;
}
.ta-btn-primary:hover { filter: brightness(.95); }

.ta-btn-ghost {
  background: transparent; color: var(--foreground);
  border: 1px solid var(--border); border-radius: .5rem;
  padding: .5rem 1rem; font-size: .875rem; font-weight: 500; cursor: pointer;
}
.ta-btn-ghost:hover { background: var(--accent); }

/* Inputs */
.ta-input {
  height: 2.5rem; width: 100%%; border-radius: .5rem;
  border: 1px solid var(--border); background: var(--background);
  padding: 0 .75rem; font-size: .875rem; color: var(--foreground); outline: none;
}
.ta-input:focus { border-color: var(--primary); }

/* Table */
.ta-table { width: 100%%; border-collapse: collapse; font-size: .875rem; }
.ta-table thead th {
  background: var(--muted); text-align: left; text-transform: uppercase;
  letter-spacing: .05em; font-size: .75rem; color: var(--muted-foreground);
  padding: .75rem 1.5rem; font-weight: 500;
}
.ta-table tbody td { padding: 1rem 1.5rem; border-top: 1px solid var(--border); }
.ta-table tbody tr:hover { background: var(--accent); }

/* Icon buttons inside tables */
.ta-icon-btn {
  background: transparent; border: none; cursor: pointer;
  padding: .375rem; border-radius: .375rem; font-size: .875rem;
  color: var(--muted-foreground); line-height: 1;
}
.ta-icon-btn:hover { background: var(--accent); color: var(--foreground); }
.ta-icon-btn.danger:hover {
  background: var(--danger-bg); color: var(--danger);
}

/* Badge */
.ta-badge {
  display: inline-flex; align-items: center; gap: .25rem;
  border-radius: 9999px; padding: .125rem .5rem; font-size: .75rem; font-weight: 500;
}
.ta-badge.up { background: var(--success-bg); color: var(--success-foreground); }
.ta-badge.down { background: var(--danger-bg); color: var(--danger); }
""" % {"light": "\n  ".join(f"{k}: {v};" for k, v in LIGHT_TOKENS.items()),
       "dark": "\n  ".join(f"{k}: {v};" for k, v in DARK_TOKENS.items())}