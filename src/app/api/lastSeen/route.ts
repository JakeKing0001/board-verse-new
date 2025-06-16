import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * Updates the `last_seen` timestamp for a given user.
 *
 * Expects a JSON body containing the user's id.
 * Returns a success message or an error.
 */
export const POST = async (req: Request) => {
  try {
    const { userID } = await req.json();
    const { error } = await supabase
      .from('users')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', userID);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Last seen updated' });
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};