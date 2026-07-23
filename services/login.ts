import { supabase } from "../lib/supabase";
import type { UserProfile } from "../src/types/domain";

/**
 * Retrieves the authenticated user's complete profile.
 */
export const getOwnProfile = async (authUserId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('users')
    .select('id, auth_user_id, full_name, created_at, avatar, username, bio, location, birthdate, notifications_email, notifications_app, newsletter, game_invites, friend_requests, profile_visibility, show_online_status, show_play_history, allow_friend_requests, language, theme, color_blind_mode, text_size, last_seen')
    .eq('auth_user_id', authUserId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
};

/**
 * Retrieves the profile directory visible to the authenticated user.
 */
export const getUserDirectory = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase.rpc('get_user_directory');

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as UserProfile[];
};

/**
 * Retrieves the authenticated profile and the visible user directory.
 */
export const getUsers = async (authUserId: string): Promise<UserProfile[]> => {
  const [ownProfile, directory] = await Promise.all([
    getOwnProfile(authUserId),
    getUserDirectory(),
  ]);

  return [
    ...directory.filter((profile) => profile.id !== ownProfile.id),
    ownProfile,
  ];
};
