import { supabase } from '../lib/supabase';

/**
 * Sends a POST request to register a new user.
 *
 * @param formData - An object containing the new user’s registration details:
 *   - name:     User’s full name
 *   - email:    User’s email address
 *   - password: User’s chosen password
 *   - username: User’s chosen username
 *
 * @throws {Error} If the network request fails or the response status is not in the 200–299 range.
 *
 * @returns {Promise<any>} The parsed JSON response from the server.
 */
export const registerUser = async (formData: { name: string; email: string; password: string, username: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    options: {
      emailRedirectTo: `${window.location.origin}/login`,
      data: {
        full_name: formData.name,
        username: formData.username,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Updates the user settings by sending the provided form data to the `/api/settings` endpoint.
 *
 * @param formData - An object containing the user's settings and preferences.
 * @param formData.email - The user's email address.
 * @param formData.name - The user's full name.
 * @param formData.username - The user's username.
 * @param formData.avatar - The URL or identifier for the user's avatar image.
 * @param formData.bio - The user's biography or profile description.
 * @param formData.location - The user's location.
 * @param formData.birthdate - The user's birthdate in string format.
 * @param formData.notifications_email - Whether to enable email notifications.
 * @param formData.notifications_app - Whether to enable in-app notifications.
 * @param formData.newsletter - Whether the user is subscribed to the newsletter.
 * @param formData.game_invites - Whether to allow game invites.
 * @param formData.friend_requests - Whether to allow friend requests.
 * @param formData.profile_visibility - The visibility setting for the user's profile.
 * @param formData.show_online_status - Whether to show the user's online status.
 * @param formData.show_play_history - Whether to show the user's play history.
 * @param formData.allow_friend_requests - Whether to allow friend requests.
 * @param formData.language - The user's preferred language.
 * @param formData.theme - The user's selected theme.
 * @param formData.color_blind_mode - Whether color blind mode is enabled.
 * @param formData.text_size - The user's preferred text size.
 * @returns A promise that resolves to the response data from the server.
 * @throws Will throw an error if the server response is not OK.
 */
export const settingsUser = async (formData: {
  email: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location: string;
  birthdate: string;
  notifications_email: boolean;
  notifications_app: boolean;
  newsletter: boolean;
  game_invites: boolean;
  friend_requests: boolean;
  profile_visibility: string;
  show_online_status: boolean;
  show_play_history: boolean;
  allow_friend_requests: boolean;
  language: string;
  theme: string;
  color_blind_mode: boolean;
  text_size: string;
}) => {
  const response = await fetch(`/api/settings`, {
    method: "POST",
    headers: await import('../lib/api').then(({ getApiHeaders }) => getApiHeaders()),
    body: JSON.stringify(formData),
  });

  const payload = await response.json().catch(() => null) as {
    message?: string;
    error?: string;
    user?: import('../src/types/domain').UserProfile;
  } | null;

  if (response.ok && payload?.user) {
    return {
      message: payload.message ?? 'Profile settings updated',
      user: payload.user,
    };
  }

  throw new Error(payload?.error || `Error: ${response.status} - ${response.statusText}`);
};

/**
 * Sends a password reset email to the provided address.
 *
 * @param email - The user's email address.
 * @returns A promise that resolves when the request completes.
 */
export const requestPasswordReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
};
