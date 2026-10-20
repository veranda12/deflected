import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PageTitle({ title, description, actions, back }: { title: string; description?: string; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="text-sm font-semibold text-blue-strong hover:underline">
          {back.label}
        </Link>
      )}
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.01em] text-ink">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-text-2">{description}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger" | "info"; children: ReactNode }) {
  const tones = {
    neutral: "bg-cloud text-ink",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    info: "bg-blue-soft text-blue-strong",
  };
  return <span className={cn("inline-flex items-center rounded-xs px-2 py-0.5 text-[0.75rem] font-semibold whitespace-nowrap", tones[tone])}>{children}</span>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-white px-6 py-14 text-center">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-2">{body}</p>
      {action && (
        <Link href={action.href} className={buttonClass("dark", "md", "mt-5")}>
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line bg-mist text-[0.78rem] text-text-2">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export const filterInput =
  "h-11 rounded-sm border border-line bg-white px-3.5 text-sm text-ink placeholder:text-text-3 focus:border-blue focus:outline-none";

export const statusTone = (s: string) =>
  (({ baru: "warning", dihubungi: "info", penawaran_dikirim: "info", deal: "success", batal: "neutral" }) as const)[s as "baru"] ?? "neutral";
export const syncTone = (s: string) => (({ synced: "success", failed: "danger", pending: "warning", syncing: "info", disabled: "neutral" }) as const)[s as "synced"] ?? "neutral";
