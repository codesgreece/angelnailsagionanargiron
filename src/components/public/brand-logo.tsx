import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showTagline?: boolean;
  inverted?: boolean;
  size?: "sm" | "md" | "lg";
};

export function BrandLogo({ className, showTagline = false, inverted = false, size = "md" }: Props) {
  const sizes = {
    sm: "text-2xl",
    md: "text-3xl md:text-[2rem]",
    lg: "text-4xl md:text-5xl",
  };

  return (
    <div className={cn("leading-none", className)}>
      <div
        className={cn(
          "font-[family-name:var(--font-script)] tracking-tight",
          sizes[size],
          inverted ? "text-white" : "text-[var(--brand-pink)]",
        )}
        style={{ fontFamily: "var(--font-script), cursive" }}
      >
        Angel <span className="italic">Nails</span>
      </div>
      {showTagline && (
        <p
          className={cn(
            "mt-1 text-[10px] uppercase tracking-[0.22em]",
            inverted ? "text-white/70" : "text-[var(--brand-marble)]",
          )}
        >
          Μανικιούρ • Πεντικιούρ • Τεχνητά Νύχια
        </p>
      )}
    </div>
  );
}
