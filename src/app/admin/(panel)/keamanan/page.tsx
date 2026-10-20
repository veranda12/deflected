import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import Link from "next/link";
import { Panel } from "@/components/admin/form";
import { Badge, filterInput, PageTitle, Table } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/db";
import { auditLogs, securityEvents } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn, formatDateTime } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  login_success: "Login berhasil",
  login_failed: "Login gagal",
  login_locked: "Akun dikunci",
  rate_limited: "Rate limit",
  access_denied: "Akses ditolak",
  password_changed: "Password diganti",
  session_revoked: "Sesi dicabut",
  logout: "Logout",
  inquiry_spam_blocked: "Spam form diblokir",
};
const tone = (t: string) =>
  t === "login_success" || t === "logout" || t === "password_changed" ? "success" : t === "login_failed" || t === "rate_limited" || t === "inquiry_spam_blocked" ? "warning" : t === "login_locked" || t === "access_denied" ? "danger" : "neutral";

function windows() {
  const now = Date.now();
  return { since: new Date(now - 7 * 24 * 3600 * 1000), dayAgo: new Date(now - 24 * 3600 * 1000) };
}

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function SecurityCenter({ searchParams }: Props) {
  await requireAdmin({ role: "owner" });
  const sp = await searchParams;
  const view = sp.view === "audit" ? "audit" : "events";
  const type = sp.type && TYPE_LABEL[sp.type] ? sp.type : "";
  const db = getDb();
  const { since, dayAgo } = windows();

  const [summary, suspicious, events, audits] = await Promise.all([
    db.select({ type: securityEvents.type, n: count() }).from(securityEvents).where(gte(securityEvents.createdAt, since)).groupBy(securityEvents.type),
    // Simple rule: 5+ failed logins from the same (hashed) IP within the last 24 hours.
    db
      .select({ ipHash: securityEvents.ipHash, n: count(), emails: sql<string>`string_agg(distinct coalesce(${securityEvents.email}, '-'), ', ')`, last: sql<Date>`max(${securityEvents.createdAt})` })
      .from(securityEvents)
      .where(and(eq(securityEvents.type, "login_failed"), gte(securityEvents.createdAt, dayAgo)))
      .groupBy(securityEvents.ipHash)
      .having(sql`count(*) >= 5`),
    view === "events"
      ? db.select().from(securityEvents).where(type ? eq(securityEvents.type, type) : undefined).orderBy(desc(securityEvents.createdAt)).limit(100)
      : Promise.resolve([]),
    view === "audit" ? db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100) : Promise.resolve([]),
  ]);
  const n = (t: string) => summary.find((s) => s.type === t)?.n ?? 0;

  return (
    <>
      <PageTitle
        title="Security center"
        description="Catatan aktivitas keamanan dan perubahan konten. Ini alat pemantauan sederhana berbasis aturan, bukan sistem deteksi serangan menyeluruh."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Login berhasil", n("login_success"), "success"],
          ["Login gagal", n("login_failed") + n("login_locked"), "warning"],
          ["Rate limit & spam", n("rate_limited") + n("inquiry_spam_blocked"), "warning"],
          ["Akses ditolak", n("access_denied"), "danger"],
        ].map(([label, value, t]) => (
          <div key={label as string} className="rounded-md border border-line bg-white p-4">
            <p className="text-[0.8rem] text-text-2">{label} · 7 hari</p>
            <p className={cn("mt-1 text-2xl font-semibold", Number(value) > 0 && t !== "success" ? "text-warning" : "text-ink")}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Panel title="Perlu diperhatikan" description="IP (dalam bentuk hash) dengan 5 kali atau lebih login gagal dalam 24 jam.">
          {suspicious.length === 0 ? (
            <p className="text-sm text-text-2">Tidak ada pola mencurigakan dalam 24 jam terakhir.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {suspicious.map((s) => (
                <li key={s.ipHash ?? "none"} className="flex flex-wrap justify-between gap-2 py-2.5">
                  <span>
                    <span className="font-mono text-[0.8rem] text-ink">{(s.ipHash ?? "").slice(0, 12)}</span> mencoba akun {s.emails}
                  </span>
                  <Badge tone="danger">{s.n} gagal</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <nav className="mt-8 mb-4 flex gap-2" aria-label="Jenis log">
        <Link href="/admin/keamanan" className={buttonClass(view === "events" ? "dark" : "outline")}>
          Event keamanan
        </Link>
        <Link href="/admin/keamanan?view=audit" className={buttonClass(view === "audit" ? "dark" : "outline")}>
          Audit perubahan
        </Link>
      </nav>

      {view === "events" ? (
        <>
          <form method="get" className="mb-4 flex gap-2">
            <select name="type" defaultValue={type} className={filterInput} aria-label="Filter jenis event">
              <option value="">Semua jenis</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button type="submit" className={buttonClass("dark")}>
              Filter
            </button>
          </form>
          <Table head={["Waktu", "Event", "Akun", "IP (hash)", "Detail"]}>
            {events.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-2.5 whitespace-nowrap text-text-2">{formatDateTime(e.createdAt)}</td>
                <td className="px-4 py-2.5">
                  <Badge tone={tone(e.type)}>{TYPE_LABEL[e.type] ?? e.type}</Badge>
                </td>
                <td className="px-4 py-2.5 text-ink">{e.email ?? "-"}</td>
                <td className="px-4 py-2.5 font-mono text-[0.78rem] text-text-2">{(e.ipHash ?? "").slice(0, 12)}</td>
                <td className="px-4 py-2.5 text-text-2">{e.detail}</td>
              </tr>
            ))}
          </Table>
          {events.length === 0 && <p className="mt-3 text-sm text-text-2">Belum ada event.</p>}
        </>
      ) : (
        <>
          <Table head={["Waktu", "Admin", "Aksi", "Ringkasan"]}>
            {audits.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-2.5 whitespace-nowrap text-text-2">{formatDateTime(a.createdAt)}</td>
                <td className="px-4 py-2.5 text-ink">{a.actorEmail}</td>
                <td className="px-4 py-2.5">
                  <Badge>{`${a.action} ${a.entityType}`}</Badge>
                </td>
                <td className="px-4 py-2.5 text-text-2">{a.summary}</td>
              </tr>
            ))}
          </Table>
          {audits.length === 0 && <p className="mt-3 text-sm text-text-2">Belum ada perubahan tercatat.</p>}
        </>
      )}
      <p className="mt-6 text-[0.8rem] text-text-3">
        Retensi: event keamanan 90 hari, audit 365 hari (dibersihkan oleh endpoint maintenance). Alamat IP hanya disimpan sebagai hash.
      </p>
    </>
  );
}
