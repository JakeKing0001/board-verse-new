import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { debugLog } from '../../../../lib/debug';

/**
 * Handles the POST request to accept a friend by inserting a new friendship record into the database.
 *
 * Expects a JSON body containing `userID` and `friendID`.
 * Logs the received data for debugging purposes.
 * Attempts to insert a new row into the `friendships` table using Supabase.
 * Returns a JSON response indicating success or failure.
 *
 * @param req - The incoming HTTP request containing the user and friend IDs in the body.
 * @returns A JSON response with a success message or an error message and appropriate HTTP status code.
 */
export const POST = async (req: Request) => {
  try {
    const { userID, friendID } = await req.json();
    debugLog('Received data:', { userID, friendID });

    // Inserimento dei dettagli dell'utente nel database
    const { error: insertError } = await supabase
      .from('friendships')
      .insert([{ user_id: userID, friend_id: friendID }]);

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

/**
 * Handles GET requests to retrieve all friendships from the 'friendships' table.
 *
 * Executes a Supabase query to select the `id`, `user_id`, and `friend_id` fields.
 * Returns the data as a JSON response if successful.
 * If a Supabase error occurs, returns a JSON response with the error message and a 400 status code.
 * If an unexpected error occurs, returns a generic error message with a 500 status code.
 *
 * @returns {Promise<Response>} A JSON response containing the friendships data or an error message.
 */
export const GET = async () => {
  try {
    // Esegui la tua logica qui
    const { data, error } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id');

    if (error) {
      console.error("Supabase error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
};

/**
 * Handles the DELETE request to remove a friendship between two users.
 *
 * Expects a JSON body containing `user_id` and `friend_id`.
 * Deletes the corresponding record from the 'friendships' table in Supabase.
 *
 * @param req - The incoming HTTP request containing the user and friend IDs in the body.
 * @returns A JSON response indicating success or failure.
 *
 * @throws Returns a 400 status with an error message if the Supabase delete operation fails.
 * @throws Returns a 500 status with a generic error message if an unexpected error occurs.
 */
export const DELETE = async (req: Request) => {
  try {
    const { user_id, friend_id } = await req.json();
    debugLog('Received data:', { user_id, friend_id });

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