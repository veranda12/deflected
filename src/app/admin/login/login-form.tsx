"use client";

import { useActionState } from "react";
import { buttonClass } from "@/components/ui/button";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="mt-8 space-y-5">
      {state.error && (
        <p role="alert" className="rounded-sm bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="text-sm font-medium text-ink">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={200}
          className="mt-2 block h-12 w-full rounded-sm border border-line px-4 text-ink focus:border-blue focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={128}
          className="mt-2 block h-12 w-full rounded-sm border border-line px-4 text-ink focus:border-blue focus:outline-none"
        />
      </label>
      <button type="submit" disabled={pending} className={buttonClass("dark", "lg", "w-full")}>
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
