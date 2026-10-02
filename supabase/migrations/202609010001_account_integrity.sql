-- Apply after 202608310001_shared_volleyball.sql.
-- Adds abuse limits, validated score reporting and privacy-safe self deletion.
begin;

-- Courts are created through an idempotent, rate-limited function from now on.
revoke insert on table public.courts from authenticated;

create function public.create_court(
  p_name text,
  p_lat double precision,
  p_lng double precision,
  p_request_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'Complete your profile first.';
  end if;

  select id into v_id from public.courts where id = p_request_id and created_by = auth.uid();
  if found then return v_id; end if;

  if p_request_id is null then raise exception 'A request ID is required.'; end if;
  if p_name is null or char_length(btrim(p_name)) not between 1 and 120 then
    raise exception 'The court name must contain 1 to 120 characters.';
  end if;
  if p_lat is null or p_lat::text = 'NaN' or p_lat not between -90 and 90
    or p_lng is null or p_lng::text = 'NaN' or p_lng not between -180 and 180 then
    raise exception 'The court coordinates are invalid.';
  end if;
  if (select count(*) from public.courts where created_by = auth.uid() and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Too many courts were created recently. Try again later.';
  end if;

  insert into public.courts(id, created_by, name, lat, lng)
    values (p_request_id, auth.uid(), btrim(p_name), p_lat, p_lng)
    returning id into v_id;
  return v_id;
end;
$$;

-- Preserve idempotency first, then reject accidental or automated match spam.
create or replace function public.create_match(p_location text, p_starts_at timestamptz, p_category text, p_skill text, p_request_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_gender text;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  select gender into v_gender from public.profiles where id = auth.uid();
  if v_gender is null then raise exception 'Complete your profile first.'; end if;

  select id into v_id from public.matches where id = p_request_id and creator_id = auth.uid();
  if found then return v_id; end if;

  if p_request_id is null then raise exception 'A request ID is required.'; end if;
  if p_location is null or char_length(btrim(p_location)) not between 1 and 120 then
    raise exception 'The location must contain 1 to 120 characters.';
  end if;
  if p_starts_at is null or p_starts_at <= now() or p_starts_at > now() + interval '365 days' then
    raise exception 'Choose a start time in the future (within one year).';
  end if;
  if p_category is null or p_category not in ('Men', 'Women', 'Mixed', 'Open') then
    raise exception 'Choose a valid category.';
  end if;
  if p_skill is null or p_skill not in ('Beginner', 'Intermediate', 'Advanced') then
    raise exception 'Choose a valid skill level.';
  end if;
  if (p_category = 'Men' and v_gender <> 'Male') or (p_category = 'Women' and v_gender <> 'Female') then
    raise exception 'This category does not match your profile.';
  end if;
  if (select count(*) from public.matches where creator_id = auth.uid() and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many matches were created recently. Try again later.';
  end if;
  if (select count(*) from public.matches where creator_id = auth.uid() and status = 'open' and starts_at > now()) >= 10 then
    raise exception 'Cancel or complete an existing match before creating another one.';
  end if;

  insert into public.matches(id, creator_id, location, starts_at, category, skill)
    values (p_request_id, auth.uid(), btrim(p_location), p_starts_at, p_category, p_skill)
    returning id into v_id;
  insert into public.match_members(match_id, user_id, team) values (v_id, auth.uid(), 1);
  return v_id;
end;
$$;

-- A score describes team A first and team B second, using two or three sets.
create or replace function public.report_result(p_match_id uuid, p_winning_team smallint, p_score text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_match public.matches;
  v_result public.match_results;
  v_score text;
  v_sets text[];
  v_set text;
  v_pair text[];
  v_wins_a integer := 0;
  v_wins_b integer := 0;
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
  if p_winning_team is null or p_winning_team not in (1, 2) then
    raise exception 'Choose team A or B as the winner.';
  end if;
  if p_score is null or char_length(btrim(p_score)) not between 3 and 100 then
    raise exception 'Enter a valid score.';
  end if;

  v_score := replace(replace(btrim(p_score), '–', '-'), '—', '-');
  v_sets := regexp_split_to_array(v_score, '\s*[,;]\s*');
  if coalesce(array_length(v_sets, 1), 0) not between 2 and 3 then
    raise exception 'Enter two or three sets, for example 21-18, 21-19.';
  end if;
  foreach v_set in array v_sets loop
    v_pair := regexp_match(v_set, '^\s*([0-9]{1,3})\s*[-:]\s*([0-9]{1,3})\s*$');
    if v_pair is null then raise exception 'Enter each set as team A-team B.'; end if;
    if v_pair[1]::integer = v_pair[2]::integer then raise exception 'A set cannot be tied.'; end if;
    if v_pair[1]::integer > v_pair[2]::integer then v_wins_a := v_wins_a + 1;
    else v_wins_b := v_wins_b + 1;
    end if;
  end loop;
  if greatest(v_wins_a, v_wins_b) <> 2 or least(v_wins_a, v_wins_b) > 1 then
    raise exception 'The score must produce exactly one match winner.';
  end if;
  if (p_winning_team = 1 and v_wins_a <> 2) or (p_winning_team = 2 and v_wins_b <> 2) then
    raise exception 'The selected winner does not match the score.';
  end if;

  insert into public.match_results(match_id, reporter_id, winning_team, score)
    values (p_match_id, auth.uid(), p_winning_team, v_score)
    on conflict (match_id) do update set reporter_id = auth.uid(), winning_team = excluded.winning_team,
      score = excluded.score, status = 'pending', reviewed_by = null, reviewed_at = null, reported_at = now();
  update public.matches set status = 'awaiting_confirmation' where id = p_match_id;
end;
$$;

-- Deletion removes the account and matches in which it participated. Removing
-- those matches avoids retaining a public identity or leaving incomplete teams.
create function public.delete_my_account(p_confirmation text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid; v_deleted integer;
begin
  v_user_id := auth.uid();
  if v_user_id is null then raise exception 'Sign in first.'; end if;
  if p_confirmation is distinct from 'DELETE' then raise exception 'Account deletion was not confirmed.'; end if;

  delete from public.matches
    where id in (select match_id from public.match_members where user_id = v_user_id);
  delete from public.courts where created_by = v_user_id;
  delete from auth.users where id = v_user_id;
  get diagnostics v_deleted = row_count;
  if v_deleted <> 1 then raise exception 'Account not found.'; end if;
end;
$$;

revoke all on function public.create_court(text, double precision, double precision, uuid) from public, anon;
revoke all on function public.create_match(text, timestamptz, text, text, uuid) from public, anon;
revoke all on function public.report_result(uuid, smallint, text) from public, anon;
revoke all on function public.delete_my_account(text) from public, anon;
grant execute on function public.create_court(text, double precision, double precision, uuid) to authenticated;
grant execute on function public.create_match(text, timestamptz, text, text, uuid) to authenticated;
grant execute on function public.report_result(uuid, smallint, text) to authenticated;
grant execute on function public.delete_my_account(text) to authenticated;

commit;
