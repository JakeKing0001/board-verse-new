import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bv-page flex min-h-screen items-center justify-center p-6 text-center text-[var(--bv-text)]">
      <div className="bv-glass bv-liquid w-full max-w-lg rounded-3xl p-8 sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-400">404</p>
        <h1 className="mt-3 text-4xl font-black">Pagina non trovata</h1>
        <p className="mt-3 text-slate-300">La posizione che cercavi non è più disponibile.</p>
        <Link
          href="/"
          className="bv-button-primary mt-7 px-5"
        >
          Torna alla home
        </Link>
      </div>
    </main>
  );
}
