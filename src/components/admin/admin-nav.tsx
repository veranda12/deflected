"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconClose, IconMenu } from "@/components/icons";
import { LogoMark, Wordmark } from "@/components/logo";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; ownerOnly?: boolean };
const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Ringkasan", items: [{ href: "/admin", label: "Dashboard" }, { href: "/admin/inquiry", label: "Inquiry" }] },
  {
    title: "Katalog",
    items: [
      { href: "/admin/produk", label: "Produk" },
      { href: "/admin/kategori", label: "Kategori" },
      { href: "/admin/portofolio", label: "Portofolio" },
    ],
  },
  {
    title: "Situs",
    items: [
      { href: "/admin/konten", label: "Konten halaman" },
      { href: "/admin/klien", label: "Klien" },
      { href: "/admin/faq", label: "FAQ" },
      { href: "/admin/seo", label: "SEO" },
      { href: "/admin/pengaturan", label: "Pengaturan", ownerOnly: true },
    ],
  },
  {
    title: "Akses",
    items: [
      { href: "/admin/akun", label: "Akun saya" },
      { href: "/admin/pengguna", label: "Pengguna admin", ownerOnly: true },
      { href: "/admin/keamanan", label: "Security center", ownerOnly: true },
    ],
  },
];

export function AdminNav({ role, newInquiries }: { role: "owner" | "editor"; newInquiries: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Navigasi admin" className="space-y-6">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="px-3 text-[0.72rem] font-semibold tracking-wide text-on-dark-2">{g.title}</p>
          <ul className="mt-2 space-y-0.5">
            {g.items
              .filter((i) => !i.ownerOnly || role === "owner")
              .map((i) => (
                <li key={i.href}>
                  <Link
                    href={i.href}
                    aria-current={active(i.href) ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center justify-between rounded-sm px-3 text-[0.9rem] transition-colors",
                      active(i.href) ? "bg-white text-ink font-semibold" : "text-white/85 hover:bg-navy-800 hover:text-white",
                    )}
                  >
                    {i.label}
                    {i.href === "/admin/inquiry" && newInquiries > 0 && (
                      <span className="rounded-xs bg-amber px-1.5 py-0.5 text-[0.72rem] font-bold text-ink">{newInquiries}</span>
                    )}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <div className="on-dark sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-white lg:hidden">
        <Link href="/admin" className="flex items-end gap-2">
          <LogoMark className="h-7 w-auto text-blue" />
          <Wordmark className="h-3.5 w-auto" />
        </Link>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Tutup menu" : "Buka menu"} className="grid size-11 place-items-center">
          {open ? <IconClose className="size-6" /> : <IconMenu className="size-6" />}
        </button>
      </div>
      {open && <div className="on-dark fixed inset-0 top-14 z-20 overflow-y-auto bg-ink p-4 lg:hidden">{nav}</div>}
      <aside className="on-dark sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto bg-ink p-4 text-white lg:block">
        <Link href="/admin" className="mb-8 flex items-end gap-2 px-3 pt-2">
          <LogoMark className="h-8 w-auto text-blue" />
          <Wordmark className="h-4 w-auto" />
        </Link>
        {nav}
      </aside>
    </>
  );
}
