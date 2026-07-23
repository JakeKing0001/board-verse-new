import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabaseServer';
import {
  AuthenticationError,
  requireAuthenticatedProfile,
} from '../../../../lib/serverAuth';

const GAME_FIELDS =
  'id,name,host_id,guest_id,winner_id,result,status,is_private,join_code,time,created_at';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const GET = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    await requireAuthenticatedProfile(supabase);

    const url = new URL(req.url);
    const beforeCreatedAt = url.searchParams.get('beforeCreatedAt');
    const beforeId = url.searchParams.get('beforeId');
    const requestedLimit = Number(url.searchParams.get('limit') ?? 30);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 30;

    let query = supabase
      .from('games')
      .select(GAME_FIELDS)
      .eq('status', 'waiting')
      .eq('is_private', false)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit);

    if (beforeCreatedAt) {
      const cursorDate = new Date(beforeCreatedAt);
      if (
        Number.isNaN(cursorDate.getTime())
        || !beforeId
        || !UUID_PATTERN.test(beforeId)
      ) {
        return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
      }
      const cursorIso = cursorDate.toISOString();
      query = query.or(
        `created_at.lt.${cursorIso},and(created_at.eq.${cursorIso},id.lt.${beforeId})`,
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Games list error:', error.message);
      return NextResponse.json({ error: 'Unable to load games' }, { status: 400 });
    }

    const games = data ?? [];
    const lastGame = games[games.length - 1];
    const nextCursor = games.length === limit && lastGame
      ? { createdAt: lastGame.created_at, id: lastGame.id }
      : null;

    return NextResponse.json(
      { games, nextCursor },
      { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Games route error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    const { profileId } = await requireAuthenticatedProfile(supabase);
    const body = await req.json();

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const time = Number(body.time);
    const isPrivate = body.isPrivate === true;

    if (!name || name.length > 80) {
      return NextResponse.json(
        { error: 'Game name must contain between 1 and 80 characters' },
        { status: 400 },
      );
    }
    if (!Number.isInteger(time) || time < 30 || time > 31_536_000) {
      return NextResponse.json({ error: 'Invalid game duration' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('games')
      .insert({
        name,
        host_id: profileId,
        guest_id: null,
        status: 'waiting',
        is_private: isPrivate,
        time,
      })
      .select(GAME_FIELDS)
      .single();

    if (error) {
      console.error('Game creation error:', error.message);
      return NextResponse.json({ error: 'Unable to create game' }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Game creation route error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
