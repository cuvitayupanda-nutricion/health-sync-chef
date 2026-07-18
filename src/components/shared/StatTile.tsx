import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  className?: string;
  accent?: "default" | "primary" | "muted";
}

export function StatTile({ label, value, hint, icon, className, accent = "default" }: StatTileProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-elevated",
        accent === "primary" && "border-primary/20 bg-accent/40",
        accent === "muted" && "bg-muted/50",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        {icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground">
            {icon}
          </span>
        )}
      </div>
      <div className="text-display text-2xl font-semibold text-foreground md:text-3xl">
        {value}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
