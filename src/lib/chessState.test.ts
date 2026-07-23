import { describe, expect, it } from "vitest";
import {
  parseFenBoard,
  replayStoredMoves,
  STANDARD_START_FEN,
} from "./chessState";

describe("chess state", () => {
  it("parses a complete FEN board", () => {
    const board = parseFenBoard(STANDARD_START_FEN);

    expect(board).toHaveLength(8);
    expect(board[0]).toEqual(["r", "n", "b", "q", "k", "b", "n", "r"]);
    expect(board[6]).toEqual(["P", "P", "P", "P", "P", "P", "P", "P"]);
  });

  it("replays moves and derives the turn from chess.js", () => {
    const position = replayStoredMoves(STANDARD_START_FEN, [
      { from_sq: "e2", to_sq: "e4", ply: 1 },
      { from_sq: "e7", to_sq: "e5", ply: 2 },
      { from_sq: "g1", to_sq: "f3", ply: 3 },
    ]);

    expect(position.turn).toBe("b");
    expect(position.board[4][4]).toBe("P");
    expect(position.board[5][5]).toBe("N");
  });

  it("handles castling without manual DOM moves", () => {
    const position = replayStoredMoves(
      "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
      [{ from_sq: "e1", to_sq: "g1" }],
    );

    expect(position.board[7][6]).toBe("K");
    expect(position.board[7][5]).toBe("R");
    expect(position.board[7][7]).toBe("");
  });

  it("handles en passant and promotion", () => {
    const enPassant = replayStoredMoves(
      "8/8/8/3pP3/8/8/8/4K2k w - d6 0 1",
      [{ from_sq: "e5", to_sq: "d6" }],
    );
    expect(enPassant.board[2][3]).toBe("P");
    expect(enPassant.board[3][3]).toBe("");

    const promotion = replayStoredMoves(
      "7k/P7/8/8/8/8/8/4K3 w - - 0 1",
      [{ from_sq: "a7", to_sq: "a8", promotion: "n" }],
    );
    expect(promotion.board[0][0]).toBe("N");
  });

  it("rejects an illegal stored history", () => {
    expect(() =>
      replayStoredMoves(STANDARD_START_FEN, [
        { from_sq: "e2", to_sq: "e5", ply: 1 },
      ]),
    ).toThrow("Invalid stored move at ply 1");
  });
});
