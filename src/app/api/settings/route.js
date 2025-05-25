import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

/**
 * Handles a POST request to update user settings in the database.
 *
 * Expects a JSON body with the following properties:
 * - email {string}: The user's email address (used as identifier).
 * - name {string}: The user's full name.
 * - username {string}: The user's username.
 * - avatar {string}: URL or identifier for the user's avatar.
 * - bio {string}: The user's biography.
 * - location {string}: The user's location.
 * - birthdate {string}: The user's birthdate.
 * - notifications_email {boolean}: Whether email notifications are enabled.
 * - notifications_app {boolean}: Whether app notifications are enabled.
 * - newsletter {boolean}: Whether the user is subscribed to the newsletter.
 * - game_invites {boolean}: Whether game invites are enabled.
 * - friend_requests {boolean}: Whether friend requests are enabled.
 * - profile_visibility {string}: The user's profile visibility setting.
 * - show_online_status {boolean}: Whether to show online status.
 * - show_play_history {boolean}: Whether to show play history.
 * - allow_friend_requests {boolean}: Whether to allow friend requests.
 * - language {string}: The user's preferred language.
 * - theme {string}: The user's selected theme.
 * - color_blind_mode {boolean}: Whether color blind mode is enabled.
 * - text_size {string}: The user's preferred text size.
 *
 * Updates the corresponding user record in the 'users' table using Supabase.
 *
 * @param {Request} req - The incoming request object containing user settings in JSON format.
 * @returns {Promise<Response>} A JSON response indicating success or failure.
 */
export const POST = async (req) => {
  try {
    const { email, name, username, avatar, bio, location, birthdate, notifications_email, notifications_app, newsletter, game_invites, friend_requests, profile_visibility, show_online_status, show_play_history, allow_friend_requests, language, theme, color_blind_mode, text_size} = await req.json();
    console.log("Received data:", { email, name, username, avatar, bio, location, birthdate, notifications_email, notifications_app, newsletter, game_invites, friend_requests, profile_visibility, show_online_status, show_play_history, allow_friend_requests, language, theme, color_blind_mode, text_size });

    //Preparazione dei dati per l'inserimento nel database
    const updateData = {
      full_name: name,
      username: username,
      avatar: avatar,
      bio: bio,
      location: location,
      birthdate: birthdate,
      notifications_email: notifications_email,
      notifications_app: notifications_app,
      newsletter: newsletter,
      game_invites: game_invites,
      friend_requests: friend_requests,
      profile_visibility: profile_visibility,
      show_online_status: show_online_status,
      show_play_history: show_play_history,
      allow_friend_requests: allow_friend_requests,
      language: language,
      theme: theme,
      color_blind_mode: color_blind_mode,
      text_size: text_size
    };


    // Inserimento dei dettagli dell'utente nel database
    const { error: insertError } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', email);

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
