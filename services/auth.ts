export const registerUser = async (formData: { name: string; email: string; password: string, username: string }) => {
  const response = await fetch(`/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};

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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};