export type GameStatus = 'waiting' | 'playing' | 'complete';
export type GameResult = 'white' | 'black' | 'draw' | null;

export interface GameSummary {
  id: string;
  name: string;
  host_id: number;
  guest_id: number | null;
  status: GameStatus;
  winner_id: number | null;
  result: GameResult;
  is_private: boolean;
  join_code?: string;
  time: number;
  created_at: string;
}

export interface GameCursor {
  createdAt: string;
  id: string;
}

export interface ChatMessage {
  id: number;
  sender_id: number;
  receiver_id: number;
  text: {
    content?: string;
    text?: string;
  };
  unread: number;
  sent_at: string;
}

export interface MessageCursor {
  sentAt: string;
  id: number;
}

export interface PaginatedMessages {
  messages: ChatMessage[];
  nextCursor: MessageCursor | null;
}

export interface ConversationSummary {
  friend_id: number;
  last_message: string | null;
  last_sent_at: string | null;
  unread_count: number;
}

export interface UserProfile {
  id: number;
  created_at?: string;
  auth_user_id?: string | null;
  email?: string | null;
  full_name?: string | null;
  username?: string | null;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  birthdate?: string | null;
  language?: string | null;
  theme?: string | null;
  last_seen?: string | null;
  notifications_email?: boolean;
  notifications_app?: boolean;
  newsletter?: boolean;
  game_invites?: boolean;
  friend_requests?: boolean;
  profile_visibility?: string;
  show_online_status?: boolean;
  show_play_history?: boolean;
  allow_friend_requests?: boolean;
  color_blind_mode?: boolean;
  text_size?: string;
  status?: string;
}

export interface Friendship {
  id: number;
  user_id: number;
  friend_id: number;
}

export interface FriendProfile extends Friendship {
  username?: string;
  email?: string;
  avatar?: string;
  status?: string;
  lastSeen?: string;
}

export interface FriendRequest {
  id: number;
  sender_id: number;
  receiver_id: number;
  sent_at: string;
}

export interface FriendRequestDisplay extends FriendRequest {
  username?: string;
  email?: string;
  avatar?: string;
  requestDate: string;
}

export interface CompletedChallenge {
  id?: number;
  user_id?: number;
  challenge_id: number;
}
