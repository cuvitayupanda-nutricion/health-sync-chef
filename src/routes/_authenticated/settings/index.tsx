import { createFileRoute } from "@tanstack/react-router";
import { Settings, User, Building2, Webhook, KeyRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";

export const Route = createFileRoute("/_authenticated/settings/")({
  component: SettingsPage,
});

const sections = [
  { icon: User, title: "Perfil", description: "Nombre, foto y datos personales." },
  { icon: Building2, title: "Organización", description: "Marca del gimnasio o centro." },
  { icon: Webhook, title: "Integraciones", description: "Webhook desde InBody (Plataforma 1)." },
  { icon: KeyRound, title: "API tokens", description: "Acceso desde la Plataforma 3." },
];

function SettingsPage() {
  return (
    <AppShell title="Configuración" subtitle="Ajustes de la cuenta y la organización">
      <PageHeader
        eyebrow="Ajustes"
        title="Configuración"
        description="Personaliza tu cuenta, tu organización y las integraciones."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ icon: Icon, title, description }) => (
          <button
            key={title}
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-soft transition hover:border-primary/30 hover:shadow-elevated"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-display text-base font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <Settings className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
          </button>
        ))}
      </div>
    </AppShell>
  );
}
