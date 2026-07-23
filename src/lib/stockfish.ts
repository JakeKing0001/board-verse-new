import { Chess, type PieceSymbol, type Square } from 'chess.js';
import { parseFenBoard } from './chessState';

const UCI_MOVE_PATTERN = /\b([a-h][1-8])([a-h][1-8])([qrbn])?\b/i;
const PIECE_VALUES: Record<PieceSymbol, number> = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20_000,
};
const CENTER_SQUARES = new Set(['c3', 'd3', 'e3', 'f3', 'c4', 'd4', 'e4', 'f4', 'c5', 'd5', 'e5', 'f5', 'c6', 'd6', 'e6', 'f6']);

export const STOCKFISH_LEVELS = [
    { level: 1, depth: 4, key: 'difficultyBeginner' },
    { level: 2, depth: 7, key: 'difficultyEasy' },
    { level: 3, depth: 10, key: 'difficultyIntermediate' },
    { level: 4, depth: 12, key: 'difficultyHard' },
    { level: 5, depth: 15, key: 'difficultyMaster' },
] as const;

export function normalizeStockfishDifficulty(value: unknown): number {
    const parsedValue = typeof value === 'string' || typeof value === 'number'
        ? Number(value)
        : 3;
    if (!Number.isFinite(parsedValue)) return 3;
    return Math.min(5, Math.max(1, Math.round(parsedValue)));
}

export function stockfishDepthForDifficulty(value: unknown): number {
    const difficulty = normalizeStockfishDifficulty(value);
    return STOCKFISH_LEVELS[difficulty - 1].depth;
}

export function extractUciMove(bestMove: unknown): string | null {
    if (typeof bestMove !== 'string') return null;

    const normalized = bestMove.trim().toLowerCase();
    const stockfishMatch = normalized.match(/\bbestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/i);
    if (stockfishMatch?.[1]) return stockfishMatch[1].toLowerCase();

    const bareMove = normalized.match(/^([a-h][1-8][a-h][1-8][qrbn]?)$/i);
    return bareMove?.[1]?.toLowerCase() ?? null;
}

export function parseUciMove(uciMove: string) {
    const match = uciMove.match(UCI_MOVE_PATTERN);
    if (!match || match[0].length !== uciMove.length) return null;

    return {
        from: match[1].toLowerCase() as Square,
        to: match[2].toLowerCase() as Square,
        promotion: match[3]?.toLowerCase() as PieceSymbol | undefined,
    };
}

export function isLegalUciMove(fen: string, uciMove: string): boolean {
    const parsedMove = parseUciMove(uciMove);
    if (!parsedMove) return false;

    try {
        const chess = new Chess(fen);
        return Boolean(chess.move(parsedMove));
    } catch {
        return false;
    }
}

export function applyUciMove(
    fen: string,
    uciMove: string,
    expectedColor?: 'w' | 'b',
) {
    const parsedMove = parseUciMove(uciMove);
    if (!parsedMove) {
        throw new Error('Il motore ha restituito una mossa UCI non valida.');
    }

    const chess = new Chess(fen);
    const move = chess.move(parsedMove);
    if (!move) {
        throw new Error('Il motore ha restituito una mossa non applicabile.');
    }
    if (expectedColor && move.color !== expectedColor) {
        throw new Error('Il motore ha provato a muovere un pezzo del colore sbagliato.');
    }

    const nextFen = chess.fen();
    return {
        fen: nextFen,
        board: parseFenBoard(nextFen),
        turn: chess.turn(),
        move,
        isCheck: chess.isCheck(),
        isCheckmate: chess.isCheckmate(),
        isDraw: chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial(),
    };
}

export function chooseFallbackMove(fen: string): string | null {
    const chess = new Chess(fen);
    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) return null;

    const rankedMoves = legalMoves.map((move) => {
        const nextPosition = new Chess(fen);
        nextPosition.move({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
        });

        let score = 0;
        if (move.captured) score += PIECE_VALUES[move.captured] * 10;
        if (move.promotion) score += PIECE_VALUES[move.promotion] * 8;
        if (move.isKingsideCastle() || move.isQueensideCastle()) score += 120;
        if (CENTER_SQUARES.has(move.to)) score += 18;
        if (nextPosition.isCheck()) score += 80;
        if (nextPosition.isCheckmate()) score += 1_000_000;

        const uciMove = `${move.from}${move.to}${move.promotion ?? ''}`;
        return { score, uciMove };
    });

    rankedMoves.sort((left, right) => (
        right.score - left.score || left.uciMove.localeCompare(right.uciMove)
    ));
    return rankedMoves[0].uciMove;
}
