import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const GET = async () => {
  try {
    // Recupera tutti i dati dalla tabella 'challenges'
    const { data, error } = await supabase
      .from('challenges') // Sostituisci con il nome della tua tabella
      .select('*'); // Recupera tutte le colonne

    if (error) {
      console.error("Supabase select error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("Supabase select success:", data);

    return NextResponse.json(data); // Restituisci i dati come risposta JSON
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};