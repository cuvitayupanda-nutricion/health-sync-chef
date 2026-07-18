import { createFileRoute } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_authenticated/admin/menus")({
  component: () => (
    <AdminLayout
      title="Biblioteca de menús por nivel calórico"
      description="Organización por kcal (ej. 2200) con 20 desayunos, 20 almuerzos, 20 meriendas y 20 cenas. El motor combina automáticamente."
      emptyIcon={<UtensilsCrossed className="h-5 w-5" />}
      emptyTitle="Sin menús cargados"
      emptyDescription="Cuando cargues las opciones por comida, el motor podrá generar miles de combinaciones sin repetir."
    />
  ),
});
