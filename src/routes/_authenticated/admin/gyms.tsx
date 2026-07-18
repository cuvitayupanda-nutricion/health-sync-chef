import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_authenticated/admin/gyms")({
  component: () => (
    <AdminLayout
      title="Gimnasios"
      description="Organizaciones registradas en la plataforma."
      emptyIcon={<Building2 className="h-5 w-5" />}
      emptyTitle="Sin gimnasios registrados"
      emptyDescription="Cada gimnasio es una organización con sus propios entrenadores y clientes."
    />
  ),
});
