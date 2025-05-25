import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; // Assicurati di importare la tua configurazione Supabase

export const POST = async (req: Request) => {
  try {
    const { senderID, receiverID } = await req.json();
    console.log("Received data:", { senderID, receiverID });

    // Inserimento dei dettagli dell'utente nel database
    const { error: insertError } = await supabase
      .from('friend_requests') // Sostituisci con il nome della tua tabella
      .insert([{ sender_id: senderID, receiver_id: receiverID }]); // Assicurati che il nome della colonna corrisponda al tuo schema

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
      .from('friend_requests')
      .select('id, sender_id, receiver_id, sent_at'); // Sostituisci con le colonne che desideri recuperare

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
    const { id } = await req.json();
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    console.log("Received data:", { id: numericId });

    // Inserimento dei dettagli dell'utente nel database
    const { error: deleteError } = await supabase
      .from('friend_requests') // Sostituisci con il nome della tua tabella
      .delete()
      .eq('id', numericId); // Assicurati che il nome della colonna corrisponda al tuo schema

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