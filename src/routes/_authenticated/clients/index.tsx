import { createFileRoute } from "@tanstack/react-router";
import { Users, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/clients/")({
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <AppShell title="Clientes" subtitle="Gestiona los clientes de tu organización">
      <PageHeader
        eyebrow="Clientes"
        title="Tus clientes"
        description="Personas con evaluaciones y planes nutricionales asociados."
        actions={
          <Button className="rounded-full">
            <Plus className="h-4 w-4" /> Nuevo cliente
          </Button>
        }
      />
      <EmptyState
        icon={<Users className="h-5 w-5" />}
        title="Aún no hay clientes"
        description="Conecta la Plataforma 1 (InBody) o añade clientes manualmente para empezar a generar planes."
      />
    </AppShell>
  );
}
