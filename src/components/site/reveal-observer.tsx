"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const onIntersect: IntersectionObserverCallback = (entries, observer) => {
  for (const e of entries) {
    // A fast scroll can jump past an element; anything left above the viewport counts as seen.
    if (e.isIntersecting || e.boundingClientRect.top < 0) {
      e.target.classList.add("is-in");
      observer.unobserve(e.target);
    }
  }
};

/**
 * One IntersectionObserver for the whole page. Elements opt in with data-reveal
 * (and optional --reveal-i for stagger). Page content can stream in after this
 * component mounts, so a MutationObserver picks up elements added later.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = "IntersectionObserver" in window && !reduced ? new IntersectionObserver(onIntersect, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }) : null;

    const track = (el: HTMLElement) => {
      if (el.classList.contains("is-in")) return;
      if (io) io.observe(el);
      else el.classList.add("is-in");
    };
    const scan = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach(track);
    };

    scan(document);
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-reveal]")) track(node);
          scan(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // IntersectionObserver never reports an element that jumps straight past the viewport,
    // so sweep on scroll for anything now fully above it.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
        if (el.getBoundingClientRect().bottom < 0) el.classList.add("is-in");
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);
  return null;
}
