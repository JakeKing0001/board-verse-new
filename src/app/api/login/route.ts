import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json();

    const { data: user, error } = await supabase
      .from('users')
      .select('password, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};