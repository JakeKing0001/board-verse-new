import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; // Assicurati di importare la tua configurazione Supabase

export const POST = async (req: Request) => {
  try {
    const { userID, friendID } = await req.json();
    console.log("Received data:", { userID, friendID });

    // Inserimento dei dettagli dell'utente nel database
    const { error: insertError } = await supabase
      .from('friendships') // Sostituisci con il nome della tua tabella
      .insert([{ user_id: userID, friend_id: friendID }]); // Assicurati che il nome della colonna corrisponda al tuo schema

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

export const GET = async () => {
  try {
    // Esegui la tua logica qui
    const { data, error } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id'); // Sostituisci con le colonne che desideri recuperare

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // Ad esempio, puoi restituire un messaggio di successo
    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};

export const DELETE = async (req: Request) => {
  try {
    const { user_id, friend_id } = await req.json();
    console.log("Received data:", { user_id, friend_id });

    const { error: deleteError } = await supabase
      .from('friendships')
      .delete()
      .eq('user_id', user_id)
      .eq('friend_id', friend_id);

    if (deleteError) {
      console.error("Supabase deleteError:", deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}