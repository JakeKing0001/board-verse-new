import { Chess } from "chess.js";

const chess = new Chess();

/**
 * Determines if the king of the specified color is currently in check.
 *
 * This function scans the board to find the king's position, then checks all possible
 * directions and patterns for enemy pieces that could threaten the king:
 * - Vertical and horizontal (rook and queen)
 * - Diagonal (bishop and queen)
 * - Knight moves
 * - Pawn attacks
 * - Adjacent enemy king
 *
 * The function relies on DOM queries to identify piece positions and types.
 *
 * @param isWhite - `true` to check if the white king is in check, `false` for the black king.
 * @returns `true` if the specified king is in check, otherwise `false`.
 */
export function getCheck(fen: string): boolean {

    chess.load(fen);
    return chess.isCheck();
}

export function getCheckmate(fen: string): boolean {
    chess.load(fen);
    return chess.isCheckmate();
}

export function getDraw(fen: string): boolean {
    chess.load(fen);
    return chess.isDraw();
}

export function getStalemate(fen: string): boolean {
    chess.load(fen);
    return chess.isStalemate();
}

export function getInsufficientMaterial(fen: string): boolean {
    chess.load(fen);
    return chess.isInsufficientMaterial();
}

export function getThreefoldRepetition(fen: string): boolean {
    chess.load(fen);
    return chess.isThreefoldRepetition();
}