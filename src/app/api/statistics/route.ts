import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('winner_id, result, host_id, guest_id')
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`);
    
    const { count: winsCount } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('winner_id', userId);

    const { count: drawsCount } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .eq('is_draw', true)
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`);

    const { count: lossesCount } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
      .neq('winner_id', userId)
      .neq('is_draw', true);

    if (gamesError) {
      return NextResponse.json({ error: gamesError.message }, { status: 400 });
    }

    const matchesPlayed = games?.length ?? 0;
    const userNumericId = Number(userId);

    const wins = games?.filter(g => g.winner_id === userNumericId).length ?? 0;
    const draws = games?.filter(g => g.result === 'draw').length ?? 0;
    const losses = games?.filter(
      g => g.winner_id && g.winner_id !== userNumericId && g.result !== 'draw'
    ).length ?? 0;

    const { count: challengesCount, error: challengesError } = await supabase
      .from('challenge_completed')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (challengesError) {
      return NextResponse.json({ error: challengesError.message }, { status: 400 });
    }

    return NextResponse.json({
      matchesPlayed,
      wins: winsCount ?? 0,
      losses: lossesCount ?? 0,
      draws: drawsCount ?? 0,
      challengesCompleted: challengesCount ?? 0,
    });
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};