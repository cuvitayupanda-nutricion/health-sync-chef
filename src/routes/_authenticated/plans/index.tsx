import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Disclaimer } from "@/components/shared/Disclaimer";

export const Route = createFileRoute("/_authenticated/plans/")({
  component: PlansPage,
});

function PlansPage() {
  return (
    <AppShell title="Planes" subtitle="Planes alimentarios generados">
      <PageHeader
        eyebrow="Biblioteca"
        title="Planes alimentarios"
        description="Aquí verás todos los planes generados por el Nutrition Engine."
      />
      <EmptyState
        icon={<ClipboardList className="h-5 w-5" />}
        title="Sin planes todavía"
        description="Los planes aparecerán aquí en cuanto un cliente reciba una evaluación."
      />
      <div className="mt-8">
        <Disclaimer variant="card" />
      </div>
    </AppShell>
  );
}
