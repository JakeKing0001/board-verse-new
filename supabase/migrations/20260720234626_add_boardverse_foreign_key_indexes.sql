create index if not exists challenge_completed_challenge_id_idx
  on public.challenge_completed (challenge_id);

create index if not exists friend_requests_sender_id_idx
  on public.friend_requests (sender_id);

create index if not exists friend_requests_receiver_id_idx
  on public.friend_requests (receiver_id);

create index if not exists friendships_friend_id_idx
  on public.friendships (friend_id);

create index if not exists game_moves_game_id_idx
  on public.game_moves (game_id);

create index if not exists game_moves_moved_by_idx
  on public.game_moves (moved_by);

create index if not exists games_host_id_idx
  on public.games (host_id);

create index if not exists games_guest_id_idx
  on public.games (guest_id);

create index if not exists games_winner_id_idx
  on public.games (winner_id);

create index if not exists messages_sender_id_idx
  on public.messages (sender_id);

create index if not exists messages_receiver_id_idx
  on public.messages (receiver_id);
