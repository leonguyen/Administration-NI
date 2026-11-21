import {
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Calendar as CalIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { useState } from "react";

const monthlySales = [
  { m: "Jan", v: 168 }, { m: "Feb", v: 385 }, { m: "Mar", v: 201 },
  { m: "Apr", v: 298 }, { m: "May", v: 187 }, { m: "Jun", v: 195 },
  { m: "Jul", v: 291 }, { m: "Aug", v: 110 }, { m: "Sep", v: 215 },
  { m: "Oct", v: 390 }, { m: "Nov", v: 280 }, { m: "Dec", v: 112 },
];

const stats = [
  { m: "Jan", sales: 180, revenue: 40 },
  { m: "Feb", sales: 190, revenue: 30 },
  { m: "Mar", sales: 170, revenue: 50 },
  { m: "Apr", sales: 175, revenue: 45 },
  { m: "May", sales: 160, revenue: 80 },
  { m: "Jun", sales: 172, revenue: 95 },
  { m: "Jul", sales: 170, revenue: 100 },
  { m: "Aug", sales: 200, revenue: 120 },
  { m: "Sep", sales: 225, revenue: 135 },
  { m: "Oct", sales: 240, revenue: 150 },
  { m: "Nov", sales: 235, revenue: 155 },
  { m: "Dec", sales: 230, revenue: 140 },
];

function Metric({
  icon: Icon,
  label,
  value,
  delta,
  up,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta: string;
  up: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
        <Icon className="h-6 w-6 text-foreground/70" />
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
            up
              ? "bg-[var(--success-bg)] text-[var(--success-foreground)]"
              : "bg-[var(--danger-bg)] text-[var(--danger)]"
          }`}
        >
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta}
        </span>
      </div>
    </div>
  );
}

function MonthlyTarget() {
  const data = [{ name: "target", value: 75.55, fill: "var(--primary)" }];
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-start justify-between p-6 pb-0">
        <div>
          <h3 className="text-base font-semibold">Monthly Target</h3>
          <p className="mt-1 text-sm text-muted-foreground">Target you've set for each month</p>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div className="relative mx-auto h-56 w-full max-w-[280px]">
        <ResponsiveContainer>
          <RadialBarChart
            innerRadius="80%"
            outerRadius="100%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: "var(--secondary)" }} dataKey="value" cornerRadius={20} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-3xl font-bold">75.55%</span>
          <span className="mt-1 rounded-full bg-[var(--success-bg)] px-2 py-0.5 text-xs font-medium text-[var(--success-foreground)]">
            +10%
          </span>
        </div>
      </div>
      <p className="px-6 pb-4 text-center text-sm text-muted-foreground">
        You earn <span className="font-semibold text-foreground">$3287</span> today, it's higher than last month. Keep up your good work!
      </p>
      <div className="grid grid-cols-3 gap-2 border-t border-border p-4 text-center">
        {[
          { l: "Target", v: "$20K", up: false },
          { l: "Revenue", v: "$20K", up: true },
          { l: "Today", v: "$20K", up: true },
        ].map((s) => (
          <div key={s.l}>
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm font-semibold">
              {s.v}
              {s.up ? (
                <ArrowUpRight className="h-3 w-3 text-[var(--success-foreground)]" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-[var(--danger)]" />
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlySales() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Monthly Sales</h3>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <BarChart data={monthlySales} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip cursor={{ fill: "var(--secondary)" }} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
            <Bar dataKey="v" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Statistics() {
  const [range, setRange] = useState<"Monthly" | "Quarterly" | "Annually">("Monthly");
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold">Statistics</h3>
          <p className="mt-1 text-sm text-muted-foreground">Target you've set for each month</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-secondary p-1">
            {(["Monthly", "Quarterly", "Annually"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  range === r ? "bg-card text-foreground shadow" : "text-muted-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
            <CalIcon className="h-4 w-4" /> Jun 29 to Jul 05
          </button>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
            <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
            <Area type="monotone" dataKey="sales" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2} />
            <Area type="monotone" dataKey="revenue" stroke="oklch(0.75 0.15 265)" fill="url(#g2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function EcommerceDashboard() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2">
          <Metric icon={Users} label="Customers" value="3,782" delta="11.01%" up />
          <Metric icon={Package} label="Orders" value="5,359" delta="9.05%" up={false} />
          <div className="sm:col-span-2">
            <MonthlySales />
          </div>
        </div>
        <MonthlyTarget />
      </div>
      <Statistics />
    </div>
  );
}