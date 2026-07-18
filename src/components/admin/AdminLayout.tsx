import type { ReactNode } from "react";
import { Apple, BookOpen, UtensilsCrossed, UserCog, Dumbbell, Building2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/admin/foods", label: "Alimentos", icon: Apple },
  { to: "/admin/recipes", label: "Recetas", icon: BookOpen },
  { to: "/admin/menus", label: "Menús", icon: UtensilsCrossed },
  { to: "/admin/users", label: "Usuarios", icon: UserCog },
  { to: "/admin/trainers", label: "Entrenadores", icon: Dumbbell },
  { to: "/admin/gyms", label: "Gimnasios", icon: Building2 },
];

interface AdminLayoutProps {
  title: string;
  description?: string;
  eyebrow?: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyIcon: ReactNode;
}

export function AdminLayout({
  title,
  description,
  eyebrow = "Administración",
  emptyTitle,
  emptyDescription,
  emptyIcon,
}: AdminLayoutProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AppShell title="Panel administrativo" subtitle="Catálogos y gestión">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <nav className="mb-6 flex flex-wrap gap-1.5 rounded-full border border-border bg-card p-1 shadow-soft">
        {tabs.map((t) => {
          const active = pathname === t.to;
          const Icon = t.icon;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </Link>
          );
        })}
      </nav>

      <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
    </AppShell>
  );
}
