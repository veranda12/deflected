import { desc, eq } from "drizzle-orm";
import { DangerButton } from "@/components/admin/danger-button";
import { ActionForm, Panel, Submit, TextField } from "@/components/admin/form";
import { Badge, PageTitle } from "@/components/admin/ui";
import { getDb } from "@/db";
import { sessions } from "@/db/schema";
import { getSession, requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { changePassword, revokeOtherSessions } from "./actions";

function device(ua: string | null) {
  if (!ua) return "Perangkat tidak dikenal";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Lainnya";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${br} di ${os}`;
}

export default async function AccountPage() {
  const user = await requireAdmin();
  const current = await getSession();
  const list = await getDb().select().from(sessions).where(eq(sessions.userId, user.id)).orderBy(desc(sessions.lastSeenAt));
  return (
    <>
      <PageTitle title="Akun saya" description={`${user.name} · ${user.email}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ActionForm action={changePassword} resetOnSuccess>
          <Panel title="Ganti password" description="Minimal 12 karakter, kombinasi huruf dan angka. Semua sesi lain akan dikeluarkan.">
            <div className="space-y-4">
              <TextField label="Password saat ini" name="current" type="password" autoComplete="current-password" required maxLength={128} />
              <TextField label="Password baru" name="next" type="password" autoComplete="new-password" required minLength={12} maxLength={128} />
              <TextField label="Ulangi password baru" name="confirm" type="password" autoComplete="new-password" required maxLength={128} />
              <Submit>Ganti password</Submit>
            </div>
          </Panel>
        </ActionForm>
        <Panel title="Sesi aktif" description="Sesi berakhir otomatis setelah 12 jam, atau 2 jam tanpa aktivitas.">
          <ul className="divide-y divide-line">
            {list.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-ink">{device(s.userAgent)}</p>
                  <p className="text-[0.8rem] text-text-2">Aktif terakhir {formatDateTime(s.lastSeenAt)}</p>
                </div>
                {s.id === current?.sessionId && <Badge tone="info">Sesi ini</Badge>}
              </li>
            ))}
          </ul>
          {list.length > 1 && (
            <div className="mt-4">
              <DangerButton action={revokeOtherSessions} confirmText="Keluarkan semua sesi lain?">
                Keluarkan sesi lain
              </DangerButton>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
