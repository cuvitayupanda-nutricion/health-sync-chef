import { createFileRoute } from "@tanstack/react-router";
import { Users, ClipboardList, Target, TrendingUp, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatTile } from "@/components/shared/StatTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Vista general de tu organización"
      actions={
        <Button className="rounded-full" size="sm">
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </Button>
      }
    >
      <PageHeader
        eyebrow="Resumen"
        title="Hola de nuevo."
        description="Un vistazo rápido al pulso nutricional de tu organización."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Clientes activos" value="—" hint="Últimos 30 días" icon={<Users className="h-4 w-4" />} />
        <StatTile label="Planes generados" value="—" hint="Este mes" icon={<ClipboardList className="h-4 w-4" />} accent="primary" />
        <StatTile label="Objetivo más frecuente" value="—" hint="Distribución global" icon={<Target className="h-4 w-4" />} />
        <StatTile label="Crecimiento" value="—" hint="vs. mes anterior" icon={<TrendingUp className="h-4 w-4" />} accent="muted" />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-display text-base font-semibold text-foreground">
              Distribución de objetivos
            </h3>
            <span className="text-xs text-muted-foreground">próximamente</span>
          </div>
          <EmptyState
            title="Aún no hay datos"
            description="Cuando generes planes verás aquí la distribución entre pérdida de grasa, mantenimiento y ganancia muscular."
          />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-display text-base font-semibold text-foreground">
              Últimos clientes
            </h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Ver todos
            </Button>
          </div>
          <EmptyState
            title="Sin clientes registrados"
            description="Los nuevos clientes aparecerán aquí en cuanto se conecten desde InBody o los añadas manualmente."
            action={
              <Button size="sm" variant="outline" className="rounded-full">
                Añadir cliente
              </Button>
            }
          />
        </section>
      </div>

      <div className="mt-8">
        <Disclaimer variant="card" />
      </div>
    </AppShell>
  );
}
