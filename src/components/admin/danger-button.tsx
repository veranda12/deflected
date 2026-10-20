"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/admin-guard";

export function DangerButton({ action, confirmText, children }: { action: () => Promise<ActionResult>; confirmText: string; children: React.ReactNode }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(confirmText)) return;
          start(async () => {
            const res = await action();
            if (res && !res.ok) setMsg(res.message);
          });
        }}
        className="h-11 rounded-sm border border-danger/40 px-4 text-sm font-semibold text-danger hover:bg-danger hover:text-white disabled:opacity-50"
      >
        {pending ? "Memproses..." : children}
      </button>
      {msg && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {msg}
        </p>
      )}
    </div>
  );
}
