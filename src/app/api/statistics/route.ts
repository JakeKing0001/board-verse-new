import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { count: gamesCount, error: gamesError } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`);

    if (gamesError) {
      return NextResponse.json({ error: gamesError.message }, { status: 400 });
    }

    const { count: challengesCount, error: challengesError } = await supabase
      .from('challenge_completed')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (challengesError) {
      return NextResponse.json({ error: challengesError.message }, { status: 400 });
    }

    return NextResponse.json({
      matchesPlayed: gamesCount ?? 0,
      challengesCompleted: challengesCount ?? 0,
    });
  } catch (err) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};