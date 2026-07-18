import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: "h-6 w-6", text: "text-sm" },
  md: { icon: "h-8 w-8", text: "text-base" },
  lg: { icon: "h-10 w-10", text: "text-lg" },
};

export function BrandMark({ className, showWordmark = true, size = "md" }: BrandMarkProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-foreground text-background shadow-soft",
          s.icon,
        )}
        aria-hidden
      >
        <span className="text-display text-[0.8em] font-bold leading-none">7</span>
      </div>
      {showWordmark && (
        <div className={cn("flex flex-col leading-tight", s.text)}>
          <span className="text-display font-semibold tracking-tight text-foreground">
            7RISE
          </span>
          <span className="text-[0.7em] font-medium tracking-wide text-muted-foreground uppercase">
            Nutrition Engine
          </span>
        </div>
      )}
    </div>
  );
}
