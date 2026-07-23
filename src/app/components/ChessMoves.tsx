import React from 'react';
import { usePieceContext } from './PieceContext';

/**
 * Displays the current number of chess moves in a styled floating widget.
 *
 * @param check_moves - The number of chess moves to display.
 * @returns A fixed-positioned React component showing the move count and a label, styled according to the current theme.
 *
 * @remarks
 * - Uses `usePieceContext` to access translation and dark mode state.
 * - The component is visually emphasized with blur, shadow, and border effects.
 * - The label text is internationalized via the `t.chess_moves` property.
 */
export default function ChessMoves({ check_moves }: { check_moves: number }) {

  const { t, darkMode } = usePieceContext();

  return (
    <div className="bv-glass-strong fixed bottom-3 right-3 z-40 flex items-center gap-2 rounded-2xl p-2 sm:bottom-auto sm:right-8 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${darkMode? 'border-violet-400/30':'border-emerald-500/30'}`}>
        <span className="text-xl font-black text-[var(--bv-text)]">{check_moves}</span>
      </div>
      <div className="px-2 py-1">
        <span className="text-xs font-black text-[var(--bv-muted)]">{t.chess_moves}</span>
      </div>
    </div>
  );
}
