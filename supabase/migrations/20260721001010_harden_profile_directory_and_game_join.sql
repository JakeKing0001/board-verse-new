create or replace function public.get_user_directory()
returns table (
  id integer,
  full_name text,
  created_at timestamptz,
  avatar text,
  username text,
  bio text,
  location text,
  profile_visibility text,
  show_online_status boolean,
  show_play_history boolean,
  allow_friend_requests boolean,
  last_seen timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with current_profile as (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
  select
    profile.id,
    profile.full_name,
    profile.created_at,
    profile.avatar,
    profile.username,
    profile.bio,
    profile.location,
    profile.profile_visibility,
    profile.show_online_status,
    profile.show_play_history,
    profile.allow_friend_requests,
    profile.last_seen
  from public.users profile
  where profile.profile_visibility = 'public'
    or profile.id = (select id from current_profile)
    or exists (
      select 1
      from public.friendships friendship
      where (
        friendship.user_id = (select id from current_profile)
        and friendship.friend_id = profile.id
      ) or (
        friendship.friend_id = (select id from current_profile)
        and friendship.user_id = profile.id
      )
    )
    or exists (
      select 1
      from public.friend_requests request
      where (
        request.sender_id = (select id from current_profile)
        and request.receiver_id = profile.id
      ) or (
        request.receiver_id = (select id from current_profile)
        and request.sender_id = profile.id
      )
    )
    or exists (
      select 1
      from public.games game
      where (
        game.host_id = (select id from current_profile)
        and game.guest_id = profile.id
      ) or (
        game.guest_id = (select id from current_profile)
        and game.host_id = profile.id
      )
    );
$$;

revoke all on function public.get_user_directory() from public, anon;
grant execute on function public.get_user_directory() to authenticated;

drop policy if exists users_select_authenticated on public.users;
create policy users_select_own on public.users
for select to authenticated
using (auth_user_id = (select auth.uid()));

create or replace function private.enforce_game_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_profile_id integer;
begin
  select profile.id
  into current_profile_id
  from public.users profile
  where profile.auth_user_id = (select auth.uid());

  if current_profile_id is null then
    raise insufficient_privilege using message = 'Authenticated profile not found';
  end if;

  if current_profile_id in (old.host_id, old.guest_id) then
    return new;
  end if;

  if old.guest_id is null
    and old.status = 'waiting'
    and new.guest_id = current_profile_id
    and new.status = 'playing'
    and new.id is not distinct from old.id
    and new.name is not distinct from old.name
    and new.host_id is not distinct from old.host_id
    and new.created_at is not distinct from old.created_at
    and new.is_private is not distinct from old.is_private
    and new.time is not distinct from old.time
    and new.white_time_remaining is not distinct from old.white_time_remaining
    and new.black_time_remaining is not distinct from old.black_time_remaining
    and new.winner_id is not distinct from old.winner_id
    and new.result is not distinct from old.result
  then
    return new;
  end if;

  raise insufficient_privilege using message = 'Only a clean game join is allowed';
end;
$$;

revoke all on function private.enforce_game_update() from public, anon, authenticated;

drop trigger if exists enforce_game_update on public.games;
create trigger enforce_game_update
before update on public.games
for each row execute function private.enforce_game_update();
