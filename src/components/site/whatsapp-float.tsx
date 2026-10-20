"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconWhatsApp } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Persistent WhatsApp shortcut. Appears after the hero so it never covers the first screen's CTAs. */
export function WhatsAppFloat({ href }: { href: string }) {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  if (pathname.startsWith("/kontak")) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp dengan Deflected"
      tabIndex={show ? 0 : -1}
      className={cn(
        "fixed right-4 bottom-4 z-30 grid size-14 place-items-center rounded-full bg-[#1f8f4e] text-white shadow-[0_14px_30px_-12px_rgba(10,17,40,0.55)] transition-[opacity,transform] duration-300 ease-[var(--ease-out)] hover:bg-[#187a42] sm:right-6 sm:bottom-6",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <IconWhatsApp className="size-7" />
    </a>
  );
}
