-- Keep private games visible only to their participants. Public waiting games
-- remain discoverable in the lobby, while joining by ID is handled atomically
-- by public.join_game().

update public.games
set is_private = false
where is_private is null;

alter table public.games
  alter column is_private set default false,
  alter column is_private set not null;

alter table public.games
  add column if not exists join_code uuid;

update public.games
set join_code = gen_random_uuid()
where join_code is null;

alter table public.games
  alter column join_code set default gen_random_uuid(),
  alter column join_code set not null;

create unique index if not exists games_join_code_key
  on public.games (join_code);

drop policy if exists games_select_authenticated on public.games;
drop policy if exists games_select_visible on public.games;
create policy games_select_visible on public.games
for select to authenticated
using (
  (
    status = 'waiting'
    and is_private = false
  )
  or host_id = (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
  or guest_id = (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
);

drop policy if exists games_update_participant_or_join on public.games;
drop policy if exists games_update_participant on public.games;
create policy games_update_participant on public.games
for update to authenticated
using (
  host_id = (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
  or guest_id = (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
)
with check (
  host_id = (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
  or guest_id = (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
);

drop function if exists public.join_game(integer);
drop function if exists public.join_game(integer, uuid);
create function public.join_game(
  target_game_id integer default null,
  target_join_code uuid default null
)
returns table (
  id integer,
  name text,
  host_id integer,
  guest_id integer,
  status text,
  is_private boolean,
  join_code uuid,
  "time" integer,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id integer;
  target_game public.games%rowtype;
begin
  if (select auth.uid()) is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;

  select profile.id
  into current_profile_id
  from public.users profile
  where profile.auth_user_id = (select auth.uid());

  if current_profile_id is null then
    raise insufficient_privilege using message = 'Authenticated profile not found';
  end if;

  select game.*
  into target_game
  from public.games game
  where (
    target_join_code is not null
    and game.join_code = target_join_code
  ) or (
    target_join_code is null
    and target_game_id is not null
    and game.id = target_game_id
    and game.is_private = false
  )
  for update;

  if not found then
    raise no_data_found using message = 'Game not found';
  end if;

  if target_game.host_id = current_profile_id then
    raise check_violation using message = 'The host cannot join as guest';
  end if;

  if target_game.status <> 'waiting' or target_game.guest_id is not null then
    raise check_violation using message = 'Game is no longer available';
  end if;

  return query
  update public.games game
  set
    guest_id = current_profile_id,
    status = 'playing'
  where game.id = target_game.id
  returning
    game.id,
    game.name,
    game.host_id,
    game.guest_id,
    game.status,
    game.is_private,
    game.join_code,
    game."time",
    game.created_at;
end;
$$;

revoke all on function public.join_game(integer, uuid) from public, anon;
grant execute on function public.join_game(integer, uuid) to authenticated;

drop function if exists public.get_my_conversations();
create function public.get_my_conversations()
returns table (
  friend_id integer,
  last_message text,
  last_sent_at timestamptz,
  unread_count bigint
)
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  current_profile_id integer;
begin
  if (select auth.uid()) is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;

  select profile.id
  into current_profile_id
  from public.users profile
  where profile.auth_user_id = (select auth.uid());

  if current_profile_id is null then
    raise insufficient_privilege using message = 'Authenticated profile not found';
  end if;

  return query
  with friend_ids as (
    select distinct
      case
        when friendship.user_id = current_profile_id then friendship.friend_id
        else friendship.user_id
      end as id
    from public.friendships friendship
    where friendship.user_id = current_profile_id
       or friendship.friend_id = current_profile_id
  )
  select
    friend.id,
    coalesce(
      latest_message.text ->> 'content',
      latest_message.text ->> 'message',
      latest_message.text ->> 'text',
      latest_message.text::text
    ),
    latest_message.sent_at,
    coalesce(unread_messages.total, 0)
  from friend_ids friend
  left join lateral (
    select message.text, message.sent_at
    from public.messages message
    where (
      message.sender_id = current_profile_id
      and message.receiver_id = friend.id
    ) or (
      message.sender_id = friend.id
      and message.receiver_id = current_profile_id
    )
    order by message.sent_at desc, message.id desc
    limit 1
  ) latest_message on true
  left join lateral (
    select count(*) as total
    from public.messages message
    where message.sender_id = friend.id
      and message.receiver_id = current_profile_id
      and message.unread > 0
  ) unread_messages on true
  order by latest_message.sent_at desc nulls last, friend.id;
end;
$$;

revoke all on function public.get_my_conversations() from public, anon;
grant execute on function public.get_my_conversations() to authenticated;

alter table public.game_moves
  add column if not exists promotion text,
  add column if not exists ply integer;

with ordered_moves as (
  select
    move.id,
    row_number() over (
      partition by move.game_id
      order by move.created_at, move.id
    )::integer as calculated_ply
  from public.game_moves move
)
update public.game_moves move
set ply = ordered.calculated_ply
from ordered_moves ordered
where move.id = ordered.id
  and move.ply is null;

alter table public.game_moves
  alter column ply set not null;

alter table public.game_moves
  drop constraint if exists game_moves_promotion_check;

alter table public.game_moves
  add constraint game_moves_promotion_check
  check (promotion is null or promotion in ('q', 'r', 'b', 'n'));

create unique index if not exists game_moves_game_ply_key
  on public.game_moves (game_id, ply);

revoke insert on table public.game_moves from authenticated;
drop policy if exists game_moves_insert_participant on public.game_moves;

drop function if exists public.submit_game_move(integer, text, text, text);
create function public.submit_game_move(
  target_game_id integer,
  target_from_sq text,
  target_to_sq text,
  target_promotion text default null
)
returns setof public.game_moves
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_profile_id integer;
  locked_game public.games%rowtype;
  move_count integer;
  inserted_move public.game_moves%rowtype;
begin
  if (select auth.uid()) is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;

  select profile.id
  into current_profile_id
  from public.users profile
  where profile.auth_user_id = (select auth.uid());

  if current_profile_id is null then
    raise insufficient_privilege using message = 'Authenticated profile not found';
  end if;

  if target_from_sq !~ '^[a-h][1-8]$'
    or target_to_sq !~ '^[a-h][1-8]$'
    or (
      target_promotion is not null
      and target_promotion not in ('q', 'r', 'b', 'n')
    )
  then
    raise check_violation using message = 'Invalid move coordinates';
  end if;

  select game.*
  into locked_game
  from public.games game
  where game.id = target_game_id
  for update;

  if not found or locked_game.status <> 'playing' then
    raise no_data_found using message = 'Active game not found';
  end if;

  select count(*)::integer
  into move_count
  from public.game_moves move
  where move.game_id = target_game_id;

  if (
    move_count % 2 = 0
    and current_profile_id <> locked_game.host_id
  ) or (
    move_count % 2 = 1
    and current_profile_id <> locked_game.guest_id
  )
  then
    raise insufficient_privilege using message = 'It is not your turn';
  end if;

  insert into public.game_moves (
    game_id,
    from_sq,
    to_sq,
    moved_by,
    created_at,
    promotion,
    ply
  )
  values (
    target_game_id,
    target_from_sq,
    target_to_sq,
    current_profile_id,
    now(),
    target_promotion,
    move_count + 1
  )
  returning * into inserted_move;

  return next inserted_move;
end;
$$;

revoke all on function public.submit_game_move(integer, text, text, text)
  from public, anon;
grant execute on function public.submit_game_move(integer, text, text, text)
  to authenticated;

create index if not exists games_public_lobby_cursor_idx
  on public.games (created_at desc, id desc)
  where status = 'waiting' and is_private = false;

create index if not exists games_host_created_cursor_idx
  on public.games (host_id, created_at desc, id desc);

create index if not exists games_guest_created_cursor_idx
  on public.games (guest_id, created_at desc, id desc)
  where guest_id is not null;

create index if not exists messages_sender_receiver_cursor_idx
  on public.messages (sender_id, receiver_id, sent_at desc, id desc);

create index if not exists messages_receiver_sender_cursor_idx
  on public.messages (receiver_id, sender_id, sent_at desc, id desc);
