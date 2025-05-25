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
    <div className="fixed right-40 top-1/2 transform -translate-y-1/2 z-40 flex flex-col items-center">
      <div className={`w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center border-4 ${darkMode? 'border-slate-700':'border-green-600'}`}>
        <span className={`text-2xl font-bold ${darkMode? 'text-slate-700':'text-green-800'}`}>{check_moves}</span>
      </div>
      <div className={`mt-2 bg-white/80 backdrop-blur-sm p-2 px-3 rounded-lg shadow-md`}>
        <span className={`text-sm ${darkMode? 'text-slate-800':'text-green-800'} font-medium`}>{t.chess_moves}</span>
      </div>
    </div>
  );
}