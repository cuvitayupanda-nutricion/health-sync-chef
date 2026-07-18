import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 pb-8 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-xs font-medium tracking-widest text-primary uppercase">{eyebrow}</p>
        )}
        <h2 className="text-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
