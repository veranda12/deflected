import { cn } from "@/lib/utils";

/** Pulsing placeholder block. The pulse is skipped for visitors who prefer reduced motion. */
export function SkeletonBlock({ className }: { className?: string }) {
  return <div aria-hidden className={cn("rounded-sm bg-line motion-safe:animate-pulse", className)} />;
}

/**
 * Shown while a site route streams in. It keeps the rough shape of the real page
 * (heading, intro, content) so the swap does not jump.
 */
export function PageSkeleton({ variant = "list" }: { variant?: "list" | "detail" }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat halaman</span>
      {variant === "detail" ? <DetailShape /> : <ListShape />}
    </div>
  );
}

function ListShape() {
  return (
    <>
      <section className="pt-[calc(var(--header-h)+40px)] pb-12 sm:pb-16">
        <div className="container-x">
          <SkeletonBlock className="h-4 w-40" />
          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="space-y-4 lg:col-span-7">
              <SkeletonBlock className="h-12 w-4/5 sm:h-16" />
              <SkeletonBlock className="h-12 w-3/5 sm:h-16" />
            </div>
            <div className="space-y-3 lg:col-span-5">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </section>
      <section className="section-y">
        <div className="container-x grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 lg:gap-x-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <SkeletonBlock className="aspect-[4/5] w-full" />
              <SkeletonBlock className="mt-4 h-5 w-2/3" />
              <SkeletonBlock className="mt-2 h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function DetailShape() {
  return (
    <section className="pt-[calc(var(--header-h)+40px)] pb-[var(--section-y)]">
      <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <SkeletonBlock className="aspect-[4/5] w-full" />
        </div>
        <div className="space-y-5 lg:col-span-5">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-12 w-4/5" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-11/12" />
          <SkeletonBlock className="h-4 w-2/3" />
          <div className="space-y-3 pt-6">
            <SkeletonBlock className="h-11 w-full" />
            <SkeletonBlock className="h-11 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
