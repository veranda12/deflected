import Link from "next/link";
import { IconWhatsApp } from "@/components/icons";
import { LogoMark } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";

export function CtaBand({ title, body, waHref }: { title: string; body: string; waHref: string }) {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-blue text-white" aria-labelledby="cta-title">
      <LogoMark className="pointer-events-none absolute -top-[12%] -right-[8%] -z-10 h-[140%] w-auto text-[#0a5cf0]" />
      <div className="container-x section-y">
        <div className="max-w-3xl">
          <h2 id="cta-title" className="display-lg" data-reveal>
            {title}
            <span className="text-amber">.</span>
          </h2>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white" data-reveal style={{ ["--reveal-i" as string]: 1 }}>
            {body}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row" data-reveal style={{ ["--reveal-i" as string]: 2 }}>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className={buttonClass("light", "lg")}>
              <IconWhatsApp className="size-5 text-[#1f8f4e]" />
              <span>Konsultasi via WhatsApp</span>
            </a>
            <Link href="/kontak#penawaran" className={buttonClass("outline-light", "lg")}>
              Isi form penawaran
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
