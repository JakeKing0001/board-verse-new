import { Chess, type Square } from 'chess.js';
import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../../../lib/supabaseServer';
import {
  AuthenticationError,
  requireAuthenticatedProfile,
} from '../../../../../../lib/serverAuth';
import { replayStoredMoves, STANDARD_START_FEN } from '../../../../../lib/chessState';

const SQUARE_PATTERN = /^[a-h][1-8]$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PROMOTIONS = new Set(['q', 'r', 'b', 'n']);

export const POST = async (
  req: Request,
  context: { params: Promise<{ gameId: string }> },
) => {
  try {
    const supabase = createServerSupabase(req);
    await requireAuthenticatedProfile(supabase);

    const { gameId: gameIdParam } = await context.params;
    const gameId = gameIdParam.trim();
    const body = await req.json();
    const from = typeof body.from === 'string' ? body.from.trim() : '';
    const to = typeof body.to === 'string' ? body.to.trim() : '';
    const promotion =
      typeof body.promotion === 'string' && PROMOTIONS.has(body.promotion)
        ? body.promotion
        : undefined;

    if (
      !UUID_PATTERN.test(gameId)
      || !SQUARE_PATTERN.test(from)
      || !SQUARE_PATTERN.test(to)
    ) {
      return NextResponse.json({ error: 'Invalid move' }, { status: 400 });
    }

    const [{ data: game, error: gameError }, { data: storedMoves, error: movesError }] =
      await Promise.all([
        supabase
          .from('games')
          .select('id,status,host_id,guest_id')
          .eq('id', gameId)
          .single(),
        supabase
          .from('game_moves')
          .select('from_sq,to_sq,promotion,ply')
          .eq('game_id', gameId)
          .order('ply', { ascending: true }),
      ]);

    if (gameError || !game || game.status !== 'playing' || movesError) {
      return NextResponse.json({ error: 'Active game not found' }, { status: 404 });
    }

    let chess: Chess;
    try {
      const currentPosition = replayStoredMoves(
        STANDARD_START_FEN,
        storedMoves ?? [],
      );
      chess = new Chess(currentPosition.fen);
    } catch (error) {
      console.error('Invalid stored game position:', error);
      return NextResponse.json(
        { error: 'Stored game position is invalid' },
        { status: 409 },
      );
    }

    let legalMove;
    try {
      legalMove = chess.move({
        from: from as Square,
        to: to as Square,
        promotion: promotion ?? 'q',
      });
    } catch {
      legalMove = null;
    }

    if (!legalMove) {
      return NextResponse.json({ error: 'Illegal move' }, { status: 422 });
    }

    const { data, error } = await supabase.rpc('submit_game_move', {
      target_game_id: gameId,
      target_from_sq: from,
      target_to_sq: to,
      target_promotion: legalMove.promotion ?? null,
    });

    if (error || !data?.[0]) {
      console.error('Move submission error:', error?.message ?? 'No move returned');
      return NextResponse.json(
        { error: 'Move rejected or turn already changed' },
        { status: 409 },
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Move route error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
