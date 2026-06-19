"use client";

import { BarChart2 } from "lucide-react";

// ─── Design-system palette (hex) ─────────────────────────────────────────────

export const CHART_COLORS = {
  violet:  "#8B5CF6",
  teal:    "#14B8A6",
  green:   "#22C55E",
  amber:   "#F59E0B",
  blue:    "#60A5FA",
  orange:  "#FB923C",
  red:     "#EF4444",
  rose:    "#F43F5E",
  muted:   "#94A3B8",
} as const;

export const TICK_COLOR          = "#94A3B8"; // slate-400
export const GRID_COLOR          = "rgba(148,163,184,0.15)";
export const AREA_FILL_OPACITY   = 0.25;

// ─── Tooltip row ──────────────────────────────────────────────────────────────

export interface TooltipRow {
  label: string;
  value: string | number;
  color: string;
}

// ─── Custom tooltip component props ──────────────────────────────────────────
// We define our own props interface — we do NOT extend Recharts' TooltipProps
// to avoid type conflicts with the library's formatter signatures.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPayload = ReadonlyArray<any>;

interface ChartTooltipProps {
  active?:    boolean;
  payload?:   AnyPayload;
  label?:     string | number;
  formatter?: (name: string, value: number) => TooltipRow;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-lg text-xs">
      {label != null && (
        <p className="mb-1.5 font-semibold text-foreground">{String(label)}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => {
          const name  = String(entry.name  ?? "");
          const value = Number(entry.value ?? 0);
          const row   = formatter
            ? formatter(name, value)
            : { label: name, value: String(entry.value ?? ""), color: String(entry.color ?? TICK_COLOR) };

          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: row.color }}
              />
              <span className="text-muted-foreground">{row.label}:</span>
              <span className="font-semibold text-foreground">{row.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function ChartEmpty({ message = "No data yet — keep practicing!" }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
        <BarChart2 className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <p className="max-w-[200px] text-xs leading-relaxed text-muted-foreground">
        {message}
      </p>
    </div>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDayLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

// ─── Shared tooltip contentStyle (for simpler tooltips) ───────────────────────

export const TOOLTIP_STYLE: React.CSSProperties = {
  background:   "hsl(var(--card))",
  border:       "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize:     11,
  color:        "hsl(var(--foreground))",
  boxShadow:    "0 4px 12px rgba(0,0,0,0.1)",
};
