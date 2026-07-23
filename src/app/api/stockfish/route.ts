import { Chess } from 'chess.js';
import { NextRequest, NextResponse } from 'next/server';
import {
    chooseFallbackMove,
    extractUciMove,
    isLegalUciMove,
} from '../../../lib/stockfish';

export const runtime = 'nodejs';

const STOCKFISH_ENDPOINT = 'https://stockfish.online/api/s/v2.php';
const UPSTREAM_TIMEOUT_MS = 5_000;
const MAX_ATTEMPTS = 2;

interface UpstreamStockfishResponse {
    success?: boolean;
    bestmove?: string;
    evaluation?: number | null;
    mate?: number | null;
    continuation?: string;
    error?: string;
}

const wait = (milliseconds: number) => new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
});

async function requestStockfish(fen: string, depth: number) {
    const url = new URL(STOCKFISH_ENDPOINT);
    url.searchParams.set('fen', fen);
    url.searchParams.set('depth', String(depth));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            cache: 'no-store',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Stockfish HTTP ${response.status}`);
        }

        const payload = await response.json() as UpstreamStockfishResponse;
        if (payload.success === false) {
            throw new Error(payload.error || 'Stockfish non ha completato l’analisi');
        }
        return payload;
    } finally {
        clearTimeout(timeout);
    }
}

export async function GET(request: NextRequest) {
    const fen = request.nextUrl.searchParams.get('fen')?.trim();
    const requestedDepth = Number(request.nextUrl.searchParams.get('depth') ?? 12);
    const depth = Number.isFinite(requestedDepth)
        ? Math.min(15, Math.max(1, Math.trunc(requestedDepth)))
        : 12;

    if (!fen) {
        return NextResponse.json(
            { success: false, error: 'Parametro FEN mancante.' },
            { status: 400 },
        );
    }

    try {
        const chess = new Chess(fen);
        if (chess.isGameOver()) {
            return NextResponse.json(
                { success: false, error: 'La posizione è già conclusa.' },
                { status: 409 },
            );
        }
    } catch {
        return NextResponse.json(
            { success: false, error: 'Posizione FEN non valida.' },
            { status: 400 },
        );
    }

    let upstreamError = 'Servizio Stockfish non disponibile.';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
            const payload = await requestStockfish(fen, depth);
            const move = extractUciMove(payload.bestmove);

            if (!move || !isLegalUciMove(fen, move)) {
                throw new Error('Stockfish ha restituito una mossa non valida');
            }

            return NextResponse.json({
                success: true,
                source: 'stockfish',
                move,
                bestmove: payload.bestmove,
                evaluation: payload.evaluation ?? null,
                mate: payload.mate ?? null,
                continuation: payload.continuation ?? '',
            });
        } catch (error) {
            upstreamError = error instanceof Error ? error.message : upstreamError;
            if (attempt < MAX_ATTEMPTS) await wait(250 * attempt);
        }
    }

    const fallbackMove = chooseFallbackMove(fen);
    if (!fallbackMove) {
        return NextResponse.json(
            { success: false, error: 'Nessuna mossa legale disponibile.' },
            { status: 409 },
        );
    }

    return NextResponse.json({
        success: true,
        source: 'local-fallback',
        move: fallbackMove,
        bestmove: `bestmove ${fallbackMove}`,
        evaluation: null,
        mate: null,
        continuation: '',
        warning: upstreamError,
    });
}
