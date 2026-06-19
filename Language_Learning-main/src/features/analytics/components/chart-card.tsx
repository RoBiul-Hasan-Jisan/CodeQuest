"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Extra height class, default is h-[260px] for the chart area */
  chartHeight?: string;
}

export function ChartCard({
  title,
  subtitle,
  badge,
  action,
  children,
  className,
  chartHeight = "h-[260px]",
}: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {/* Chart area */}
      <div className={cn("w-full", chartHeight)}>{children}</div>
    </motion.div>
  );
}
