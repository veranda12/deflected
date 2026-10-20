"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/admin-guard";

export function ResyncButton({ action }: { action: () => Promise<ActionResult> }) {
  const [pending, start] = useTransition();
  const [res, setRes] = useState<ActionResult | null>(null);
  const router = useRouter();
  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={pending}
        className={buttonClass("outline")}
        onClick={() =>
          start(async () => {
            setRes(await action());
            router.refresh();
          })
        }
      >
        {pending ? "Menyinkronkan..." : "Sinkronkan ulang"}
      </button>
      {res?.message && (
        <p role={res.ok ? "status" : "alert"} className={`mt-2 text-sm ${res.ok ? "text-success" : "text-danger"}`}>
          {res.message}
        </p>
      )}
    </div>
  );
}
