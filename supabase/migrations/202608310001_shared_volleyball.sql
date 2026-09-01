-- Apply once to a new Supabase project. All mutations of matches run atomically.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 60),
  gender text not null check (gender in ('Male', 'Female')),
  preferred_side text check (preferred_side in ('Left', 'Right')),
  created_at timestamptz not null default now()
);
create table public.courts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  created_at timestamptz not null default now()
);
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id),
  location text not null check (char_length(btrim(location)) between 1 and 120),
  starts_at timestamptz not null,
  category text not null check (category in ('Men', 'Women', 'Mixed', 'Open')),
  skill text not null check (skill in ('Beginner', 'Intermediate', 'Advanced')),
  status text not null default 'open' check (status in ('open', 'awaiting_confirmation', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);
create index matches_starts_at_idx on public.matches(starts_at);
create table public.match_members (
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  team smallint not null check (team in (1, 2)),
  joined_at timestamptz not null default now(),
  primary key (match_id, user_id)
);
create index match_members_user_idx on public.match_members(user_id);
create table public.match_results (
  match_id uuid primary key references public.matches(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id),
  winning_team smallint not null check (winning_team in (1, 2)),
  score text not null check (char_length(btrim(score)) between 1 and 100),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'disputed')),
  reviewed_by uuid references public.profiles(id),
  reported_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.courts enable row level security;
alter table public.matches enable row level security;
alter table public.match_members enable row level security;
alter table public.match_results enable row level security;

-- Public player profiles deliberately contain no email addresses or auth tokens.
create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_create_self on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy courts_read on public.courts for select to authenticated using (true);
create policy courts_create_self on public.courts for insert to authenticated with check (created_by = (select auth.uid()));
create policy matches_read on public.matches for select to authenticated using (true);
create policy members_read on public.match_members for select to authenticated using (true);
create policy results_read on public.match_results for select to authenticated using (true);

revoke all on public.profiles, public.courts, public.matches, public.match_members, public.match_results from anon, authenticated;
grant select on public.profiles, public.courts, public.matches, public.match_members, public.match_results to authenticated;
grant insert (id, display_name, gender), update (display_name, gender, preferred_side) on public.profiles to authenticated;
grant insert (created_by, name, lat, lng) on public.courts to authenticated;

-- SECURITY DEFINER routines have a fixed search_path and explicit auth checks.
create function public.create_match(p_location text, p_starts_at timestamptz, p_category text, p_skill text, p_request_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_gender text;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select gender into v_gender from public.profiles where id = auth.uid();
  if v_gender is null then raise exception 'Complete your profile first.'; end if;
  -- Idempotency: retries after a lost response must not create a second match.
  select id into v_id from public.matches where id = p_request_id and creator_id = auth.uid();
  if found then return v_id; end if;
  if p_starts_at is null or p_starts_at <= now() or p_starts_at > now() + interval '365 days' then
    raise exception 'Choose a start time in the future (within one year).';
  end if;
  if (p_category = 'Men' and v_gender <> 'Male') or (p_category = 'Women' and v_gender <> 'Female') then
    raise exception 'This category does not match your profile.';
  end if;
  insert into public.matches(id, creator_id, location, starts_at, category, skill)
    values (p_request_id, auth.uid(), btrim(p_location), p_starts_at, p_category, p_skill) returning id into v_id;
  insert into public.match_members(match_id, user_id, team) values (v_id, auth.uid(), 1);
  return v_id;
end;
$$;

create function public.join_match(p_match_id uuid, p_team smallint)
returns void language plpgsql security definer set search_path = '' as $$
declare v_match public.matches; v_gender text;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into v_match from public.matches where id = p_match_id for update;
  if not found then raise exception 'Match not found.'; end if;
  if exists (select 1 from public.match_members where match_id = p_match_id and user_id = auth.uid()) then return; end if;
  if v_match.status <> 'open' or v_match.starts_at <= now() then raise exception 'This match is no longer accepting players.'; end if;
  if p_team is null or p_team not in (1, 2) then raise exception 'Choose team A or B.'; end if;
  select gender into v_gender from public.profiles where id = auth.uid();
  if v_gender is null then raise exception 'Complete your profile first.'; end if;
  if (v_match.category = 'Men' and v_gender <> 'Male') or (v_match.category = 'Women' and v_gender <> 'Female') then
    raise exception 'This category does not match your profile.';
  end if;
  if (select count(*) from public.match_members where match_id = p_match_id and team = p_team) >= 2 then
    raise exception 'This team is full.';
  end if;
  if v_match.category = 'Mixed' and exists (
    select 1 from public.match_members mm join public.profiles p on p.id = mm.user_id
    where mm.match_id = p_match_id and mm.team = p_team and p.gender = v_gender
  ) then raise exception 'Mixed teams need one male and one female player.'; end if;
  insert into public.match_members(match_id, user_id, team) values (p_match_id, auth.uid(), p_team);
end;
$$;

create function public.leave_match(p_match_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_match public.matches;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into v_match from public.matches where id = p_match_id for update;
  if not found then raise exception 'Match not found.'; end if;
  if v_match.status <> 'open' then raise exception 'Players are locked after an outcome is reported.'; end if;
  if v_match.creator_id = auth.uid() then raise exception 'The organizer must cancel the match instead.'; end if;
  delete from public.match_members where match_id = p_match_id and user_id = auth.uid();
end;
$$;

create function public.cancel_match(p_match_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_match public.matches;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into v_match from public.matches where id = p_match_id for update;
  if not found or v_match.creator_id <> auth.uid() then raise exception 'Only the organizer may cancel this match.'; end if;
  if v_match.status = 'cancelled' then return; end if;
  if v_match.status <> 'open' then raise exception 'A reported match cannot be cancelled.'; end if;
  update public.matches set status = 'cancelled' where id = p_match_id;
end;
$$;

create function public.report_result(p_match_id uuid, p_winning_team smallint, p_score text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_match public.matches; v_result public.match_results;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select * into v_match from public.matches where id = p_match_id for update;
  if not found then raise exception 'Match not found.'; end if;
  if not exists (select 1 from public.match_members where match_id = p_match_id and user_id = auth.uid()) then
    raise exception 'Only participants can report a result.';
  end if;
  select * into v_result from public.match_results where match_id = p_match_id;
  if found and v_result.status <> 'disputed' then
    if v_result.reporter_id = auth.uid() and v_result.winning_team = p_winning_team and v_result.score = btrim(p_score) then return; end if;
    raise exception 'A result is already pending or confirmed.';
  end if;
  if v_match.status not in ('open', 'awaiting_confirmation') or v_match.starts_at > now() then
    raise exception 'Results can only be reported after the match starts.';
  end if;
  if (select count(*) from public.match_members where match_id = p_match_id) <> 4 then
    raise exception 'A 2v2 match needs four participants before reporting a result.';
  end if;
  insert into public.match_results(match_id, reporter_id, winning_team, score)
    values (p_match_id, auth.uid(), p_winning_team, btrim(p_score))
    on conflict (match_id) do update set reporter_id = auth.uid(), winning_team = excluded.winning_team,
      score = excluded.score, status = 'pending', reviewed_by = null, reviewed_at = null, reported_at = now();
  update public.matches set status = 'awaiting_confirmation' where id = p_match_id;
end;
$$;

create function public.review_result(p_match_id uuid, p_confirm boolean, p_reported_at timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
declare v_result public.match_results; v_my_team smallint; v_reporter_team smallint;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  perform 1 from public.matches where id = p_match_id for update;
  select * into v_result from public.match_results where match_id = p_match_id;
  if not found then raise exception 'No result to review.'; end if;
  if p_confirm is null or p_reported_at is distinct from v_result.reported_at then
    raise exception 'The result changed. Refresh before reviewing.';
  end if;
  select team into v_my_team from public.match_members where match_id = p_match_id and user_id = auth.uid();
  select team into v_reporter_team from public.match_members where match_id = p_match_id and user_id = v_result.reporter_id;
  if v_my_team is null or v_my_team = v_reporter_team then raise exception 'A player from the opposing team must review the result.'; end if;
  if v_result.status <> 'pending' then
    if v_result.reviewed_by = auth.uid() and ((p_confirm and v_result.status = 'confirmed') or (not p_confirm and v_result.status = 'disputed')) then return; end if;
    raise exception 'This result has already been reviewed.';
  end if;
  update public.match_results set status = case when p_confirm then 'confirmed' else 'disputed' end,
    reviewed_by = auth.uid(), reviewed_at = now() where match_id = p_match_id;
  update public.matches set status = case when p_confirm then 'completed' else 'awaiting_confirmation' end where id = p_match_id;
end;
$$;

revoke all on function public.create_match(text, timestamptz, text, text, uuid) from public, anon;
revoke all on function public.join_match(uuid, smallint) from public, anon;
revoke all on function public.leave_match(uuid) from public, anon;
revoke all on function public.cancel_match(uuid) from public, anon;
revoke all on function public.report_result(uuid, smallint, text) from public, anon;
revoke all on function public.review_result(uuid, boolean, timestamptz) from public, anon;
grant execute on function public.create_match(text, timestamptz, text, text, uuid) to authenticated;
grant execute on function public.join_match(uuid, smallint) to authenticated;
grant execute on function public.leave_match(uuid) to authenticated;
grant execute on function public.cancel_match(uuid) to authenticated;
grant execute on function public.report_result(uuid, smallint, text) to authenticated;
grant execute on function public.review_result(uuid, boolean, timestamptz) to authenticated;

-- No Realtime setup required: the initial client refreshes every 15 seconds and on foreground.
commit;
