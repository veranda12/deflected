import Link from "next/link";
import type { ReactNode } from "react";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-[0.82rem] text-text-3", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((c, i) => (
            <li key={c.path} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden>/</span>}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-text-2">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-ink hover:underline">
                  {c.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}

export function PageHero({
  crumbs,
  title,
  intro,
  children,
  aside,
}: {
  crumbs: Crumb[];
  title: string;
  intro?: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="pt-[calc(var(--header-h)+40px)] pb-12 sm:pb-16">
      <div className="container-x">
        <Breadcrumbs items={crumbs} />
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h1 className="display-lg text-ink lg:col-span-7">
            <span className="hero-line">
              <span>
                {title}
                <span className="text-amber">.</span>
              </span>
            </span>
          </h1>
          {(intro || aside) && (
            <div className="hero-fade lg:col-span-5" style={{ ["--i" as string]: 0 }}>
              {intro && <p className="text-[1.05rem] leading-relaxed text-text-2">{intro}</p>}
              {aside}
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
