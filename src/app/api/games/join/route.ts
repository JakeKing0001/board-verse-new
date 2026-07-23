import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../../lib/supabaseServer';
import {
  AuthenticationError,
  requireAuthenticatedProfile,
} from '../../../../../lib/serverAuth';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const POST = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    await requireAuthenticatedProfile(supabase);
    const body = await req.json();

    const gameId =
      typeof body.gameId === 'string' && UUID_PATTERN.test(body.gameId.trim())
        ? body.gameId.trim()
        : null;
    const joinCode =
      typeof body.joinCode === 'string' && UUID_PATTERN.test(body.joinCode.trim())
        ? body.joinCode.trim()
        : null;

    if (!gameId && !joinCode) {
      return NextResponse.json(
        { error: 'A public game ID or private invite code is required' },
        { status: 400 },
      );
    }

    const initialAttempt = await supabase.rpc('join_game', {
      target_game_id: gameId,
      target_join_code: joinCode,
    });
    let { data, error } = initialAttempt;

    // Public game IDs and private invite codes are both UUIDs. When the user
    // types one manually, try it as a public ID if it was not an invite code.
    if ((error || !data?.[0]) && !gameId && joinCode) {
      const publicIdAttempt = await supabase.rpc('join_game', {
        target_game_id: joinCode,
        target_join_code: null,
      });
      data = publicIdAttempt.data;
      error = publicIdAttempt.error;
    }

    if (error || !data?.[0]) {
      console.error('Game join error:', error?.message ?? 'No game returned');
      return NextResponse.json(
        { error: 'Game not found or no longer available' },
        { status: 409 },
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Game join route error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
