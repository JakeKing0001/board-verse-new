import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { debugLog } from '../../../../lib/debug';

/**
 * Handles GET requests to retrieve all challenges from the 'challenges' table using Supabase.
 *
 * @returns {Promise<Response>} A JSON response containing the list of challenges or an error message.
 *
 * @throws {Error} Returns a 500 status with an error message if an unexpected error occurs.
 *
 * @remarks
 * - Returns a 400 status with an error message if there is a Supabase select error.
 * - Logs success and error messages to the console for debugging purposes.
 */
export const GET = async () => {
  try {
    const { data, error } = await supabase
      .from('challenges')
      .select('id, fen, number_moves, created_at, cpu_moves');

    if (error) {
      console.error("Supabase select error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    debugLog('Supabase select success:', data);

    return NextResponse.json(data); // Restituisci i dati come risposta JSON
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};