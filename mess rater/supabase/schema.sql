-- MESS RATER: schema, RLS and RPCs. Run in Supabase SQL editor, then run seed.sql.
create extension if not exists pgcrypto;

create or replace function ist_today() returns date language sql stable as
$$ select (now() at time zone 'Asia/Kolkata')::date $$;

create table if not exists messes (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  hostels text[] not null default '{}',
  created_at timestamptz default now()
);
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  mess_id uuid not null references messes on delete cascade,
  day_of_week smallint not null check (day_of_week between 1 and 7), -- 1 = Monday
  meal text not null check (meal in ('Breakfast','Lunch','Dinner')),
  name text not null,
  position smallint not null default 0,
  unique (mess_id, day_of_week, meal, name)
);
create table if not exists item_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  menu_item_id uuid not null references menu_items on delete cascade,
  rating_date date not null default ist_today(),
  rating smallint not null check (rating between 1 and 5),
  updated_at timestamptz default now(),
  unique (user_id, menu_item_id, rating_date)
);
create table if not exists meal_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  mess_id uuid not null references messes on delete cascade,
  meal text not null check (meal in ('Breakfast','Lunch','Dinner')),
  rating_date date not null default ist_today(),
  food_quality smallint not null check (food_quality between 1 and 5),
  taste_variety smallint not null check (taste_variety between 1 and 5),
  hygiene smallint not null check (hygiene between 1 and 5),
  comment text check (char_length(comment) <= 500),
  created_at timestamptz default now(),
  unique (user_id, mess_id, meal, rating_date)
);
create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  mess_id uuid not null references messes on delete cascade,
  body text not null check (char_length(body) between 5 and 1000),
  status text not null default 'open' check (status in ('open','reviewed','resolved')),
  created_at timestamptz default now()
);
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  mess_id uuid not null references messes on delete cascade,
  category text not null check (category in ('Hygiene','Food quality','Quantity','Service','Other')),
  body text not null check (char_length(body) between 5 and 1000),
  status text not null default 'open' check (status in ('open','in_progress','resolved')),
  admin_note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table if not exists admins (user_id uuid primary key references auth.users on delete cascade);
create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null default auth.uid(),
  mess_id uuid references messes on delete set null,
  kind text not null, ref_id uuid, note text,
  created_at timestamptz default now()
);

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

-- ---------- Row level security ----------
alter table messes enable row level security;        alter table menu_items enable row level security;
alter table item_ratings enable row level security;  alter table meal_reviews enable row level security;
alter table suggestions enable row level security;   alter table complaints enable row level security;
alter table admins enable row level security;        alter table admin_actions enable row level security;

create policy "read messes"   on messes     for select to authenticated using (true);
create policy "read menus"    on menu_items for select to authenticated using (true);
create policy "admin messes"  on messes     for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin menus"   on menu_items for all to authenticated using (is_admin()) with check (is_admin());
create policy "own item ratings" on item_ratings for select to authenticated using (user_id = auth.uid());
create policy "own reviews"      on meal_reviews for select to authenticated using (user_id = auth.uid() or is_admin());
create policy "own suggestions"  on suggestions  for select to authenticated using (user_id = auth.uid() or is_admin());
create policy "add suggestions"  on suggestions  for insert to authenticated with check (user_id = auth.uid());
create policy "own complaints"   on complaints   for select to authenticated using (user_id = auth.uid() or is_admin());
create policy "add complaints"   on complaints   for insert to authenticated with check (user_id = auth.uid());
create policy "self admin check" on admins       for select to authenticated using (user_id = auth.uid());
create policy "admin actions"    on admin_actions for select to authenticated using (is_admin());
-- Ratings and admin updates are written only through the functions below.

-- ---------- Student functions ----------
create or replace function submit_item_rating(p_menu_item_id uuid, p_rating int)
returns void language plpgsql security definer set search_path = public as $$
declare d int;
begin
  select day_of_week into d from menu_items where id = p_menu_item_id;
  if d is null then raise exception 'Unknown dish'; end if;
  if d <> extract(isodow from ist_today())::int then raise exception 'You can only rate today''s menu'; end if;
  insert into item_ratings (user_id, menu_item_id, rating) values (auth.uid(), p_menu_item_id, p_rating)
  on conflict (user_id, menu_item_id, rating_date) do update set rating = excluded.rating, updated_at = now();
end $$;

create or replace function submit_meal_review(p_mess_id uuid, p_meal text, p_food int, p_taste int, p_hygiene int, p_comment text)
returns void language sql security definer set search_path = public as $$
  insert into meal_reviews (user_id, mess_id, meal, food_quality, taste_variety, hygiene, comment)
  values (auth.uid(), p_mess_id, p_meal, p_food, p_taste, p_hygiene, nullif(trim(p_comment), ''))
  on conflict (user_id, mess_id, meal, rating_date) do update set
    food_quality = excluded.food_quality, taste_variety = excluded.taste_variety,
    hygiene = excluded.hygiene, comment = excluded.comment;
$$;

create or replace function get_item_stats(p_mess_id uuid)
returns table (menu_item_id uuid, name text, meal text, day_of_week smallint,
               avg_today numeric, count_today bigint, avg_all numeric, count_all bigint)
language sql stable security definer set search_path = public as $$
  select m.id, m.name, m.meal, m.day_of_week,
    round(avg(r.rating) filter (where r.rating_date = ist_today()), 1),
    count(r.id) filter (where r.rating_date = ist_today()),
    round(avg(r.rating), 1), count(r.id)
  from menu_items m left join item_ratings r on r.menu_item_id = m.id
  where m.mess_id = p_mess_id group by m.id
$$;

-- Last 30 days, per mess. Student-facing: no admin data.
create or replace function get_mess_summary()
returns table (mess_id uuid, rating_count bigint, avg_overall numeric, avg_food numeric, avg_taste numeric, avg_hygiene numeric)
language sql stable security definer set search_path = public as $$
  select s.id, count(r.id),
    round(avg((r.food_quality + r.taste_variety + r.hygiene) / 3.0), 1),
    round(avg(r.food_quality), 1), round(avg(r.taste_variety), 1), round(avg(r.hygiene), 1)
  from messes s left join meal_reviews r on r.mess_id = s.id and r.rating_date > ist_today() - 30
  group by s.id
$$;

-- ---------- Admin functions ----------
create or replace function admin_performance()
returns table (mess_id uuid, mess_name text, rating_count bigint, avg_overall numeric, avg_food numeric,
               avg_taste numeric, avg_hygiene numeric, open_complaints bigint, open_suggestions bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  return query
  select s.id, s.name, g.rating_count, g.avg_overall, g.avg_food, g.avg_taste, g.avg_hygiene,
    (select count(*) from complaints c where c.mess_id = s.id and c.status <> 'resolved'),
    (select count(*) from suggestions x where x.mess_id = s.id and x.status = 'open')
  from messes s join get_mess_summary() g on g.mess_id = s.id order by g.avg_overall nulls last;
end $$;

create or replace function admin_update_complaint(p_id uuid, p_status text, p_note text)
returns void language plpgsql security definer set search_path = public as $$
declare m uuid;
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  update complaints set status = p_status, admin_note = nullif(trim(p_note), ''), updated_at = now()
   where id = p_id returning mess_id into m;
  insert into admin_actions (mess_id, kind, ref_id, note) values (m, 'complaint:' || p_status, p_id, p_note);
end $$;

create or replace function admin_update_suggestion(p_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare m uuid;
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  update suggestions set status = p_status where id = p_id returning mess_id into m;
  insert into admin_actions (mess_id, kind, ref_id) values (m, 'suggestion:' || p_status, p_id);
end $$;

-- Copy one mess's weekly menu to another (handy until a menu uploader exists).
create or replace function admin_clone_menu(p_from uuid, p_to uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  insert into menu_items (mess_id, day_of_week, meal, name, position)
  select p_to, day_of_week, meal, name, position from menu_items where mess_id = p_from
  on conflict do nothing;
end $$;

grant execute on function submit_item_rating, submit_meal_review, get_item_stats, get_mess_summary,
  admin_performance, admin_update_complaint, admin_update_suggestion, admin_clone_menu, is_admin to authenticated;
-- To make yourself an admin (after signing up):
--   insert into admins select id from auth.users where email = 'you@thapar.edu';
