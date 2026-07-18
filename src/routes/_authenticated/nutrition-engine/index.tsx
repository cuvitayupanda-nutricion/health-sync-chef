import { createFileRoute } from "@tanstack/react-router";
import { Cpu, Flame, Beef, Wheat, Droplets, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Disclaimer } from "@/components/shared/Disclaimer";

export const Route = createFileRoute("/_authenticated/nutrition-engine/")({
  component: EnginePage,
});

const flow = [
  { icon: Cpu, label: "Recibir datos de composición corporal" },
  { icon: Flame, label: "Leer GET y objetivo nutricional" },
  { icon: Beef, label: "Calcular proteínas" },
  { icon: Droplets, label: "Calcular grasas" },
  { icon: Wheat, label: "Calcular carbohidratos" },
  { icon: ArrowRight, label: "Combinar menú desde la biblioteca por nivel calórico" },
];

function EnginePage() {
  return (
    <AppShell title="Nutrition Engine" subtitle="El motor nutricional de 7RISE">
      <PageHeader
        eyebrow="Motor"
        title="Nutrition Engine"
        description="Toda la lógica nutricional vive aquí. Determinista, auditable y separada del módulo de IA."
      />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h3 className="text-display mb-6 text-base font-semibold text-foreground">
          Flujo de cálculo
        </h3>
        <ol className="space-y-3">
          {flow.map(({ icon: Icon, label }, i) => (
            <li
              key={label}
              className="flex items-center gap-4 rounded-xl border border-border/70 bg-background p-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground">Paso {i + 1}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p className="text-xs font-medium tracking-widest text-primary uppercase">
            Módulo separado
          </p>
          <h4 className="text-display mt-2 text-lg font-semibold text-foreground">
            Food Photo Analysis
          </h4>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Reconocimiento de alimentos por fotografía. Preparado en la arquitectura, en desarrollo
            futuro.
          </p>
          <span className="mt-3 inline-flex items-center rounded-full bg-muted px-3 py-1 text-[0.7rem] font-medium text-muted-foreground">
            Future module
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p className="text-xs font-medium tracking-widest text-primary uppercase">IA</p>
          <h4 className="text-display mt-2 text-lg font-semibold text-foreground">
            Solo explicaciones
          </h4>
          <p className="mt-1.5 text-sm text-muted-foreground">
            El módulo de IA únicamente explica las recomendaciones en lenguaje humano. Nunca decide
            macros ni sustituye al motor.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Disclaimer variant="card" />
      </div>
    </AppShell>
  );
}
