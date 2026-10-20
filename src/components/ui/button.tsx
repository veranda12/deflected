import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "outline" | "outline-light" | "light" | "amber";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-blue text-white hover:bg-blue-strong",
  dark: "bg-ink text-white hover:bg-navy",
  outline: "border border-text/20 text-text hover:border-text hover:bg-text hover:text-white",
  "outline-light": "border border-white/35 text-white hover:border-white hover:bg-white hover:text-ink",
  light: "bg-white text-ink hover:bg-cloud",
  amber: "bg-amber text-ink hover:bg-[#ffc533]",
};
const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[0.9rem]",
  lg: "h-13 px-6 text-[0.95rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex min-w-11 items-center justify-center gap-2.5 rounded-sm font-semibold tracking-[-0.005em] whitespace-nowrap",
    "transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-standard)] active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

type LinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; icon?: ReactNode };

export function ButtonLink({ variant, size, icon, className, children, ...rest }: LinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}

type AnchorProps = ComponentProps<"a"> & { variant?: Variant; size?: Size; icon?: ReactNode };

/** For external destinations (WhatsApp, mailto). Opens WhatsApp in a new tab safely. */
export function ButtonAnchor({ variant, size, icon, className, children, ...rest }: AnchorProps) {
  return (
    <a className={buttonClass(variant, size, className)} rel="noopener noreferrer" {...rest}>
      {icon}
      <span>{children}</span>
    </a>
  );
}
