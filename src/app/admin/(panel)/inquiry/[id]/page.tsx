import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DangerButton } from "@/components/admin/danger-button";
import { ActionForm, Panel, SelectField, Submit, TextArea } from "@/components/admin/form";
import { Badge, PageTitle, syncTone } from "@/components/admin/ui";
import { IconWhatsApp } from "@/components/icons";
import { buttonClass } from "@/components/ui/button";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";
import { isUuid } from "@/lib/admin-guard";
import { requireAdmin } from "@/lib/auth";
import { INQUIRY_STATUS_LABEL, SYNC_STATUS_LABEL } from "@/lib/inquiry-options";
import { INQUIRY_STATUSES } from "@/lib/inquiry-query";
import { formatDateTime, waLink } from "@/lib/utils";
import { deleteInquiry, resyncInquiry, updateInquiry } from "../actions";
import { ResyncButton } from "./resync-button";

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [inq] = await getDb().select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
  if (!inq) notFound();
  const firstName = inq.name.split(" ")[0];
  const waText = `Halo ${firstName}, kami dari Deflected menindaklanjuti permintaan penawaran Anda (${inq.ref}).`;
  const facts = [
    ["Perusahaan", inq.company || "Perorangan"],
    ["WhatsApp", `+${inq.whatsapp}`],
    ["Email", inq.email || "-"],
    ["Jenis produk", inq.productTypes.join(", ")],
    ["Jumlah", inq.quantity],
    ["Bahan", inq.material || "Belum ditentukan"],
    ["Finishing", inq.finishing.join(", ") || "-"],
    ["Target waktu", inq.targetDate || "-"],
  ];
  return (
    <>
      <PageTitle title={inq.name} description={`${inq.ref} · masuk ${formatDateTime(inq.createdAt)}`} back={{ href: "/admin/inquiry", label: "Kembali ke inquiry" }} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel
            title="Detail permintaan"
            actions={
              <a href={waLink(inq.whatsapp, waText)} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
                <IconWhatsApp className="size-[18px]" />
                <span>Balas via WhatsApp</span>
              </a>
            }
          >
            <dl className="divide-y divide-line">
              {facts.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2.5 sm:grid-cols-[140px_1fr]">
                  <dt className="text-sm font-semibold text-text-2">{k}</dt>
                  <dd className="text-sm text-ink">{k === "Email" && v !== "-" ? <a className="text-blue-strong underline" href={`mailto:${v}`}>{v}</a> : v}</dd>
                </div>
              ))}
            </dl>
            {inq.notes && (
              <div className="mt-4 rounded-sm bg-mist p-4">
                <p className="text-sm font-semibold text-text-2">Catatan pelanggan</p>
                <p className="mt-1 text-sm whitespace-pre-line text-ink">{inq.notes}</p>
              </div>
            )}
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Tindak lanjut">
            <ActionForm action={updateInquiry.bind(null, inq.id)} className="space-y-4">
              <SelectField label="Status" name="status" defaultValue={inq.status} options={INQUIRY_STATUSES.map((s) => ({ value: s, label: INQUIRY_STATUS_LABEL[s] }))} />
              <TextArea label="Catatan internal" name="adminNotes" rows={4} maxLength={3000} defaultValue={inq.adminNotes} hint="Tidak terlihat oleh pelanggan." />
              <Submit>Simpan</Submit>
            </ActionForm>
          </Panel>
          <Panel title="Google Sheets">
            <div className="flex items-center gap-2">
              <Badge tone={syncTone(inq.sheetStatus)}>{SYNC_STATUS_LABEL[inq.sheetStatus]}</Badge>
              <span className="text-sm text-text-2">{inq.sheetAttempts} percobaan</span>
            </div>
            {inq.sheetSyncedAt && <p className="mt-2 text-sm text-text-2">Tersinkron {formatDateTime(inq.sheetSyncedAt)}</p>}
            {inq.sheetLastError && <p className="mt-2 rounded-sm bg-danger-soft p-3 text-[0.8rem] break-words text-danger">{inq.sheetLastError}</p>}
            {inq.sheetStatus !== "synced" && <ResyncButton action={resyncInquiry.bind(null, inq.id)} />}
          </Panel>
          {user.role === "owner" && (
            <Panel title="Hapus data" description="Untuk permintaan penghapusan data dari pelanggan. Baris di Google Sheets perlu dihapus manual.">
              <DangerButton action={deleteInquiry.bind(null, inq.id)} confirmText={`Hapus inquiry ${inq.ref} secara permanen?`}>
                Hapus inquiry
              </DangerButton>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
