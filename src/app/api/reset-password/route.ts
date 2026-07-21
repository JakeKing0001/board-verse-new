import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabaseServer';

export const POST = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      console.error('Supabase update error:', updateError.message);
      return NextResponse.json({ error: 'Failed to update password' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
