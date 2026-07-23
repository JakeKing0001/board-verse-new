drop function if exists public.join_game(integer, uuid);
drop function if exists public.join_game(uuid, uuid);

create function public.join_game(
  target_game_id uuid default null,
  target_join_code uuid default null
)
returns table (
  id uuid,
  name text,
  host_id integer,
  guest_id integer,
  status text,
  is_private boolean,
  join_code uuid,
  "time" bigint,
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

revoke all on function public.join_game(uuid, uuid)
  from public, anon;
grant execute on function public.join_game(uuid, uuid)
  to authenticated;

drop function if exists public.submit_game_move(integer, text, text, text);
drop function if exists public.submit_game_move(uuid, text, text, text);

create function public.submit_game_move(
  target_game_id uuid,
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
