import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  external?: boolean;
  size?: "sm" | "md" | "lg";
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  external,
  size = "md",
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-pink)] disabled:opacity-60";
  const sizes = {
    sm: "px-4 py-2 text-sm rounded-md",
    md: "px-5 py-2.5 text-sm rounded-md",
    lg: "px-7 py-3.5 text-base rounded-lg",
  };
  const variants = {
    primary:
      "bg-[var(--brand-pink)] text-white hover:bg-[var(--brand-pink-bright)] active:scale-[0.98] shadow-[0_8px_24px_rgba(237,47,120,0.25)]",
    secondary: "bg-[var(--brand-black)] text-white hover:bg-[var(--brand-charcoal)] active:scale-[0.98]",
    ghost: "bg-transparent text-current hover:bg-black/5",
    outline:
      "border border-current/20 bg-transparent hover:border-[var(--brand-pink)] hover:text-[var(--brand-pink)]",
  };

  const cls = cn(base, sizes[size], variants[variant], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
