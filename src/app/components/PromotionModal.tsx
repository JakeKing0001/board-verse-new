import Image from 'next/image';
import React from 'react';
import { usePieceContext } from './PieceContext';

interface PromotionModalProps {
  onPromotionComplete: (piece: string) => void;
  isWhite: boolean;
}

const promotionPieces = [
  { value: 'q', label: 'Donna' },
  { value: 'r', label: 'Torre' },
  { value: 'b', label: 'Alfiere' },
  { value: 'n', label: 'Cavallo' },
] as const;

const PromotionModal: React.FC<PromotionModalProps> = ({ onPromotionComplete, isWhite }) => {
  const { darkMode } = usePieceContext();

  return (
    <div
      className="bv-modal-backdrop fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promotion-title"
    >
      <section className="bv-glass-strong bv-liquid w-full max-w-sm rounded-[2rem] p-5 text-[var(--bv-text)] shadow-2xl sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">BoardVerse</p>
        <h2 id="promotion-title" className="mt-2 text-2xl font-black">Scegli la promozione</h2>
        <p className="mt-1 text-sm text-[var(--bv-muted)]">Il pedone ha raggiunto l’ultima traversa.</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {promotionPieces.map((piece) => (
            <button
              key={piece.value}
              type="button"
              onClick={() => onPromotionComplete(piece.value)}
              className={`group flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border transition hover:-translate-y-1 ${
                darkMode
                  ? 'border-white/10 bg-white/5 hover:bg-white/10'
                  : 'border-black/5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Promuovi a ${piece.label}`}
            >
              <Image
                src={`https://www.chess.com/chess-themes/pieces/neo/150/${isWhite ? 'w' : 'b'}${piece.value}.png`}
                alt=""
                width={62}
                height={62}
                className="h-14 w-14 object-contain transition-transform group-hover:scale-110"
              />
              <span className="text-sm font-black">{piece.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PromotionModal;
