import { Chess, type Square } from "chess.js";

export const STANDARD_START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface ReplayableMove {
  from_sq: string;
  to_sq: string;
  promotion?: string | null;
  ply?: number;
}

export interface ChessPosition {
  fen: string;
  board: string[][];
  turn: "w" | "b";
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
}

export const parseFenBoard = (fen: string): string[][] => {
  const boardPart = fen.trim().split(/\s+/)[0];
  const rows = boardPart?.split("/") ?? [];

  if (rows.length !== 8) {
    throw new Error("Invalid FEN: expected eight ranks");
  }

  return rows.map((row) => {
    const parsedRow: string[] = [];
    for (const symbol of row) {
      if (/^[1-8]$/.test(symbol)) {
        parsedRow.push(...Array(Number(symbol)).fill(""));
      } else if (/^[prnbqkPRNBQK]$/.test(symbol)) {
        parsedRow.push(symbol);
      } else {
        throw new Error(`Invalid FEN symbol: ${symbol}`);
      }
    }
    if (parsedRow.length !== 8) {
      throw new Error("Invalid FEN: each rank must contain eight squares");
    }
    return parsedRow;
  });
};

export const replayStoredMoves = (
  initialFen: string,
  moves: ReplayableMove[],
): ChessPosition => {
  const chess = new Chess(initialFen);

  for (const [index, move] of moves.entries()) {
    try {
      const result = chess.move({
        from: move.from_sq as Square,
        to: move.to_sq as Square,
        promotion: move.promotion || undefined,
      });
      if (!result) throw new Error("move rejected");
    } catch (error) {
      const ply = move.ply ?? index + 1;
      throw new Error(
        `Invalid stored move at ply ${ply}: ${move.from_sq}${move.to_sq}`,
        { cause: error },
      );
    }
  }

  const fen = chess.fen();
  return {
    fen,
    board: parseFenBoard(fen),
    turn: chess.turn(),
    isCheck: chess.isCheck(),
    isCheckmate: chess.isCheckmate(),
    isDraw: chess.isDraw(),
  };
};
