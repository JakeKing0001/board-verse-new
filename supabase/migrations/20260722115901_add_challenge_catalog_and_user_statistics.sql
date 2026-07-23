alter table public.challenges
  add column if not exists title text not null default 'Sfida tattica',
  add column if not exists description text not null default 'Trova la continuazione vincente.',
  add column if not exists difficulty text not null default 'beginner',
  add column if not exists theme text not null default 'Tattica',
  add column if not exists rating integer not null default 800,
  add column if not exists hint text,
  add column if not exists sort_order integer,
  add column if not exists solution_moves jsonb not null default '[]'::jsonb;

alter table public.challenges
  drop constraint if exists challenges_difficulty_check;

alter table public.challenges
  add constraint challenges_difficulty_check
  check (difficulty in ('beginner', 'intermediate', 'advanced', 'expert'));

alter table public.challenges
  drop constraint if exists challenges_rating_check;

alter table public.challenges
  add constraint challenges_rating_check
  check (rating between 400 and 3000);

create unique index if not exists challenges_fen_key
  on public.challenges (fen);

create index if not exists challenges_catalog_order_idx
  on public.challenges (difficulty, sort_order, id);

insert into public.challenges (
  fen,
  number_moves,
  cpu_moves,
  title,
  description,
  difficulty,
  theme,
  rating,
  hint,
  sort_order,
  solution_moves
)
values
  (
    'rnb1k2r/1p1ppp2/p1p2Q2/7p/4nb1p/3PPN2/PPP3PR/RNB1KB2 w Qkq - 2 13',
    1,
    '[]'::jsonb,
    'La torre intrappolata',
    'Il re nero non ha case di fuga: trova il colpo di donna decisivo.',
    'beginner',
    'Matto con la donna',
    700,
    'Controlla la diagonale che termina in h8.',
    1,
    '["f6h8"]'::jsonb
  ),
  (
    '1nbk3r/1pp1np1p/rb1pp3/BB4N1/3PP3/1PPQ2q1/5PP1/RN3RK1 w - - 1 18',
    1,
    '[]'::jsonb,
    'Il salto del cavallo',
    'Un cavallo può chiudere la partita sfruttando il re al centro.',
    'beginner',
    'Matto di cavallo',
    760,
    'Cerca uno scacco in f7.',
    2,
    '["g5f7"]'::jsonb
  ),
  (
    'b5r1/5n2/7p/p1B1ppk1/2p4R/2P1K1P1/N7/5q2 b - - 1 44',
    1,
    '[]'::jsonb,
    'Ingresso in prima traversa',
    'La donna nera può sfruttare il re esposto con uno scacco imparabile.',
    'beginner',
    'Matto sulla traversa',
    820,
    'La casa e1 è il punto debole.',
    3,
    '["f1e1"]'::jsonb
  ),
  (
    '1nbq2n1/1p1kbppr/2p4p/r2p4/pP3PPP/B7/P1PPP3/RN1QKBN1 b Q - 0 11',
    1,
    '[]'::jsonb,
    'Diagonale mortale',
    'L’alfiere può attraversare la diagonale e sorprendere il re bianco.',
    'intermediate',
    'Attacco diagonale',
    900,
    'Segui la diagonale e7–h4.',
    4,
    '["e7h4"]'::jsonb
  ),
  (
    'rn1k2r1/2pn1pb1/pN4pp/1p6/1P1pQPP1/7B/P1P4P/RN1KR3 w - - 1 29',
    1,
    '[]'::jsonb,
    'La donna invade',
    'Il re nero è bloccato dai propri pezzi: trova lo scacco matto.',
    'intermediate',
    'Rete di matto',
    980,
    'La settima traversa è decisiva.',
    5,
    '["e4e7"]'::jsonb
  ),
  (
    'rnbqkr2/pp1p1ppp/3bp3/1Np2P2/2P3n1/5N1P/PP1PP1P1/R1BQKB1R b KQq - 2 7',
    1,
    '[]'::jsonb,
    'Pressione su g3',
    'L’arrocco incompleto lascia una casa critica vicino al re.',
    'intermediate',
    'Matto di alfiere',
    1050,
    'L’alfiere in d6 ha una diagonale aperta.',
    6,
    '["d6g3"]'::jsonb
  ),
  (
    'rn1qkbnr/ppp1p3/4b3/3pKpp1/3P3p/4P2N/PPP1QPPP/1RBN1B1R b kq - 1 11',
    1,
    '[]'::jsonb,
    'Il re in territorio nemico',
    'Punisci il re bianco troppo avanzato con una mossa precisa di donna.',
    'advanced',
    'Re esposto',
    1150,
    'La donna deve dare scacco dalla sesta traversa.',
    7,
    '["d8d6"]'::jsonb
  ),
  (
    '1k2r2r/pppb2p1/B1n2p1n/5Q2/P4P1R/4ppq1/1PPN4/R1B2K2 b - - 8 26',
    1,
    '[]'::jsonb,
    'Sacrificio in f2',
    'La donna può concludere l’attacco nonostante la difesa del cavallo.',
    'advanced',
    'Coordinazione dei pezzi',
    1240,
    'La casa f2 è protetta, ma il re non può salvarsi.',
    8,
    '["g3f2"]'::jsonb
  ),
  (
    'rnbqkb1r/p1ppnp2/4p2p/1p2N3/2P1N1pP/P2PP3/1P3PP1/R1BQKB1R w KQkq - 2 10',
    1,
    '[]'::jsonb,
    'Forchetta finale',
    'Un salto di cavallo unisce controllo delle case e scacco matto.',
    'advanced',
    'Cavallo dominante',
    1320,
    'Il cavallo centrale può raggiungere f6.',
    9,
    '["e4f6"]'::jsonb
  ),
  (
    '2rkr3/n5bq/Np1p4/1Pp5/p4p2/P1B4N/R1PQB3/2K5 w - - 6 40',
    1,
    '[]'::jsonb,
    'La colonna aperta',
    'La donna sfrutta l’allineamento del re e dei pezzi pesanti.',
    'expert',
    'Deviazione',
    1430,
    'Cerca una cattura con scacco sulla sesta traversa.',
    10,
    '["d2d6"]'::jsonb
  ),
  (
    '5r2/2rB4/bp2pk1P/3R1p2/1PPP1P2/2N1Q1p1/6PB/1N2K3 w - - 1 31',
    1,
    '[]'::jsonb,
    'Il muro di pedoni',
    'I pedoni nemici limitano il proprio re: la donna trova il varco.',
    'expert',
    'Autoblocco',
    1510,
    'La casa e6 è controllata da tutta la posizione bianca.',
    11,
    '["e3e6"]'::jsonb
  ),
  (
    'q2B2kr/3pb2p/1r2p3/Np3Pp1/p1Pp4/3n3P/2R4K/Q4bNR b - - 1 35',
    1,
    '[]'::jsonb,
    'Il colpo silenzioso',
    'In una posizione complessa l’alfiere trova l’unico matto disponibile.',
    'expert',
    'Unica mossa',
    1620,
    'L’alfiere in e7 deve controllare la diagonale del re.',
    12,
    '["e7d6"]'::jsonb
  )
on conflict (fen) do update
set
  number_moves = excluded.number_moves,
  cpu_moves = excluded.cpu_moves,
  title = excluded.title,
  description = excluded.description,
  difficulty = excluded.difficulty,
  theme = excluded.theme,
  rating = excluded.rating,
  hint = excluded.hint,
  sort_order = excluded.sort_order,
  solution_moves = excluded.solution_moves;

with catalog_state as (
  select coalesce(max(sort_order), 0) as last_position
  from public.challenges
),
legacy_challenges as (
  select
    challenge.id,
    catalog_state.last_position + row_number() over (order by challenge.id) as catalog_position
  from public.challenges challenge
  cross join catalog_state
  where challenge.sort_order is null
)
update public.challenges challenge
set
  sort_order = legacy.catalog_position,
  title = case
    when challenge.title = 'Sfida tattica' then 'Sfida classica ' || legacy.catalog_position
    else challenge.title
  end,
  description = case
    when challenge.description = 'Trova la continuazione vincente.'
      then 'Una posizione classica dal catalogo originale di BoardVerse.'
    else challenge.description
  end,
  theme = case when challenge.theme = 'Tattica' then 'Tattica classica' else challenge.theme end,
  rating = case when challenge.rating = 800 then 850 + legacy.catalog_position * 25 else challenge.rating end
from legacy_challenges legacy
where challenge.id = legacy.id;

revoke select on table public.challenges from anon, authenticated;
grant select (
  id,
  fen,
  number_moves,
  created_at,
  cpu_moves,
  title,
  description,
  difficulty,
  theme,
  rating,
  hint,
  sort_order
) on table public.challenges to anon, authenticated;

alter table public.games
  add column if not exists completed_at timestamptz,
  add column if not exists game_duration_seconds integer;

alter table public.games
  drop constraint if exists games_duration_nonnegative;

alter table public.games
  add constraint games_duration_nonnegative
  check (game_duration_seconds is null or game_duration_seconds >= 0);

update public.games
set
  completed_at = coalesce(completed_at, created_at),
  game_duration_seconds = coalesce(game_duration_seconds, 0)
where status = 'complete'
  and (completed_at is null or game_duration_seconds is null);

create index if not exists games_participation_completed_idx
  on public.games (status, completed_at desc, host_id, guest_id);

create index if not exists games_host_completed_idx
  on public.games (host_id, completed_at desc)
  where status = 'complete' and guest_id is not null;

create index if not exists games_guest_completed_idx
  on public.games (guest_id, completed_at desc)
  where status = 'complete' and guest_id is not null;

create index if not exists messages_sender_receiver_sent_idx
  on public.messages (sender_id, receiver_id, sent_at);

create index if not exists messages_receiver_sender_sent_idx
  on public.messages (receiver_id, sender_id, sent_at);

create index if not exists messages_unread_recipient_idx
  on public.messages (receiver_id, sender_id)
  where unread > 0;

revoke update (text, sent_at) on table public.messages from authenticated;
grant update (unread) on table public.messages to authenticated;

drop policy if exists messages_update_participant on public.messages;
drop policy if exists messages_mark_received_read on public.messages;
create policy messages_mark_received_read on public.messages
for update to authenticated
using (
  receiver_id = (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
)
with check (
  receiver_id = (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
);

create table if not exists public.user_statistics (
  user_id integer primary key references public.users(id) on delete cascade,
  matches_played integer not null default 0 check (matches_played >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  draws integer not null default 0 check (draws >= 0),
  challenges_completed integer not null default 0 check (challenges_completed >= 0),
  current_win_streak integer not null default 0 check (current_win_streak >= 0),
  best_win_streak integer not null default 0 check (best_win_streak >= 0),
  total_game_duration_seconds bigint not null default 0 check (total_game_duration_seconds >= 0),
  experience_points integer not null default 0 check (experience_points >= 0),
  updated_at timestamptz not null default now()
);

alter table public.user_statistics enable row level security;

create index if not exists user_statistics_leaderboard_idx
  on public.user_statistics (
    experience_points desc,
    wins desc,
    challenges_completed desc,
    user_id
  );

revoke all on table public.user_statistics from anon, authenticated;

drop policy if exists user_statistics_select_own on public.user_statistics;
create policy user_statistics_select_own on public.user_statistics
for select to authenticated
using (
  user_id = (
    select profile.id
    from public.users profile
    where profile.auth_user_id = (select auth.uid())
  )
);

create or replace function private.set_game_completion_details()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'complete'
    and (tg_op = 'INSERT' or old.status is distinct from 'complete')
  then
    new.completed_at := coalesce(new.completed_at, now());
    new.game_duration_seconds := coalesce(
      new.game_duration_seconds,
      greatest(0, extract(epoch from (new.completed_at - new.created_at))::integer)
    );
  end if;

  return new;
end;
$$;

revoke all on function private.set_game_completion_details() from public, anon, authenticated;

drop trigger if exists set_game_completion_details on public.games;
create trigger set_game_completion_details
before insert or update on public.games
for each row execute function private.set_game_completion_details();

create or replace function private.refresh_user_statistics(target_user_id integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  calculated_matches integer := 0;
  calculated_wins integer := 0;
  calculated_losses integer := 0;
  calculated_draws integer := 0;
  calculated_challenges integer := 0;
  calculated_current_streak integer := 0;
  calculated_best_streak integer := 0;
  calculated_duration bigint := 0;
begin
  if target_user_id is null
    or not exists (select 1 from public.users profile where profile.id = target_user_id)
  then
    return;
  end if;

  select
    count(*)::integer,
    count(*) filter (where game.winner_id = target_user_id)::integer,
    count(*) filter (where game.result = 'draw')::integer,
    count(*) filter (
      where game.result in ('white', 'black')
        and game.winner_id is distinct from target_user_id
    )::integer,
    coalesce(sum(game.game_duration_seconds), 0)::bigint
  into
    calculated_matches,
    calculated_wins,
    calculated_draws,
    calculated_losses,
    calculated_duration
  from public.games game
  where game.status = 'complete'
    and game.guest_id is not null
    and target_user_id in (game.host_id, game.guest_id);

  select count(*)::integer
  into calculated_challenges
  from public.challenge_completed completion
  where completion.user_id = target_user_id;

  with ordered_results as (
    select
      game.winner_id,
      row_number() over (
        order by game.completed_at desc nulls last, game.created_at desc, game.id desc
      ) as result_order
    from public.games game
    where game.status = 'complete'
      and game.guest_id is not null
      and target_user_id in (game.host_id, game.guest_id)
  ),
  first_non_win as (
    select min(result_order) as result_order
    from ordered_results
    where winner_id is distinct from target_user_id
  )
  select count(*)::integer
  into calculated_current_streak
  from ordered_results
  where winner_id = target_user_id
    and result_order < coalesce(
      (select result_order from first_non_win),
      2147483647
    );

  with ordered_results as (
    select
      game.winner_id = target_user_id as is_win,
      row_number() over (
        order by game.completed_at nulls first, game.created_at, game.id
      ) as result_order
    from public.games game
    where game.status = 'complete'
      and game.guest_id is not null
      and target_user_id in (game.host_id, game.guest_id)
  ),
  grouped_wins as (
    select
      result_order - row_number() over (partition by is_win order by result_order) as streak_group
    from ordered_results
    where is_win
  ),
  streaks as (
    select count(*)::integer as streak_length
    from grouped_wins
    group by streak_group
  )
  select coalesce(max(streak_length), 0)
  into calculated_best_streak
  from streaks;

  insert into public.user_statistics (
    user_id,
    matches_played,
    wins,
    losses,
    draws,
    challenges_completed,
    current_win_streak,
    best_win_streak,
    total_game_duration_seconds,
    experience_points,
    updated_at
  )
  values (
    target_user_id,
    calculated_matches,
    calculated_wins,
    calculated_losses,
    calculated_draws,
    calculated_challenges,
    calculated_current_streak,
    greatest(calculated_best_streak, calculated_current_streak),
    calculated_duration,
    calculated_wins * 30 + calculated_draws * 10 + calculated_challenges * 20,
    now()
  )
  on conflict (user_id) do update
  set
    matches_played = excluded.matches_played,
    wins = excluded.wins,
    losses = excluded.losses,
    draws = excluded.draws,
    challenges_completed = excluded.challenges_completed,
    current_win_streak = excluded.current_win_streak,
    best_win_streak = excluded.best_win_streak,
    total_game_duration_seconds = excluded.total_game_duration_seconds,
    experience_points = excluded.experience_points,
    updated_at = excluded.updated_at;
end;
$$;

revoke all on function private.refresh_user_statistics(integer) from public, anon, authenticated;

create or replace function private.initialize_user_statistics()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.refresh_user_statistics(new.id);
  return new;
end;
$$;

revoke all on function private.initialize_user_statistics() from public, anon, authenticated;

drop trigger if exists initialize_user_statistics on public.users;
create trigger initialize_user_statistics
after insert on public.users
for each row execute function private.initialize_user_statistics();

create or replace function private.handle_game_statistics_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.status = 'complete' then
    perform private.refresh_user_statistics(old.host_id);
    perform private.refresh_user_statistics(old.guest_id);
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.status = 'complete' then
    perform private.refresh_user_statistics(new.host_id);
    perform private.refresh_user_statistics(new.guest_id);
  end if;

  return null;
end;
$$;

revoke all on function private.handle_game_statistics_change() from public, anon, authenticated;

drop trigger if exists refresh_statistics_after_game on public.games;
create trigger refresh_statistics_after_game
after insert or update or delete on public.games
for each row execute function private.handle_game_statistics_change();

create or replace function private.handle_challenge_statistics_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform private.refresh_user_statistics(old.user_id);
    return old;
  end if;

  perform private.refresh_user_statistics(new.user_id);
  return new;
end;
$$;

revoke all on function private.handle_challenge_statistics_change() from public, anon, authenticated;

drop trigger if exists refresh_statistics_after_challenge on public.challenge_completed;
create trigger refresh_statistics_after_challenge
after insert or delete on public.challenge_completed
for each row execute function private.handle_challenge_statistics_change();

do $$
declare
  profile record;
begin
  for profile in select id from public.users loop
    perform private.refresh_user_statistics(profile.id);
  end loop;
end;
$$;

create or replace function public.get_my_statistics()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_user_id integer;
  response jsonb;
begin
  if (select auth.uid()) is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;

  select profile.id
  into current_user_id
  from public.users profile
  where profile.auth_user_id = (select auth.uid());

  if current_user_id is null then
    raise no_data_found using message = 'Authenticated profile not found';
  end if;

  with month_buckets as (
    select generate_series(
      date_trunc('month', now()) - interval '5 months',
      date_trunc('month', now()),
      interval '1 month'
    )::date as bucket
  ),
  monthly_activity as (
    select
      to_char(month.bucket, 'YYYY-MM') as period,
      count(game.id)::integer as matches,
      count(game.id) filter (where game.winner_id = current_user_id)::integer as wins
    from month_buckets month
    left join public.games game
      on game.status = 'complete'
      and game.guest_id is not null
      and current_user_id in (game.host_id, game.guest_id)
      and game.completed_at >= month.bucket
      and game.completed_at < month.bucket + interval '1 month'
    group by month.bucket
    order by month.bucket
  ),
  day_buckets as (
    select generate_series(
      current_date - 6,
      current_date,
      interval '1 day'
    )::date as bucket
  ),
  weekly_activity as (
    select
      to_char(day.bucket, 'YYYY-MM-DD') as day,
      count(game.id)::integer as matches
    from day_buckets day
    left join public.games game
      on game.status = 'complete'
      and game.guest_id is not null
      and current_user_id in (game.host_id, game.guest_id)
      and game.completed_at >= day.bucket
      and game.completed_at < day.bucket + interval '1 day'
    group by day.bucket
    order by day.bucket
  ),
  leaderboard as (
    select
      statistic.user_id,
      rank() over (
        order by
          statistic.experience_points desc,
          statistic.wins desc,
          statistic.challenges_completed desc
      )::integer as position,
      count(*) over ()::integer as player_count
    from public.user_statistics statistic
  )
  select jsonb_build_object(
    'matchesPlayed', statistic.matches_played,
    'wins', statistic.wins,
    'losses', statistic.losses,
    'draws', statistic.draws,
    'challengesCompleted', statistic.challenges_completed,
    'currentWinStreak', statistic.current_win_streak,
    'bestWinStreak', statistic.best_win_streak,
    'averageGameDurationSeconds', case
      when statistic.matches_played = 0 then 0
      else round(statistic.total_game_duration_seconds::numeric / statistic.matches_played)::integer
    end,
    'experiencePoints', statistic.experience_points,
    'ranking', coalesce(leaderboard.position, 1),
    'totalPlayers', coalesce(leaderboard.player_count, 1),
    'monthly', coalesce((select jsonb_agg(to_jsonb(monthly_activity)) from monthly_activity), '[]'::jsonb),
    'weekly', coalesce((select jsonb_agg(to_jsonb(weekly_activity)) from weekly_activity), '[]'::jsonb)
  )
  into response
  from public.user_statistics statistic
  left join leaderboard on leaderboard.user_id = statistic.user_id
  where statistic.user_id = current_user_id;

  return coalesce(
    response,
    jsonb_build_object(
      'matchesPlayed', 0,
      'wins', 0,
      'losses', 0,
      'draws', 0,
      'challengesCompleted', 0,
      'currentWinStreak', 0,
      'bestWinStreak', 0,
      'averageGameDurationSeconds', 0,
      'experiencePoints', 0,
      'ranking', 1,
      'totalPlayers', 1,
      'monthly', '[]'::jsonb,
      'weekly', '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.get_my_statistics() from public, anon;
grant execute on function public.get_my_statistics() to authenticated;
