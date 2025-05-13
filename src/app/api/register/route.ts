import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; // Assicurati di importare la tua configurazione Supabase
import bcrypt from 'bcryptjs';
import { getUsers } from '../../../../services/login';

export const POST = async (req: Request) => {
  try {
    const { name, email, password, username } = await req.json();
    console.log("Received data:", { name, email, password, username });

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

    // Registrazione dell'utente tramite Supabase
    // const { data, error } = await supabase.auth.signUp({
    //   email,
    //   password,
    // });

    // if (error) {
    //   console.error("Supabase signUp error:", error.message);
    //   return NextResponse.json({ error: error.message }, { status: 400 });
    // }

    // console.log("Supabase signUp success:", data);

    // Inserimento dei dettagli dell'utente nel database
    const { error: insertError } = await supabase
      .from('users') // Sostituisci con il nome della tua tabella
      .insert([{ full_name: name, email, password: hashedPassword, username: username }]); // Assicurati che il nome della colonna corrisponda al tuo schema

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
