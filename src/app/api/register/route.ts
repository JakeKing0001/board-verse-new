import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import bcrypt from 'bcryptjs';
import { getUsers } from '../../../../services/login';
import { debugLog } from '../../../../lib/debug';

/**
 * Handles user registration via POST request.
 *
 * This function receives user registration data (name, email, password, username) from the request body,
 * hashes the password using bcrypt, checks for existing users with the same email or username,
 * and inserts the new user into the Supabase 'users' table if validations pass.
 *
 * @param req - The incoming HTTP request containing user registration data in JSON format.
 * @returns A JSON response indicating success or failure, with appropriate HTTP status codes:
 * - 200: User registered successfully.
 * - 400: Email or username already in use, or database insertion error.
 * - 500: Unexpected server error.
 *
 * @async
 */
export const POST = async (req: Request) => {
  try {
    const { name, email, password, username } = await req.json();
    debugLog('Received data:', { name, email, password, username });

    // Hash della password con bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const users: { email: string; username: string }[] = await getUsers();

    // Controllo se l'email è già utilizzata
    if (users.some(user => user.email === email)) {
      return NextResponse.json({ error: 'This email is already in use' }, { status: 400 });
    }

    // Controllo se l'username è già utilizzato
    if (users.some(user => user.username === username)) {
      return NextResponse.json({ error: 'This username is already in use' }, { status: 400 });
    }

    // Inserimento dei dettagli dell'utente nel database
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ full_name: name, email, password: hashedPassword, username: username }]);

    if (insertError) {
      console.error("Supabase insertError:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User registered successfully' });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};
