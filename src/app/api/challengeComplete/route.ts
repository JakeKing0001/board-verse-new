import { NextResponse } from 'next/server';
import { createServerSupabase } from '../../../../lib/supabaseServer';
import { debugLog } from '../../../../lib/debug';

/**
 * Handles POST requests to register the completion of a challenge by a user.
 *
 * Expects a JSON body containing `userID` and `challengeID`.
 * Inserts a new record into the `challenge_completed` table in the Supabase database.
 *
 * @param req - The incoming HTTP request containing the user and challenge IDs in the body.
 * @returns A JSON response indicating success or failure.
 *
 * @throws Returns a 400 status code if there is a database insertion error.
 * @throws Returns a 500 status code if an unexpected error occurs.
 */
export const POST = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    const { challengeID } = await req.json();
    const numericChallengeId = Number(challengeID);

    if (!Number.isInteger(numericChallengeId) || numericChallengeId <= 0) {
      return NextResponse.json({ error: 'Invalid challengeID' }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    debugLog('Completing challenge:', { userID: profile.id, challengeID: numericChallengeId });


    // Inserimento dei dettagli dell'utente nel database
    const { error: insertError } = await supabase
      .from('challenge_completed')
      .insert([{ user_id: profile.id, challenge_id: numericChallengeId }]);

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ message: 'Challenge already completed' });
      }
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
 * Handles GET requests to retrieve a list of completed challenges from the 'challenge_completed' table.
 *
 * Queries the Supabase database for the `user_id` and `challenge_id` fields of all completed challenges.
 * Returns the data as a JSON response. If an error occurs during the database query, returns an error message
 * with a 400 status code. If an unexpected error occurs, returns a generic error message with a 500 status code.
 *
 * @returns {Promise<NextResponse>} A JSON response containing the completed challenges or an error message.
 */
export const GET = async (req: Request) => {
  try {
    const supabase = createServerSupabase(req);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('challenge_completed')
      .select('user_id, challenge_id');

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
