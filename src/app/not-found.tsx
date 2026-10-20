import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { buttonClass } from "@/components/ui/button";

export const metadata = { title: "Halaman tidak ditemukan | Deflected Apparel", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-4 text-white on-dark">
      <div className="max-w-lg text-center">
        <LogoMark className="mx-auto h-20 w-auto text-blue" />
        <p className="mt-8 font-display text-[6rem] leading-none text-amber">404</p>
        <h1 className="display-md mt-2">Halaman ini tidak ditemukan</h1>
        <p className="mt-4 text-on-dark-2">Tautannya mungkin sudah berubah atau produk sudah tidak ditampilkan. Coba mulai dari katalog.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/katalog" className={buttonClass("primary", "lg")}>
            Buka katalog
          </Link>
          <Link href="/" className={buttonClass("outline-light", "lg")}>
            Ke beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
