import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import {
    applyUciMove,
    chooseFallbackMove,
    extractUciMove,
    isLegalUciMove,
    normalizeStockfishDifficulty,
    parseUciMove,
    stockfishDepthForDifficulty,
} from './stockfish';

describe('Stockfish helpers', () => {
    it('estrae la mossa UCI dalla risposta del servizio', () => {
        expect(extractUciMove('bestmove b7b6 ponder f3e5')).toBe('b7b6');
        expect(extractUciMove('e7e8q')).toBe('e7e8q');
        expect(extractUciMove('No best move')).toBeNull();
    });

    it('rifiuta mosse non valide per la posizione corrente', () => {
        const startFen = new Chess().fen();
        expect(isLegalUciMove(startFen, 'e2e4')).toBe(true);
        expect(isLegalUciMove(startFen, 'e2e5')).toBe(false);
        expect(isLegalUciMove(startFen, 'test')).toBe(false);
    });

    it('produce sempre una mossa legale quando il servizio non risponde', () => {
        const position = new Chess();
        position.move('e4');
        const fallbackMove = chooseFallbackMove(position.fen());

        expect(fallbackMove).not.toBeNull();
        expect(isLegalUciMove(position.fen(), fallbackMove!)).toBe(true);
    });

    it('preferisce uno scacco matto immediato nel fallback locale', () => {
        const fen = '7k/5Q2/6K1/8/8/8/8/8 w - - 0 1';
        const fallbackMove = chooseFallbackMove(fen);
        const parsedMove = fallbackMove ? parseUciMove(fallbackMove) : null;
        const position = new Chess(fen);

        expect(parsedMove).not.toBeNull();
        position.move(parsedMove!);
        expect(position.isCheckmate()).toBe(true);
    });

    it('conserva il colore nero durante una promozione di Stockfish', () => {
        const result = applyUciMove(
            '7k/8/8/8/8/8/p7/7K b - - 0 1',
            'a2a1q',
            'b',
        );

        expect(result.move.color).toBe('b');
        expect(result.board[7][0]).toBe('q');
        expect(result.fen.startsWith('7k/8/8/8/8/8/8/q6K w')).toBe(true);
    });

    it('normalizza la difficoltà e usa profondità progressive', () => {
        expect(normalizeStockfishDifficulty('0')).toBe(1);
        expect(normalizeStockfishDifficulty('3')).toBe(3);
        expect(normalizeStockfishDifficulty('99')).toBe(5);
        expect(stockfishDepthForDifficulty(1)).toBe(4);
        expect(stockfishDepthForDifficulty(3)).toBe(10);
        expect(stockfishDepthForDifficulty(5)).toBe(15);
    });
});
