import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * Handles GET requests to retrieve all user data from the 'users' table using Supabase.
 *
 * @async
 * @function GET
 * @returns {Promise<NextResponse>} A JSON response containing the user data or an error message.
 *
 * @throws {Error} Returns a 500 status with an error message if an unexpected error occurs.
 *
 * @example
 * // Example usage in an API route
 * export const GET = async () => { ... }
 */
export const GET = async () => {
  try {
    // Recupera tutti i dati dalla tabella 'users'
    const { data, error } = await supabase
      .from('users')
      .select('*');
    console.log("Supabase select data:", data);
    if (error) {
      console.error("Supabase select error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("Supabase select success:", data);

    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};