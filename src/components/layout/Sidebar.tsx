import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Cpu,
  Settings,
  ShieldCheck,
  Apple,
  BookOpen,
  UtensilsCrossed,
  Dumbbell,
  Building2,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand/BrandMark";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const primaryNav: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/plans", label: "Planes", icon: ClipboardList },
  { to: "/nutrition-engine", label: "Nutrition Engine", icon: Cpu },
];

const adminNav: NavItem[] = [
  { to: "/admin/foods", label: "Alimentos", icon: Apple },
  { to: "/admin/recipes", label: "Recetas", icon: BookOpen },
  { to: "/admin/menus", label: "Menús", icon: UtensilsCrossed },
  { to: "/admin/users", label: "Usuarios", icon: UserCog },
  { to: "/admin/trainers", label: "Entrenadores", icon: Dumbbell },
  { to: "/admin/gyms", label: "Gimnasios", icon: Building2 },
];

const footerNav: NavItem[] = [{ to: "/settings", label: "Configuración", icon: Settings }];

function NavGroup({
  label,
  items,
  currentPath,
}: {
  label?: string;
  items: NavItem[];
  currentPath: string;
}) {
  return (
    <div className="space-y-1">
      {label && (
        <p className="px-3 pb-1 text-[0.68rem] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </p>
      )}
      {items.map((item) => {
        const active = currentPath === item.to || currentPath.startsWith(item.to + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-accent text-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0 transition",
                active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center px-5">
        <Link to="/dashboard">
          <BrandMark />
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <NavGroup items={primaryNav} currentPath={pathname} />
        <NavGroup label="Administración" items={adminNav} currentPath={pathname} />
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <NavGroup items={footerNav} currentPath={pathname} />
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/70 px-3 py-2 text-[0.7rem] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span>Uso no clínico. No sustituye a un nutricionista.</span>
        </div>
      </div>
    </aside>
  );
}
