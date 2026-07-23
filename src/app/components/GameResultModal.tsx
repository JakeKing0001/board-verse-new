"use client";

import { RotateCcw, Trophy, X } from "lucide-react";
import type { ReactNode } from "react";
import clsx from "clsx";
import { usePieceContext } from "./PieceContext";

interface GameResultModalProps {
  title: string;
  description: ReactNode;
  primaryLabel: string;
  onPrimary: () => void | Promise<void>;
  secondaryLabel?: string;
  onSecondary?: () => void | Promise<void>;
  celebration?: boolean;
}

const CONFETTI = Array.from({ length: 28 }, (_, index) => ({
  left: `${(index * 37 + 11) % 100}%`,
  size: 5 + ((index * 7) % 8),
  delay: `${((index * 13) % 20) / 10}s`,
  duration: `${2.4 + ((index * 11) % 20) / 10}s`,
  rotate: `${(index * 47) % 180}deg`,
}));

export default function GameResultModal({
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  celebration = true,
}: GameResultModalProps) {
  const { darkMode } = usePieceContext();
  const confettiColors = !darkMode
    ? ["#166534", "#22c55e", "#f59e0b", "#f8fafc"]
    : ["#c4b5fd", "#34d399", "#fbbf24", "#f8fafc"];

  return (
    <div
      className="bv-modal-backdrop fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-result-title"
    >
      <section
        className={clsx(
          "bv-glass-strong bv-liquid relative w-full max-w-md overflow-hidden rounded-[2rem] border p-6 shadow-2xl sm:p-8",
          "animate-fade-in",
          !darkMode
            ? "border-white/80 bg-gradient-to-br from-white via-emerald-50 to-amber-50 text-slate-900"
            : "border-violet-400/20 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white",
        )}
      >
        <div
          aria-hidden="true"
          className={clsx(
            "absolute -right-24 -top-24 h-60 w-60 rounded-full blur-3xl",
            !darkMode ? "bg-emerald-300/30" : "bg-violet-500/25",
          )}
        />

        {celebration && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
          >
            {CONFETTI.map((item, index) => (
              <span
                key={index}
                className="absolute -top-4 animate-fall rounded-sm"
                style={{
                  left: item.left,
                  width: item.size,
                  height: item.size * 1.7,
                  animationDelay: item.delay,
                  animationDuration: item.duration,
                  backgroundColor: confettiColors[index % confettiColors.length],
                  transform: `rotate(${item.rotate})`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10">
          <div
            className={clsx(
              "mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg",
              !darkMode
                ? "bg-emerald-700 text-white"
                : "bg-gradient-to-br from-violet-400 to-emerald-400 text-slate-950 shadow-violet-500/25",
            )}
          >
            <Trophy className="h-8 w-8" aria-hidden="true" />
          </div>

          <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] opacity-55">
            BoardVerse
          </p>
          <h2
            id="game-result-title"
            className="text-3xl font-black tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          <div className="mt-3 text-base leading-relaxed opacity-80 sm:text-lg">
            {description}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
            {secondaryLabel && onSecondary && (
              <button
                type="button"
                onClick={onSecondary}
                className={clsx(
                  "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border px-5 py-3 font-bold transition-colors",
                  !darkMode
                    ? "border-slate-200 bg-white hover:bg-slate-50"
                    : "border-white/10 bg-white/5 hover:bg-white/10",
                )}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                {secondaryLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onPrimary}
              className={clsx(
                "inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 font-black shadow-lg transition-transform hover:-translate-y-0.5",
                !darkMode
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "bg-gradient-to-r from-violet-400 to-emerald-400 text-slate-950 hover:from-violet-300 hover:to-emerald-300",
              )}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {primaryLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
