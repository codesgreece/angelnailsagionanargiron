import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  showTagline?: boolean;
  inverted?: boolean;
  size?: "sm" | "md" | "lg";
};

export function BrandLogo({ className, showTagline = false, inverted = false, size = "md" }: Props) {
  const sizes = {
    sm: "text-[1.75rem]",
    md: "text-3xl md:text-[2.1rem]",
    lg: "text-4xl md:text-5xl",
  };

  return (
    <div className={cn("leading-none", className)}>
      <div
        className={cn(sizes[size], inverted ? "text-white" : "text-[#FF3F87]")}
        style={{ fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive" }}
      >
        Angel Nails
      </div>
      {showTagline && (
        <p
          className={cn(
            "mt-1 text-[10px] font-medium uppercase tracking-[0.18em]",
            inverted ? "text-white/80" : "text-white/75",
          )}
        >
          Μανικιούρ • Πεντικιούρ • Τεχνητά Νύχια
        </p>
      )}
    </div>
  );
}
