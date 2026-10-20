import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark, Wordmark } from "@/components/logo";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk | Admin Deflected", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="on-dark relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-end gap-3">
          <LogoMark className="h-12 w-auto text-blue" />
          <Wordmark className="h-6 w-auto" />
        </div>
        <LogoMark className="absolute -right-24 -bottom-24 h-[70%] w-auto text-navy-800" />
        <p className="relative max-w-sm font-display text-5xl leading-[0.95]">
          Panel admin<span className="text-amber">.</span>
        </p>
      </div>
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="flex items-end gap-2 text-ink lg:hidden">
            <LogoMark className="h-10 w-auto text-blue" />
            <Wordmark className="h-5 w-auto" />
          </div>
          <h1 className="mt-8 text-2xl font-semibold text-ink lg:mt-0">Masuk ke admin</h1>
          <p className="mt-2 text-sm text-text-2">Khusus staf Deflected.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
