import { useState, type ReactNode } from "react";
import {
  LayoutGrid,
  Calendar,
  UserCircle2,
  ClipboardList,
  Table2,
  FileText,
  PieChart,
  Boxes,
  Plug,
  ChevronDown,
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
} from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: string[];
  active?: boolean;
  activeChild?: string;
};

const menu: NavItem[] = [
  { label: "Dashboard", icon: LayoutGrid, children: ["Ecommerce"], active: true, activeChild: "Ecommerce" },
  { label: "Calendar", icon: Calendar },
  { label: "User Profile", icon: UserCircle2 },
  { label: "Forms", icon: ClipboardList, children: ["Form Elements"] },
  { label: "Tables", icon: Table2, children: ["Basic Tables"] },
  { label: "Pages", icon: FileText, children: ["Blank Page", "404 Error"] },
];

const others: NavItem[] = [
  { label: "Charts", icon: PieChart, children: ["Line Chart", "Bar Chart"] },
  { label: "UI Elements", icon: Boxes, children: ["Alerts", "Buttons", "Badge"] },
  { label: "Authentication", icon: Plug, children: ["Sign In", "Sign Up"] },
];

function SidebarSection({ title, items }: { title: string; items: NavItem[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.filter((i) => i.active).map((i) => [i.label, true])),
  );
  return (
    <div className="mb-6">
      <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <ul className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isOpen = open[item.label];
          const hasChildren = !!item.children?.length;
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => hasChildren && setOpen((s) => ({ ...s, [item.label]: !s[item.label] }))}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  {item.label}
                </span>
                {hasChildren && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                )}
              </button>
              {hasChildren && isOpen && (
                <ul className="mt-1 space-y-1 pl-11">
                  {item.children!.map((child) => (
                    <li key={child}>
                      <a
                        href="#"
                        className={`block rounded-md px-3 py-2 text-sm transition ${
                          item.activeChild === child
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground/60 hover:text-foreground"
                        }`}
                      >
                        {child}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  return (
    <div className={`${dark ? "dark" : ""} min-h-screen bg-background text-foreground`}>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">TailAdmin</span>
        </div>
        <nav className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-4">
          <SidebarSection title="Menu" items={menu} />
          <SidebarSection title="Others" items={others} />
          <div className="mt-6 rounded-xl bg-secondary p-5 text-center">
            <p className="text-sm font-semibold">#1 Tailwind CSS Dashboard</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Leading Tailwind CSS Admin Template with 400+ UI Components and Pages.
            </p>
            <button className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Purchase Plan
            </button>
          </div>
        </nav>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:px-6">
          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="hidden h-10 w-10 items-center justify-center rounded-lg border border-border lg:flex"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative hidden flex-1 max-w-md md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search or type command..."
              className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-16 text-sm outline-none focus:border-primary"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setDark((d) => !d)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                M
              </div>
              <span className="hidden text-sm font-medium sm:inline">Musharof</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}