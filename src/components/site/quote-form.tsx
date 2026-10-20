"use client";

import Link from "next/link";
import { startTransition, useActionState, useEffect, useId, useRef, useState } from "react";
import { submitInquiry, type InquiryState } from "@/app/(site)/kontak/actions";
import { IconCheck, IconChevron, IconWhatsApp } from "@/components/icons";
import { buttonClass } from "@/components/ui/button";
import { FINISHING_OPTIONS, OTHER_PRODUCT, QUANTITY_OPTIONS } from "@/lib/inquiry-options";
import { cn } from "@/lib/utils";

type Props = {
  formToken: string;
  productOptions: string[];
  materialOptions: string[];
  preselectProduct?: string;
};

export function QuoteForm({ formToken, productOptions, materialOptions, preselectProduct }: Props) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, { status: "idle" });
  const [moreOpen, setMoreOpen] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const moreId = useId();
  const errors = state.status === "error" ? (state.errors ?? {}) : {};

  useEffect(() => {
    if (state.status === "error") errorRef.current?.focus();
    if (state.status === "success") successRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} className="rounded-lg bg-ink p-8 text-white outline-none sm:p-10 on-dark" role="status">
        <span className="grid size-12 place-items-center rounded-sm bg-blue">
          <IconCheck className="size-6" />
        </span>
        <h3 className="display-md mt-6">Permintaan Anda sudah kami terima</h3>
        <p className="mt-4 max-w-lg leading-relaxed text-on-dark-2">
          Nomor referensi Anda <strong className="font-semibold text-white">{state.ref}</strong>. Data sudah tersimpan di sistem kami dan tim
          Deflected akan menghubungi Anda lewat WhatsApp untuk membahas detailnya.
        </p>
        <p className="mt-3 max-w-lg text-[0.92rem] text-on-dark-2">Ingin langsung mulai percakapan? Kirim ringkasan permintaan ini ke WhatsApp kami.</p>
        <a href={state.waUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("light", "lg", "mt-7")}>
          <IconWhatsApp className="size-5 text-[#1f8f4e]" />
          <span>Lanjutkan ke WhatsApp</span>
        </a>
      </div>
    );
  }

  return (
    <form
      action={action}
      noValidate
      className="space-y-10"
      aria-describedby="form-note"
      onSubmit={(e) => {
        // Keep the visitor's answers if validation fails (React resets <form action> forms after completion).
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
    >
      <input type="hidden" name="formToken" value={formToken} />
      <input type="hidden" name="sourcePath" value="/kontak" />
      {/* Honeypot, hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && (
        <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-sm border border-danger/30 bg-danger-soft px-4 py-3 text-[0.92rem] text-danger outline-none">
          {state.message}
        </div>
      )}

      <fieldset>
        <legend className="text-[1.05rem] font-semibold text-ink">
          <span className="mr-2 font-display text-xl text-blue">01</span>Data kontak
        </legend>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nama lengkap" name="name" required autoComplete="name" error={errors.name} placeholder="Nama Anda" />
          <Field label="Perusahaan atau organisasi" name="company" autoComplete="organization" error={errors.company} placeholder="Opsional" />
          <Field
            label="Nomor WhatsApp"
            name="whatsapp"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            error={errors.whatsapp}
            placeholder="08xx xxxx xxxx"
          />
          <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} placeholder="Opsional" />
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[1.05rem] font-semibold text-ink">
          <span className="mr-2 font-display text-xl text-blue">02</span>Kebutuhan produksi
        </legend>
        <div className="mt-5">
          <p className="text-sm font-medium text-ink" id="pt-label">
            Jenis produk <span className="text-danger">*</span> <span className="font-normal text-text-3">(boleh lebih dari satu)</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby="pt-label" aria-describedby={errors.productTypes ? "pt-err" : undefined}>
            {[...productOptions, OTHER_PRODUCT].map((p) => (
              <Chip key={p} type="checkbox" name="productTypes" value={p} defaultChecked={preselectProduct === p} label={p} />
            ))}
          </div>
          {errors.productTypes && <FieldError id="pt-err">{errors.productTypes}</FieldError>}
        </div>
        <div className="mt-7">
          <p className="text-sm font-medium text-ink" id="qty-label">
            Perkiraan jumlah <span className="text-danger">*</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-labelledby="qty-label" aria-describedby={errors.quantity ? "qty-err" : undefined}>
            {QUANTITY_OPTIONS.map((q) => (
              <Chip key={q} type="radio" name="quantity" value={q} label={q} />
            ))}
          </div>
          {errors.quantity && <FieldError id="qty-err">{errors.quantity}</FieldError>}
        </div>
      </fieldset>

      {/* Progressive disclosure: optional details stay collapsed so the form feels short. */}
      <div className="rounded-md border border-line">
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-controls={moreId}
          onClick={() => setMoreOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span>
            <span className="block font-semibold text-ink">
              <span className="mr-2 font-display text-xl text-blue">03</span>Detail tambahan
            </span>
            <span className="mt-0.5 block text-[0.88rem] text-text-2">Bahan, finishing, target waktu, dan catatan. Opsional, tapi membantu kami menyiapkan penawaran.</span>
          </span>
          <IconChevron className={cn("size-5 shrink-0 transition-transform duration-300", moreOpen && "rotate-180")} />
        </button>
        <div id={moreId} className="accordion-panel" data-open={moreOpen}>
          <div>
            <div className="space-y-6 border-t border-line px-5 pt-5 pb-6" inert={!moreOpen}>
              <label className="block">
                <span className="text-sm font-medium text-ink">Pilihan bahan</span>
                <select name="material" defaultValue="" className={inputClass(false)}>
                  <option value="">Belum tahu, butuh rekomendasi</option>
                  {materialOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <p className="text-sm font-medium text-ink" id="fin-label">
                  Preferensi finishing
                </p>
                <div className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby="fin-label">
                  {FINISHING_OPTIONS.map((f) => (
                    <Chip key={f} type="checkbox" name="finishing" value={f} label={f} />
                  ))}
                </div>
              </div>
              <Field label="Target waktu selesai" name="targetDate" error={errors.targetDate} placeholder="Contoh: akhir November 2026, untuk acara 5 Desember" />
              <label className="block">
                <span className="text-sm font-medium text-ink">Catatan</span>
                <textarea
                  name="notes"
                  rows={4}
                  maxLength={2000}
                  placeholder="Warna, ukuran, referensi desain, atau hal lain yang perlu kami tahu"
                  className={cn(inputClass(!!errors.notes), "h-auto py-3")}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 border-t border-line pt-6">
        <label className="flex items-start gap-3 text-[0.92rem] text-text-2">
          <input type="checkbox" name="consent" className="mt-1 size-5 shrink-0 accent-[var(--color-blue)]" aria-describedby={errors.consent ? "consent-err" : undefined} />
          <span>
            Saya setuju data ini dipakai Deflected untuk menindaklanjuti permintaan saya, sesuai{" "}
            <Link href="/kebijakan-privasi" className="font-medium text-blue-strong underline">
              kebijakan privasi
            </Link>
            .
          </span>
        </label>
        {errors.consent && <FieldError id="consent-err">{errors.consent}</FieldError>}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p id="form-note" className="text-[0.85rem] text-text-3">
            Kolom bertanda <span className="text-danger">*</span> wajib diisi.
          </p>
          <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "sm:min-w-56")}>
            {pending ? "Mengirim..." : "Kirim permintaan penawaran"}
          </button>
        </div>
      </div>
    </form>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    "mt-2 block h-12 w-full rounded-sm border bg-white px-4 text-[0.95rem] text-ink placeholder:text-text-3 focus:border-blue focus:outline-none",
    invalid ? "border-danger" : "border-line",
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-2 text-[0.85rem] font-medium text-danger">
      {children}
    </p>
  );
}

function Field({
  label,
  name,
  error,
  required,
  ...rest
}: { label: string; name: string; error?: string; required?: boolean } & React.ComponentProps<"input">) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={id}
        name={name}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={inputClass(!!error)}
        {...rest}
      />
      {error && <FieldError id={`${id}-err`}>{error}</FieldError>}
    </div>
  );
}

function Chip({ label, ...input }: { label: string } & React.ComponentProps<"input">) {
  return (
    <label className="cursor-pointer">
      <input {...input} className="peer sr-only" />
      <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-[0.9rem] text-ink transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue hover:border-ink">
        {label}
      </span>
    </label>
  );
}
