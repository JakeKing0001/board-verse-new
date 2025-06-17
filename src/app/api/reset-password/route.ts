import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';

export const POST = async (req: Request) => {
  try {
    const { token, email, password } = await req.json();
    if (!token || !email || !password) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      token,
      type: 'recovery',
      email,
    });

    if (verifyError) {
      console.error('Supabase verify error:', verifyError.message);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email);

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