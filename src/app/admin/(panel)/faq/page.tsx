import { asc } from "drizzle-orm";
import { DangerButton } from "@/components/admin/danger-button";
import { ActionForm, Panel, Submit, TextArea, TextField, Toggle } from "@/components/admin/form";
import { Badge, PageTitle } from "@/components/admin/ui";
import { getDb } from "@/db";
import { faqs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { deleteFaq, saveFaq } from "./actions";

export default async function AdminFaq() {
  await requireAdmin();
  const rows = await getDb().select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.createdAt));
  return (
    <>
      <PageTitle title="FAQ" description="Tulis jawaban sesuai kebijakan Deflected yang berlaku. Jangan menjanjikan hal yang belum disepakati." />
      <div className="space-y-4">
        {rows.length === 0 && <p className="text-sm text-text-2">Belum ada FAQ. Section FAQ di beranda disembunyikan sampai ada minimal satu FAQ yang tampil.</p>}
        {rows.map((f) => (
          <details key={f.id} className="group rounded-md border border-line bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
              <span className="font-semibold text-ink">{f.question}</span>
              <span className="flex shrink-0 items-center gap-2">
                {f.isPublished ? <Badge tone="success">Tampil</Badge> : <Badge>Disembunyikan</Badge>}
                <span className="text-sm font-semibold text-blue-strong group-open:hidden">Edit</span>
              </span>
            </summary>
            <div className="border-t border-line p-5">
              <ActionForm action={saveFaq.bind(null, f.id)} className="space-y-4">
                <TextField label="Pertanyaan" name="question" defaultValue={f.question} maxLength={300} required />
                <TextArea label="Jawaban" name="answer" defaultValue={f.answer} rows={4} maxLength={3000} required />
                <div className="flex flex-wrap items-end gap-6">
                  <TextField label="Urutan" name="sortOrder" type="number" defaultValue={f.sortOrder} className="w-28" />
                  <Toggle label="Tampilkan" name="isPublished" defaultChecked={f.isPublished} />
                  <Submit className="ml-auto">Simpan</Submit>
                </div>
              </ActionForm>
              <div className="mt-4 border-t border-line pt-4">
                <DangerButton action={deleteFaq.bind(null, f.id)} confirmText="Hapus FAQ ini?">
                  Hapus
                </DangerButton>
              </div>
            </div>
          </details>
        ))}
        <ActionForm action={saveFaq.bind(null, null)} resetOnSuccess>
          <Panel title="Tambah FAQ">
            <div className="space-y-4">
              <TextField label="Pertanyaan" name="question" maxLength={300} required />
              <TextArea label="Jawaban" name="answer" rows={4} maxLength={3000} required />
              <div className="flex flex-wrap items-end gap-6">
                <TextField label="Urutan" name="sortOrder" type="number" defaultValue={rows.length} className="w-28" />
                <Toggle label="Tampilkan" name="isPublished" defaultChecked />
                <Submit className="ml-auto">Tambah FAQ</Submit>
              </div>
            </div>
          </Panel>
        </ActionForm>
      </div>
    </>
  );
}
