"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IconChevron, IconClose, IconMenu, IconWhatsApp } from "@/components/icons";
import { LogoLockup } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavCategory = { slug: string; name: string; tagline: string };

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/tentang", label: "Tentang" },
  { href: "/layanan", label: "Layanan" },
  { href: "/katalog", label: "Katalog", dropdown: true },
  { href: "/portofolio", label: "Portofolio" },
  { href: "/kontak", label: "Kontak" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`) || (href === "/katalog" && pathname.startsWith("/produk/"));
}

export function SiteHeader({ categories, waHref }: { categories: NavCategory[]; waHref: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const ddId = useId();
  const menuId = useId();
  const ddTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ddRef = useRef<HTMLLIElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (state adjusted during render, not in an effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
    setDdOpen(false);
  }

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The panel's visibility transitions from hidden; wait until it is focusable before moving focus in.
    const focusTimer = setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a,button")?.focus(), 80);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
      if (e.key === "Tab" && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>("a,button");
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!ddOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDdOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDdOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [ddOpen]);

  const hoverOpenedAt = useRef(0);
  const openDd = () => {
    if (ddTimer.current) clearTimeout(ddTimer.current);
    if (!ddOpen) hoverOpenedAt.current = Date.now();
    setDdOpen(true);
  };
  // A click right after hover-opening should keep the panel open instead of toggling it shut.
  const toggleDd = () => {
    if (Date.now() - hoverOpenedAt.current < 500) return;
    setDdOpen((v) => !v);
  };
  const closeDdSoon = () => {
    if (ddTimer.current) clearTimeout(ddTimer.current);
    ddTimer.current = setTimeout(() => setDdOpen(false), 140);
  };

  const solid = scrolled || menuOpen;

  return (
    <>
      <a
        href="#konten"
        className="sr-only z-[60] rounded-sm bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Lewati ke konten
      </a>
      <header className="fixed inset-x-0 top-0 z-50 pt-3">
        <div className="container-x">
          <div
            className={cn(
              "flex h-[60px] items-center justify-between gap-4 rounded-md border pr-2 pl-4 transition-[background-color,border-color,box-shadow] duration-300",
              solid
                ? "border-line bg-white shadow-[0_10px_30px_-18px_rgba(10,17,40,0.35)]"
                : "border-transparent bg-white/0",
            )}
          >
            <Link href="/" className="flex h-11 items-center text-[26px] text-ink" aria-label="Deflected, ke beranda">
              <LogoLockup markClassName="text-blue" />
            </Link>

            <nav aria-label="Navigasi utama" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV.map((item) =>
                  "dropdown" in item ? (
                    <li key={item.href} className="relative" ref={ddRef} onMouseEnter={openDd} onMouseLeave={closeDdSoon}>
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          className={cn(navLinkClass, isActive(pathname, item.href) && activeClass, "pr-1")}
                          aria-current={isActive(pathname, item.href) ? "page" : undefined}
                        >
                          {item.label}
                        </Link>
                        <button
                          type="button"
                          className="grid size-8 place-items-center rounded-xs text-text-2 hover:text-ink"
                          aria-expanded={ddOpen}
                          aria-controls={ddId}
                          aria-label="Buka daftar kategori katalog"
                          onClick={toggleDd}
                        >
                          <IconChevron className={cn("size-4 transition-transform duration-300", ddOpen && "rotate-180")} />
                        </button>
                      </div>
                      <div
                        id={ddId}
                        hidden={!ddOpen}
                        className="absolute top-full left-1/2 w-[440px] -translate-x-1/2 pt-3"
                      >
                        <div className="animate-[panel-in_220ms_var(--ease-out)] rounded-lg border border-line bg-white p-2 shadow-[0_24px_60px_-30px_rgba(10,17,40,0.45)]">
                          <ul>
                            {categories.map((c, i) => (
                              <li key={c.slug}>
                                <Link
                                  href={`/katalog/kategori/${c.slug}`}
                                  className="group flex items-baseline gap-4 rounded-md px-4 py-3 transition-colors hover:bg-mist focus-visible:bg-mist"
                                >
                                  <span className="font-display text-xl leading-none text-blue-strong">{String(i + 1).padStart(2, "0")}</span>
                                  <span>
                                    <span className="block text-[0.95rem] font-semibold text-ink">{c.name}</span>
                                    <span className="mt-0.5 block text-[0.82rem] text-text-2">{c.tagline}</span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <Link
                            href="/katalog"
                            className="mt-1 flex items-center justify-between rounded-md bg-ink px-4 py-3 text-[0.88rem] font-semibold text-white hover:bg-navy"
                          >
                            Lihat semua produk
                            <span aria-hidden className="text-amber">
                              {categories.length} kategori
                            </span>
                          </Link>
                        </div>
                      </div>
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(navLinkClass, isActive(pathname, item.href) && activeClass)}
                        aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("primary", "md", "hidden h-11 sm:inline-flex")}
              >
                <IconWhatsApp className="size-[18px]" />
                <span>Konsultasi</span>
              </a>
              <button
                ref={menuBtnRef}
                type="button"
                className="grid size-11 place-items-center rounded-sm text-ink hover:bg-mist lg:hidden"
                aria-expanded={menuOpen}
                aria-controls={menuId}
                aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <IconClose className="size-6" /> : <IconMenu className="size-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        id={menuId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          "fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink text-white transition-[clip-path,visibility] duration-500 ease-[var(--ease-out)] lg:hidden on-dark",
          menuOpen ? "visible [clip-path:inset(0_0_0_0)]" : "invisible [clip-path:inset(0_0_100%_0)]",
        )}
      >
        <div className="container-x flex flex-1 flex-col pt-28 pb-10">
          <nav aria-label="Navigasi seluler">
            <ul className="space-y-1">
              {NAV.map((item, i) => (
                <li key={item.href} style={{ transitionDelay: menuOpen ? `${120 + i * 45}ms` : "0ms" }} className={cn("transition-[opacity,transform] duration-500 ease-[var(--ease-out)]", menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-baseline gap-4 py-1.5 font-display text-[3rem] leading-none",
                      isActive(pathname, item.href) ? "text-amber" : "text-white",
                    )}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    <span className="font-sans text-xs font-semibold text-on-dark-2">{String(i + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 border-t border-navy-line pt-6">
            <p className="text-sm font-semibold text-on-dark-2">Kategori produk</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/katalog/kategori/${c.slug}`}
                    className="inline-flex min-h-11 items-center rounded-sm border border-navy-line px-3.5 text-sm text-white hover:border-white"
                    tabIndex={menuOpen ? 0 : -1}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto grid gap-3 pt-10 sm:grid-cols-2">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg")} tabIndex={menuOpen ? 0 : -1}>
              <IconWhatsApp className="size-5" />
              <span>Konsultasi via WhatsApp</span>
            </a>
            <Link href="/kontak#penawaran" className={buttonClass("outline-light", "lg")} tabIndex={menuOpen ? 0 : -1}>
              Isi form penawaran
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

const navLinkClass =
  "relative inline-flex h-10 items-center rounded-xs px-3 text-[0.9rem] font-medium text-text-2 transition-colors hover:text-ink after:absolute after:inset-x-3 after:bottom-1.5 after:h-[2px] after:origin-left after:scale-x-0 after:bg-blue after:transition-transform after:duration-300 hover:after:scale-x-100";
const activeClass = "text-ink after:scale-x-100";
