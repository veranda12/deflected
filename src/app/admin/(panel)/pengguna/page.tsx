import { asc } from "drizzle-orm";
import { ActionForm, Panel, SelectField, Submit, TextField, Toggle } from "@/components/admin/form";
import { Badge, PageTitle } from "@/components/admin/ui";
import { getDb } from "@/db";
import { adminUsers } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { createAdmin, updateAdmin } from "./actions";

const roles = [
  { value: "editor", label: "Editor (konten, katalog, inquiry)" },
  { value: "owner", label: "Owner (semua akses)" },
];

export default async function UsersPage() {
  const me = await requireAdmin({ role: "owner" });
  const users = await getDb().select().from(adminUsers).orderBy(asc(adminUsers.createdAt));
  return (
    <>
      <PageTitle title="Pengguna admin" description="Editor mengelola konten, katalog, dan inquiry. Owner juga mengelola pengaturan, pengguna, dan security center." />
      <div className="space-y-4">
        {users.map((u) => {
          const locked = u.lockedUntil && u.lockedUntil > new Date();
          return (
            <details key={u.id} className="group rounded-md border border-line bg-white">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4">
                <span>
                  <span className="block font-semibold text-ink">
                    {u.name} {u.id === me.id && <span className="text-text-3">(Anda)</span>}
                  </span>
                  <span className="block text-[0.8rem] text-text-2">
                    {u.email} · login terakhir {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "belum pernah"}
                  </span>
                </span>
                <span className="flex gap-1.5">
                  <Badge tone={u.role === "owner" ? "info" : "neutral"}>{u.role === "owner" ? "Owner" : "Editor"}</Badge>
                  {!u.isActive && <Badge tone="danger">Nonaktif</Badge>}
                  {locked && <Badge tone="warning">Terkunci</Badge>}
                </span>
              </summary>
              <div className="border-t border-line p-5">
                <ActionForm action={updateAdmin.bind(null, u.id)} className="grid gap-4 sm:grid-cols-2">
                  <SelectField label="Peran" name="role" defaultValue={u.role} options={roles} />
                  <TextField label="Reset password" name="password" type="password" autoComplete="new-password" maxLength={128} hint="Kosongkan jika tidak diganti. Mengganti password mengeluarkan semua sesinya." />
                  <Toggle label="Akun aktif" name="isActive" defaultChecked={u.isActive} hint="Nonaktif langsung mengeluarkan semua sesi. Menyimpan juga membuka kunci login sementara." />
                  <div className="flex items-end justify-end">
                    <Submit>Simpan</Submit>
                  </div>
                </ActionForm>
              </div>
            </details>
          );
        })}
        <ActionForm action={createAdmin} resetOnSuccess>
          <Panel title="Tambah pengguna">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Nama" name="name" required maxLength={80} />
              <TextField label="Email" name="email" type="email" required maxLength={200} />
              <SelectField label="Peran" name="role" defaultValue="editor" options={roles} />
              <TextField label="Password sementara" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} hint="Minimal 12 karakter, huruf dan angka." />
            </div>
            <div className="mt-5 flex justify-end">
              <Submit>Buat akun</Submit>
            </div>
          </Panel>
        </ActionForm>
      </div>
    </>
  );
}
