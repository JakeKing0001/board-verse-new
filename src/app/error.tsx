"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled BoardVerse page error:", error);
  }, [error]);

  return (
    <main className="bv-page flex min-h-screen items-center justify-center p-6 text-[var(--bv-text)]">
      <div className="bv-glass bv-liquid w-full max-w-md rounded-3xl border border-red-400/20 p-8 text-center shadow-2xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
          Errore imprevisto
        </p>
        <h1 className="mt-3 text-3xl font-black">Qualcosa non ha funzionato</h1>
        <p className="mt-3 text-slate-300">
          Riprova: i tuoi dati non sono stati cancellati.
        </p>
        <button
          type="button"
          onClick={reset}
          className="bv-button-primary mt-6 px-5"
        >
          Riprova
        </button>
      </div>
    </main>
  );
}
