import { createFileRoute } from "@tanstack/react-router";
import { UserCog } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: () => (
    <AdminLayout
      title="Usuarios"
      description="Administración de cuentas y roles del ecosistema."
      emptyIcon={<UserCog className="h-5 w-5" />}
      emptyTitle="Sin usuarios listados"
      emptyDescription="Aquí gestionarás altas, roles y permisos."
    />
  ),
});
