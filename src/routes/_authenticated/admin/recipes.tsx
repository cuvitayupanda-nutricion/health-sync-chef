import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_authenticated/admin/recipes")({
  component: () => (
    <AdminLayout
      title="Catálogo de recetas"
      description="Recetas con dificultad, tiempo, costo estimado, imagen, ingredientes, preparación y alérgenos."
      emptyIcon={<BookOpen className="h-5 w-5" />}
      emptyTitle="Sin recetas cargadas"
      emptyDescription="Añadirás recetas desde este panel para alimentar la biblioteca del Nutrition Engine."
    />
  ),
});
