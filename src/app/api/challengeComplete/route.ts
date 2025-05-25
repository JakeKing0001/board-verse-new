import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; // Assicurati di importare la tua configurazione Supabase

export const POST = async (req: Request) => {
  try {
    const { userID, challengeID} = await req.json();
    console.log("Received data:", { userID, challengeID });


    // Inserimento dei dettagli dell'utente nel database
    const { error: insertError } = await supabase
      .from('challenge_completed') // Sostituisci con il nome della tua tabella
      .insert([{ user_id: userID, challenge_id: challengeID}]); // Assicurati che il nome della colonna corrisponda al tuo schema

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
    // Esegui la tua logica qui, ad esempio, recupera i dati da Supabase
    const { data, error } = await supabase
      .from('challenge_completed')
      .select('user_id, challenge_id'); // Sostituisci con le colonne che desideri recuperare

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}