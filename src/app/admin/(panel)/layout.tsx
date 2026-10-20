import { count, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../login/actions";

export const metadata: Metadata = { title: "Admin | Deflected", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const [{ value: newCount }] = await getDb().select({ value: count() }).from(inquiries).where(eq(inquiries.status, "baru"));
  return (
    <div className="min-h-dvh bg-mist lg:flex">
      <AdminNav role={user.role} newInquiries={newCount} />
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between gap-4 border-b border-line bg-white px-4 sm:px-8">
          <Link href="/" target="_blank" className="text-sm font-semibold text-blue-strong hover:underline">
            Lihat situs
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-right text-sm sm:block">
              <span className="block font-semibold text-ink">{user.name}</span>
              <span className="block text-[0.78rem] text-text-2">
                {user.email} · {user.role === "owner" ? "Owner" : "Editor"}
              </span>
            </span>
            <form action={logout}>
              <button type="submit" className="h-10 rounded-sm border border-line px-3 text-sm font-semibold text-ink hover:bg-mist">
                Keluar
              </button>
            </form>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}
