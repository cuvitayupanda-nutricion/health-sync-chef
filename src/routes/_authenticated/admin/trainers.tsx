import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_authenticated/admin/trainers")({
  component: () => (
    <AdminLayout
      title="Entrenadores"
      description="Gestión de entrenadores personales asociados a los gimnasios."
      emptyIcon={<Dumbbell className="h-5 w-5" />}
      emptyTitle="Sin entrenadores"
      emptyDescription="Invita a entrenadores para que gestionen sus propios clientes."
    />
  ),
});
