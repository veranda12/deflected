"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, type ComponentProps, type ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/admin-guard";
import { cn } from "@/lib/utils";

const ErrorsCtx = createContext<Record<string, string>>({});
const PendingCtx = createContext(false);

type Action = (prev: ActionResult, fd: FormData) => Promise<ActionResult>;

/** Form bound to an admin Server Action, with inline success/error feedback and field errors. */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess,
  confirm,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, { ok: true, message: "" });
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && state.message && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <PendingCtx.Provider value={pending}>
    <ErrorsCtx.Provider value={state.errors ?? {}}>
      <form
        ref={ref}
        action={formAction}
        className={className}
        onSubmit={(e) => {
          // Submitting manually keeps typed values when validation fails
          // (React resets uncontrolled forms after a <form action> completes).
          e.preventDefault();
          if (confirm && !window.confirm(confirm)) return;
          const fd = new FormData(e.currentTarget);
          startTransition(() => formAction(fd));
        }}
      >
        {children}
        {state.message && (
          <p
            role={state.ok ? "status" : "alert"}
            className={cn("mt-4 rounded-sm px-4 py-3 text-sm", state.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}
          >
            {state.message}
          </p>
        )}
      </form>
    </ErrorsCtx.Provider>
    </PendingCtx.Provider>
  );
}

export function Submit({ children, variant = "dark", className }: { children: ReactNode; variant?: "dark" | "primary" | "outline"; className?: string }) {
  const pending = useContext(PendingCtx);
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant, "md", className)}>
      {pending ? "Menyimpan..." : children}
    </button>
  );
}

const inputBase =
  "mt-1.5 block w-full rounded-sm border bg-white px-3.5 text-[0.92rem] text-ink placeholder:text-text-3 focus:border-blue focus:outline-none disabled:bg-mist";

function useFieldError(name?: string) {
  const errors = useContext(ErrorsCtx);
  return name ? errors[name] : undefined;
}

function Label({ label, hint, required, error, children, id }: { label: string; hint?: string; required?: boolean; error?: string; children: ReactNode; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="text-[0.85rem] font-semibold text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-[0.8rem] text-text-3">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-[0.8rem] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, hint, name, className, ...rest }: { label: string; hint?: string; name: string } & ComponentProps<"input">) {
  const error = useFieldError(name);
  const id = `af-${name}`;
  return (
    <div className={className}>
      <Label label={label} hint={hint} required={rest.required} error={error} id={id}>
        <input id={id} name={name} aria-invalid={!!error} className={cn(inputBase, "h-11", error ? "border-danger" : "border-line")} {...rest} />
      </Label>
    </div>
  );
}

export function TextArea({ label, hint, name, className, rows = 4, ...rest }: { label: string; hint?: string; name: string } & ComponentProps<"textarea">) {
  const error = useFieldError(name);
  const id = `af-${name}`;
  return (
    <div className={className}>
      <Label label={label} hint={hint} required={rest.required} error={error} id={id}>
        <textarea id={id} name={name} rows={rows} aria-invalid={!!error} className={cn(inputBase, "py-2.5 leading-relaxed", error ? "border-danger" : "border-line")} {...rest} />
      </Label>
    </div>
  );
}

export function SelectField({
  label,
  hint,
  name,
  options,
  className,
  ...rest
}: { label: string; hint?: string; name: string; options: { value: string; label: string }[] } & ComponentProps<"select">) {
  const error = useFieldError(name);
  const id = `af-${name}`;
  return (
    <div className={className}>
      <Label label={label} hint={hint} required={rest.required} error={error} id={id}>
        <select id={id} name={name} className={cn(inputBase, "h-11", error ? "border-danger" : "border-line")} {...rest}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Label>
    </div>
  );
}

export function Toggle({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-5 accent-[var(--color-blue)]" />
      <span>
        <span className="block text-[0.9rem] font-semibold text-ink">{label}</span>
        {hint && <span className="block text-[0.8rem] text-text-3">{hint}</span>}
      </span>
    </label>
  );
}

export function Panel({ title, description, children, actions }: { title: string; description?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-[1rem] font-semibold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-[0.85rem] text-text-2">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}
