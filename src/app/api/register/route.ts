import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabaseServer';

export const POST = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    const { name, email, password, username } = await req.json();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, username } },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user, session: data.session });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
