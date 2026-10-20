import { asc, eq } from "drizzle-orm";
import Image from "next/image";
import { DangerButton } from "@/components/admin/danger-button";
import { ActionForm, Panel, Submit, TextField, Toggle } from "@/components/admin/form";
import { LogoField } from "@/components/admin/logo-field";
import { Badge, PageTitle } from "@/components/admin/ui";
import { getDb } from "@/db";
import { clients, media } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { mediaUrl } from "@/lib/storage-url";
import { deleteClient, saveClient } from "./actions";

export default async function AdminClients() {
  await requireAdmin();
  const rows = await getDb()
    .select({
      id: clients.id,
      name: clients.name,
      sortOrder: clients.sortOrder,
      isPublished: clients.isPublished,
      logoId: media.id,
      logoKey: media.key,
    })
    .from(clients)
    .leftJoin(media, eq(clients.logoMediaId, media.id))
    .orderBy(asc(clients.sortOrder), asc(clients.name));

  return (
    <>
      <PageTitle
        title="Klien"
        description="Organisasi yang tampil sebagai logo di beranda dan halaman Tentang. Tambahkan hanya organisasi yang sudah setuju ditampilkan."
      />
      <div className="space-y-4">
        {rows.length === 0 && (
          <p className="text-sm text-text-2">Belum ada klien. Bagian daftar klien di situs disembunyikan sampai ada minimal satu klien yang tampil.</p>
        )}
        {rows.map((c) => (
          <details key={c.id} className="group rounded-md border border-line bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
              <span className="flex min-w-0 items-center gap-4">
                <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-xs border border-line bg-mist">
                  {c.logoKey && <Image src={mediaUrl(c.logoKey)} alt="" fill sizes="48px" className="object-contain p-1" />}
                </span>
                <span className="truncate font-semibold text-ink">{c.name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {c.isPublished ? <Badge tone="success">Tampil</Badge> : <Badge>Disembunyikan</Badge>}
                <span className="text-sm font-semibold text-blue-strong group-open:hidden">Edit</span>
              </span>
            </summary>
            <div className="border-t border-line p-5">
              <ActionForm action={saveClient.bind(null, c.id)} className="space-y-5">
                <TextField label="Nama organisasi" name="name" defaultValue={c.name} maxLength={120} required />
                <LogoField initial={c.logoId && c.logoKey ? { id: c.logoId, key: c.logoKey } : null} />
                <div className="flex flex-wrap items-end gap-6">
                  <TextField label="Urutan" name="sortOrder" type="number" defaultValue={c.sortOrder} className="w-28" />
                  <Toggle label="Tampilkan" name="isPublished" defaultChecked={c.isPublished} />
                  <Submit className="ml-auto">Simpan</Submit>
                </div>
              </ActionForm>
              <div className="mt-4 border-t border-line pt-4">
                <DangerButton action={deleteClient.bind(null, c.id)} confirmText="Hapus klien ini?">
                  Hapus
                </DangerButton>
              </div>
            </div>
          </details>
        ))}
        <ActionForm action={saveClient.bind(null, null)} resetOnSuccess>
          <Panel title="Tambah klien">
            <div className="space-y-5">
              <TextField label="Nama organisasi" name="name" maxLength={120} required />
              <LogoField initial={null} />
              <div className="flex flex-wrap items-end gap-6">
                <TextField label="Urutan" name="sortOrder" type="number" defaultValue={rows.length} className="w-28" />
                <Toggle label="Tampilkan" name="isPublished" defaultChecked />
                <Submit className="ml-auto">Tambah klien</Submit>
              </div>
            </div>
          </Panel>
        </ActionForm>
      </div>
    </>
  );
}
