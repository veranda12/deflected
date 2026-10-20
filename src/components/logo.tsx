import { LOGO_FLIP, MARK_PATH, MARK_VIEWBOX, WORDMARK_PATHS, WORDMARK_VIEWBOX } from "@/lib/logo-paths";
import { cn } from "@/lib/utils";

/** DFLCTD mark (the "D" swoosh) from the client's vector logo file. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox={MARK_VIEWBOX} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <g transform={LOGO_FLIP} fill="currentColor">
        <path d={MARK_PATH} />
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} className={className} aria-hidden>
      <g transform={LOGO_FLIP} fill="currentColor">
        {WORDMARK_PATHS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** Horizontal lockup (mark + wordmark), the "Variation" layout from the brand sheet. */
export function LogoLockup({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[0.45em]", className)}>
      <LogoMark className={cn("h-[1.25em] w-auto", markClassName)} />
      <Wordmark className="h-[0.78em] w-auto" />
      <span className="sr-only">DFLCTD, Deflected Apparel</span>
    </span>
  );
}
