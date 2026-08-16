import { getLegalMoveTargets } from '../lib/chessView';

const MOVE_HIGHLIGHT_CLASSES = [
    'move-quiet',
    'move-capture',
    'move-en-passant',
    'move-castle',
] as const;

let castlingWhite = true;
let castlingBlack = true;

/**
 * Kept for compatibility with the board state. En passant is encoded directly
 * in the FEN and is therefore evaluated by chess.js instead of a DOM flag.
 */
export function getEnpassant(_passant: boolean | null): void {
    void _passant;
    // Intentionally empty: chess.js reads the en-passant target from the FEN.
}

export function getWhiteCastling(): boolean {
    return castlingWhite;
}

export function getBlackCastling(): boolean {
    return castlingBlack;
}

export function setWhiteCastling(value: boolean): void {
    castlingWhite = value;
}

export function setBlackCastling(value: boolean): void {
    castlingBlack = value;
}

export function clearMoveHighlights(): void {
    document.querySelectorAll<HTMLElement>('.board-square').forEach((square) => {
        square.classList.remove(...MOVE_HIGHLIGHT_CLASSES);
        square.style.pointerEvents = 'auto';
    });
}

/**
 * Highlights every legal destination for a piece using the current FEN.
 * This intentionally does not infer moves from images or mutate React-owned
 * nodes: chess.js remains the single source of truth for every game mode.
 */
export function showPiece(
    square: string,
    _isWhite: boolean,
    _lastMove: string | null,
    fen: string,
): NodeListOf<HTMLDivElement> {
    clearMoveHighlights();

    const moves = getLegalMoveTargets(fen, square);

    moves.forEach((move) => {
        const target = document.getElementById(move.square);
        if (!target) return;

        target.classList.add(`move-${move.highlight}`);
    });

    return document.querySelectorAll<HTMLDivElement>(
        '.board-square.move-quiet, .board-square.move-capture, .board-square.move-en-passant, .board-square.move-castle',
    );
}
