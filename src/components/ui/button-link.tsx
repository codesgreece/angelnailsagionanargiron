import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "outlineLight";
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
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-transform duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ED2F78] active:scale-[0.98]";
  const sizes = {
    sm: "min-h-10 px-4 py-2 text-sm rounded-md",
    md: "min-h-11 px-5 py-2.5 text-sm rounded-md",
    lg: "min-h-12 px-7 py-3.5 text-base rounded-lg",
  };
  const variants = {
    primary:
      "bg-[#ED2F78] text-white hover:bg-[#FF3F87] shadow-[0_10px_28px_rgba(237,47,120,0.28)]",
    secondary: "bg-[#09090B] text-white hover:bg-[#17171A]",
    ghost: "bg-transparent text-current hover:bg-black/5",
    outline: "border border-[#09090B]/25 bg-transparent text-[#09090B] hover:border-[#ED2F78] hover:text-[#ED2F78]",
    outlineLight:
      "border border-white/55 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-[#09090B]",
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
