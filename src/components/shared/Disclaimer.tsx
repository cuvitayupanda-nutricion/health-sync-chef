import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DisclaimerProps {
  className?: string;
  variant?: "inline" | "card";
}

const TEXT =
  "7RISE Nutrition Engine es una herramienta de orientación nutricional para adultos sanos. No realiza diagnósticos, no prescribe tratamientos y no sustituye la consulta con un profesional de la salud.";

export function Disclaimer({ className, variant = "inline" }: DisclaimerProps) {
  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex gap-3 rounded-xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground",
          className,
        )}
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>{TEXT}</p>
      </div>
    );
  }
  return (
    <p className={cn("flex items-start gap-2 text-xs text-muted-foreground", className)}>
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{TEXT}</span>
    </p>
  );
}
