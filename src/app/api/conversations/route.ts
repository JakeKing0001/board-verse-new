import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * Creates a new empty conversation between two users if it does not already exist.
 *
 * Expects a JSON body containing `userID` and `friendID`.
 */
export const POST = async (req: Request) => {
  try {
    const { userID, friendID } = await req.json();

    // Check for existing conversation
    const { data: existing } = await supabase
      .from('messages')
      .select('id')
      .or(`and(sender_id.eq.${userID},receiver_id.eq.${friendID}),and(sender_id.eq.${friendID},receiver_id.eq.${userID})`)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Conversation already exists' });
    }

    const { error } = await supabase
      .from('messages')
      .insert([{ sender_id: userID, receiver_id: friendID, text: [] }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Conversation created successfully' });
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};