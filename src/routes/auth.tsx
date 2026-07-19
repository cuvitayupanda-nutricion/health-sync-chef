import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand/BrandMark";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  next: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().trim().email("Escribe un correo válido."),
  password: z.string().min(1, "Escribe tu contraseña."),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Escribe tu nombre completo."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search) => searchSchema.parse(search),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const { mode: initialMode, next } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const safeNext = next?.startsWith("/") ? next : "/dashboard";
  const redirectTo = `${window.location.origin}${safeNext}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormMessage(null);
    try {
      if (mode === "signup") {
        const form = signUpSchema.parse({ email, password, fullName });
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: redirectTo,
            data: { full_name: form.fullName },
          },
        });
        if (error) throw error;

        if (!data.session) {
          const message =
            "Cuenta creada. Revisa tu correo para confirmar el acceso antes de iniciar sesión.";
          toast.success(message);
          setFormMessage(message);
          setMode("signin");
          setPassword("");
          return;
        }

        toast.success("Cuenta creada. Entraste correctamente.");
      } else {
        const form = signInSchema.parse({ email, password });
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Sesión iniciada.");
      }
      router.navigate({ to: safeNext });
    } catch (err) {
      const msg =
        err instanceof z.ZodError
          ? (err.errors[0]?.message ?? "Revisa los datos del formulario.")
          : err instanceof Error
            ? err.message
            : "No se pudo continuar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <Link to="/" className="mb-10 self-start">
          <BrandMark />
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-display text-2xl font-semibold tracking-tight text-foreground">
              {mode === "signup" ? "Crea tu cuenta" : "Inicia sesión"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signup"
                ? "Empieza a generar planes nutricionales en un minuto."
                : "Accede a tu panel de 7RISE Nutrition Engine."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formMessage && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                {formMessage}
              </div>
            )}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nombre y apellido"
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={mode === "signup" ? 8 : 1}
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Crear cuenta" : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-medium text-foreground hover:text-primary"
                >
                  Iniciar sesión
                </button>
              </>
            ) : (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-medium text-foreground hover:text-primary"
                >
                  Crear cuenta
                </button>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[0.7rem] text-muted-foreground">
          Al continuar aceptas nuestros términos. Uso no clínico.
        </p>
      </div>
    </div>
  );
}
