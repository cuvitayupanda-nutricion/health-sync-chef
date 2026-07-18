import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Zap, ShieldCheck, Cpu } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <BrandMark />
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" as const }}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-soft transition hover:opacity-90"
          >
            Empezar
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 pt-16 pb-24 md:px-10 md:pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-grid opacity-40 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Motor nutricional automático
          </span>
          <h1 className="text-display mt-6 text-4xl leading-[1.05] tracking-tight text-foreground md:text-6xl">
            Un plan alimentario personalizado en{" "}
            <span className="text-primary">menos de un minuto.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            7RISE Nutrition Engine convierte los datos de composición corporal de tus
            clientes en calorías, macros y menús listos para entregar. Diseñado para
            gimnasios, entrenadores y centros fitness.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" as const }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Zap,
              title: "Rápido",
              body: "De la báscula al plan en 60 segundos. Sin fricción para el cliente.",
            },
            {
              icon: Cpu,
              title: "Motor nutricional propio",
              body: "Toda la lógica nutricional en el Nutrition Engine. La IA solo explica.",
            },
            {
              icon: ShieldCheck,
              title: "No clínico, seguro",
              body: "Orientado a adultos sanos. Con disclaimer visible y controlado.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-display mt-4 text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row md:px-10">
          <p>© {new Date().getFullYear()} 7RISE Nutrition Engine.</p>
          <p>Uso no clínico. No sustituye a un profesional de la salud.</p>
        </div>
      </footer>
    </div>
  );
}
