import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string;

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, password, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};