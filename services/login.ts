import { supabase } from "../lib/supabase";

/**
 * Retrieves all users from the 'users' table in the Supabase database.
 *
 * @returns {Promise<any[]>} A promise that resolves to an array of user objects.
 * @throws {Error} Throws an error if the Supabase query fails.
 */
export const getUsers = async (authUserId: string) => {
  const [ownProfileResult, directoryResult] = await Promise.all([
    supabase
      .from('users')
      .select('id, auth_user_id, full_name, created_at, avatar, username, bio, location, birthdate, notifications_email, notifications_app, newsletter, game_invites, friend_requests, profile_visibility, show_online_status, show_play_history, allow_friend_requests, language, theme, color_blind_mode, text_size, last_seen')
      .eq('auth_user_id', authUserId)
      .single(),
    supabase.rpc('get_user_directory'),
  ]);

  if (ownProfileResult.error) {
    throw new Error(ownProfileResult.error.message);
  }

  if (directoryResult.error) {
    throw new Error(directoryResult.error.message);
  }

  const directory = directoryResult.data || [];
  return [
    ...directory.filter((profile: { id: number }) => profile.id !== ownProfileResult.data.id),
    ownProfileResult.data,
  ];
};
