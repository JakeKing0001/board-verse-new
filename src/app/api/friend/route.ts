import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * Handles POST requests to create a new friend request.
 *
 * Expects a JSON body containing `senderID` and `receiverID`.
 * Inserts a new record into the `friend_requests` table using Supabase.
 *
 * @param req - The incoming HTTP request object.
 * @returns A JSON response indicating success or failure.
 *
 * @throws Returns a 400 status with an error message if the database insert fails.
 * @throws Returns a 500 status with a generic error message if an unexpected error occurs.
 */
export const POST = async (req: Request) => {
  try {
    const { senderID, receiverID } = await req.json();
    console.log("Received data:", { senderID, receiverID });

    // Inserimento dei dettagli dell'utente nel database
    const { error: insertError } = await supabase
      .from('friend_requests')
      .insert([{ sender_id: senderID, receiver_id: receiverID }]);

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
 * Handles GET requests to fetch all friend requests from the 'friend_requests' table.
 *
 * Queries the Supabase database for friend request records, including their IDs, sender and receiver IDs, and the timestamp when sent.
 * Returns the data as a JSON response. Handles and logs errors, returning appropriate HTTP status codes and error messages.
 *
 * @returns {Promise<NextResponse>} A JSON response containing the friend requests data or an error message.
 */
export const GET = async () => {
  try {
    const { data, error } = await supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, sent_at');

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
 * Handles DELETE requests to remove a friend request from the database.
 *
 * Expects a JSON body containing the `id` of the friend request to delete.
 * Converts the `id` to a number if necessary, then deletes the corresponding
 * record from the `friend_requests` table in Supabase.
 *
 * @param req - The incoming HTTP request containing the friend request ID in the body.
 * @returns A JSON response indicating success or failure of the deletion operation.
 *
 * @throws Returns a 400 status with an error message if the deletion fails.
 * @throws Returns a 500 status with a generic error message if an unexpected error occurs.
 */
export const DELETE = async (req: Request) => {
  try {
    const { id } = await req.json();
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    console.log("Received data:", { id: numericId });

    // Inserimento dei dettagli dell'utente nel database
    const { error: deleteError } = await supabase
      .from('friend_requests')
      .delete()
      .eq('id', numericId);

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