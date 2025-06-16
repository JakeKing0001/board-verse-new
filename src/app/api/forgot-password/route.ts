import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const POST = async (req: Request) => {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}`,
    });

    if (error) {
      console.error('Supabase reset password error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};