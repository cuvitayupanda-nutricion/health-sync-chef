import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand/BrandMark";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  next: z.string().optional(),
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
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Revisa tu correo si es necesario.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.navigate({ to: next ?? "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo continuar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      router.navigate({ to: next ?? "/dashboard" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error con Google";
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
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

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
          >
            {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continuar con Google
          </Button>

          <div className="my-5 flex items-center gap-3 text-[0.7rem] tracking-wide text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            o con tu correo
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nombre y apellido"
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
                minLength={6}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-full"
              disabled={loading || googleLoading}
            >
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        d="M22.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.9a5.05 5.05 0 0 1-2.19 3.31v2.75h3.54c2.08-1.92 3.25-4.74 3.25-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.95 0 5.42-.98 7.23-2.64l-3.54-2.75c-.98.66-2.24 1.05-3.69 1.05-2.84 0-5.24-1.92-6.1-4.5H2.24v2.83A11 11 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.9 14.16A6.62 6.62 0 0 1 5.55 12c0-.75.13-1.48.35-2.16V7.01H2.24A11 11 0 0 0 1 12c0 1.78.43 3.46 1.24 4.99l3.66-2.83z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.61 0 3.05.55 4.18 1.63l3.14-3.14C17.42 2.09 14.95 1 12 1 7.7 1 3.99 3.47 2.24 7.01l3.66 2.83C6.76 7.3 9.16 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}
