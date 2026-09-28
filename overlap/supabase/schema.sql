-- Overlap: run this once in the Supabase SQL editor.

-- One row per person. The handle appears in their links: overlap.app/<work>/<handle>
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text not null unique check (handle ~ '^[a-z0-9_]{2,24}$'),
  created_at timestamptz not null default now()
);

-- One row per person per day. "Today" is the global UTC day.
create table public.picks (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  day date not null default ((now() at time zone 'utc')::date),
  type text not null check (type in ('film', 'book', 'song')),
  work_key text not null,          -- id from TMDB / Open Library / iTunes
  slug text not null,              -- title + creator, e.g. stalker-andrei-tarkovsky
  title text not null,
  creator text not null,
  year int,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);
create index picks_slug_day on public.picks (slug, day desc);
create index picks_user_day on public.picks (user_id, day desc);

-- The server clock decides the day, never the browser.
create function public.stamp_utc_day() returns trigger language plpgsql as $$
begin
  new.day := (now() at time zone 'utc')::date;
  return new;
end $$;
create trigger picks_stamp_day before insert or update on public.picks
  for each row execute function public.stamp_utc_day();

alter table public.profiles enable row level security;
alter table public.picks enable row level security;

-- Everything is public to read.
create policy "profiles are public" on public.profiles for select using (true);
create policy "picks are public" on public.picks for select using (true);

-- People can only create their own profile and handle.
create policy "claim own profile" on public.profiles for insert with check (auth.uid() = id);

-- People can only add, change or remove their own pick, and only today's.
create policy "add own pick" on public.picks for insert with check (auth.uid() = user_id);
create policy "change own pick today" on public.picks for update
  using (auth.uid() = user_id and day = (now() at time zone 'utc')::date)
  with check (auth.uid() = user_id);
create policy "remove own pick today" on public.picks for delete
  using (auth.uid() = user_id and day = (now() at time zone 'utc')::date);
