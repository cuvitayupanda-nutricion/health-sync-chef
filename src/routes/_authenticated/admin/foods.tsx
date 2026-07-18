import { createFileRoute } from "@tanstack/react-router";
import { Apple } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_authenticated/admin/foods")({
  component: () => (
    <AdminLayout
      title="Catálogo de alimentos"
      description="Biblioteca de alimentos con múltiples fuentes: USDA, FAO, LATINFOODS, BEDCA, Tabla del Ecuador y marcas comerciales."
      emptyIcon={<Apple className="h-5 w-5" />}
      emptyTitle="Catálogo vacío"
      emptyDescription="La importación de fuentes se habilitará en un paso posterior. La arquitectura ya soporta múltiples orígenes."
    />
  ),
});
