import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabaseServer';

export const POST = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    const { email, password } = await req.json();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    return NextResponse.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: data.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
