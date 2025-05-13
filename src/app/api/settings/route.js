import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; // Assicurati di importare la tua configurazione Supabase

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
      .from('users') // Sostituisci con il nome della tua tabella
      .update(updateData) // Assicurati che il nome della colonna corrisponda al tuo schema
      .eq('email', email); // Assicurati che il nome della colonna corrisponda al tuo schema

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
