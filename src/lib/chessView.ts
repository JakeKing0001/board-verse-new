import { Chess, type Square } from 'chess.js';

export type MoveHighlight = 'quiet' | 'capture' | 'en-passant' | 'castle';

export interface LegalMoveTarget {
  square: Square;
  highlight: MoveHighlight;
}

/**
 * Derives the legal destinations used by every board renderer.
 * Keeping this outside the DOM guarantees that 2D and 3D always present the
 * same moves from the same FEN.
 */
export function getLegalMoveTargets(
  fen: string,
  square: string,
): LegalMoveTarget[] {
  try {
    const chess = new Chess(fen);
    return chess
      .moves({ square: square as Square, verbose: true })
      .map((move) => ({
        square: move.to,
        highlight: move.isEnPassant()
          ? 'en-passant'
          : move.isCapture()
            ? 'capture'
            : move.isKingsideCastle() || move.isQueensideCastle()
              ? 'castle'
              : 'quiet',
      }));
  } catch {
    return [];
  }
}
