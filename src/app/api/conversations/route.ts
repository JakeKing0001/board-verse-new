import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabaseServer';
import {
  AuthenticationError,
  requireAuthenticatedProfile,
} from '../../../../lib/serverAuth';

export const GET = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    await requireAuthenticatedProfile(supabase);
    const { data, error } = await supabase.rpc('get_my_conversations');

    if (error) {
      console.error('Unable to load conversation summaries:', error);
      return NextResponse.json(
        { error: 'Unable to load conversations' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { conversations: data ?? [] },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Unexpected conversation summary error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};

/**
 * Verifies that the authenticated user and the requested profile are friends.
 *
 * Expects a JSON body containing `friendID`.
 */
export const POST = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    const { profileId } = await requireAuthenticatedProfile(supabase);
    const { friendID } = await req.json();
    const numericFriendId = Number(friendID);

    if (!Number.isInteger(numericFriendId) || numericFriendId <= 0) {
      return NextResponse.json({ error: 'Invalid friendID' }, { status: 400 });
    }

    const { data: friendship, error } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${profileId},friend_id.eq.${numericFriendId}),and(user_id.eq.${numericFriendId},friend_id.eq.${profileId})`)
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: 'Unable to verify friendship' }, { status: 400 });
    }
    if (!friendship) {
      return NextResponse.json({ error: 'Friendship required' }, { status: 403 });
    }

    return NextResponse.json({ message: 'Conversation ready' });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
