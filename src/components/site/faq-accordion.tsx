"use client";

import { useId, useState } from "react";
import { IconPlus } from "@/components/icons";
import { cn, paragraphs } from "@/lib/utils";

export function FaqAccordion({ items }: { items: { id: string; question: string; answer: string }[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const base = useId();
  if (items.length === 0) return null;
  return (
    <ul className="border-t border-line">
      {items.map((item) => {
        const isOpen = open === item.id;
        const btnId = `${base}-${item.id}-b`;
        const panelId = `${base}-${item.id}-p`;
        return (
          <li key={item.id} className="border-b border-line">
            <h3>
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-[1.02rem] font-semibold text-ink hover:text-blue-strong sm:py-6 sm:text-[1.08rem]"
              >
                {item.question}
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-sm border border-line transition-[transform,background-color,color,border-color] duration-300",
                    isOpen && "rotate-45 border-ink bg-ink text-white",
                  )}
                >
                  <IconPlus className="size-4" />
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={btnId} className="accordion-panel" data-open={isOpen}>
              <div>
                <div className="max-w-2xl pb-6 text-[0.98rem] leading-relaxed text-text-2" inert={!isOpen}>
                  {paragraphs(item.answer).map((p, i) => (
                    <p key={i} className={i ? "mt-3" : undefined}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
