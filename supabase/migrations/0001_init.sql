-- Al Muttaqin Cultural Center: skema awal (PRD-02)
-- Konten tiga bahasa disimpan sebagai jsonb { "ja": "...", "en": "...", "id": "..." }.
-- Semua tabel memakai RLS: publik hanya membaca baris yang diterbitkan,
-- formulir publik hanya boleh INSERT, dan penulisan lain hanya oleh admin terdaftar.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- Admin & peran
-- ---------------------------------------------------------------
create type admin_role as enum ('super_admin', 'content_admin', 'donation_admin', 'viewer');

create table if not exists admins (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role admin_role not null default 'content_admin',
  ui_locale text not null default 'id' check (ui_locale in ('id', 'ja', 'en')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where id = auth.uid() and active);
$$;

create or replace function has_role(required admin_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admins where id = auth.uid() and active and (role = 'super_admin' or role = any (required))
  );
$$;

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------
-- Pengaturan & konfigurasi salat
-- ---------------------------------------------------------------
create table if not exists prayer_config (
  id int primary key default 1 check (id = 1),
  config jsonb not null,
  updated_by uuid references admins (id),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Konten publik
-- ---------------------------------------------------------------
create type content_status as enum ('draft', 'published', 'archived');

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  excerpt jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  category text not null default 'general',
  pinned boolean not null default false,
  status content_status not null default 'draft',
  published_at timestamptz,
  expires_at timestamptz,
  created_by uuid references admins (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  excerpt jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  category text not null default 'community',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location jsonb not null default '{}'::jsonb,
  speaker text,
  languages text[] not null default array['id'],
  cover_image text,
  registration jsonb not null default '{"required": false}'::jsonb,
  recurring jsonb,
  featured boolean not null default false,
  status content_status not null default 'draft',
  created_by uuid references admins (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists jumuah_schedules (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  khatib text not null,
  imam text not null,
  time text not null default '12:30',
  language text not null default 'mixed',
  topic jsonb,
  note jsonb,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lectures (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  speaker text not null,
  youtube_id text not null,
  published_at timestamptz,
  duration_minutes int not null default 0,
  series jsonb,
  description jsonb not null default '{}'::jsonb,
  language text not null default 'id',
  tags text[] not null default '{}',
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  excerpt jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  category text not null default 'news',
  author text,
  cover_image text,
  tags text[] not null default '{}',
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Formulir publik (INSERT oleh siapa pun, dibaca admin)
-- ---------------------------------------------------------------
create table if not exists donation_confirmations (
  id uuid primary key default gen_random_uuid(),
  program_slug text not null,
  account_id text not null,
  currency text not null check (currency in ('JPY', 'IDR')),
  amount numeric(14, 2) not null check (amount > 0),
  /** nominal unik (amount + 3 digit) untuk pencocokan mutasi */
  unique_code int,
  transferred_at date not null,
  donor_name text,
  donor_contact text,
  on_behalf_of text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'matched', 'rejected')),
  matched_by uuid references admins (id),
  matched_at timestamptz,
  locale text not null default 'id',
  created_at timestamptz not null default now()
);

create table if not exists recurring_donors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact text not null,
  monthly_amount int not null check (monthly_amount > 0),
  currency text not null default 'JPY',
  payment_day int not null check (payment_day between 1 and 28),
  method text not null,
  publish_name boolean not null default false,
  consent boolean not null default false,
  active boolean not null default true,
  locale text not null default 'id',
  created_at timestamptz not null default now()
);

create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  full_name text not null,
  contact text not null,
  participants int not null default 1 check (participants between 1 and 10),
  notes text,
  status text not null default 'registered' check (status in ('registered', 'waitlist', 'cancelled', 'attended')),
  locale text not null default 'id',
  created_at timestamptz not null default now()
);

create table if not exists program_registrations (
  id uuid primary key default gen_random_uuid(),
  program_id text not null,
  full_name text not null,
  contact text not null,
  participant_name text,
  participant_age int,
  notes text,
  status text not null default 'new' check (status in ('new', 'accepted', 'waitlist', 'rejected')),
  locale text not null default 'id',
  created_at timestamptz not null default now()
);

create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('suggestion', 'facility', 'question', 'ustadz', 'website', 'other')),
  message text not null,
  sender_name text,
  sender_contact text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done', 'spam')),
  handled_by uuid references admins (id),
  locale text not null default 'id',
  created_at timestamptz not null default now()
);

create table if not exists room_bookings (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  purpose text not null,
  organizer_name text not null,
  organizer_contact text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  attendees int not null default 1,
  notes text,
  status text not null default 'requested' check (status in ('requested', 'approved', 'rejected', 'cancelled')),
  locale text not null default 'id',
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  locale text not null default 'id',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  keys jsonb not null,
  locale text not null default 'id',
  /** preferensi per salat: {"fajr": true, "dhuhr": true, ...} dan pengingat iqamah */
  preferences jsonb not null default '{"fajr": true, "dhuhr": true, "asr": true, "maghrib": true, "isha": true, "iqamahReminder": true, "jumuah": true}'::jsonb,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists activity_log (
  id bigint generated always as identity primary key,
  admin_id uuid references admins (id),
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Trigger updated_at
-- ---------------------------------------------------------------
do $$
declare t text;
begin
  for t in select unnest(array['announcements', 'events', 'jumuah_schedules', 'lectures', 'news']) loop
    execute format('drop trigger if exists set_updated_at on %I', t);
    execute format('create trigger set_updated_at before update on %I for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------
alter table admins enable row level security;
alter table prayer_config enable row level security;
alter table site_settings enable row level security;
alter table announcements enable row level security;
alter table events enable row level security;
alter table jumuah_schedules enable row level security;
alter table lectures enable row level security;
alter table news enable row level security;
alter table donation_confirmations enable row level security;
alter table recurring_donors enable row level security;
alter table event_registrations enable row level security;
alter table program_registrations enable row level security;
alter table suggestions enable row level security;
alter table room_bookings enable row level security;
alter table contact_messages enable row level security;
alter table push_subscriptions enable row level security;
alter table activity_log enable row level security;

-- Admin: baca diri sendiri; super admin kelola semua.
create policy "admins read self" on admins for select using (id = auth.uid() or has_role(array['super_admin']::admin_role[]));
create policy "super admin manage admins" on admins for all using (has_role(array['super_admin']::admin_role[])) with check (has_role(array['super_admin']::admin_role[]));

-- Konfigurasi: publik baca, admin konten tulis.
create policy "public read prayer config" on prayer_config for select using (true);
create policy "admin write prayer config" on prayer_config for all using (has_role(array['content_admin']::admin_role[])) with check (has_role(array['content_admin']::admin_role[]));
create policy "public read settings" on site_settings for select using (true);
create policy "admin write settings" on site_settings for all using (has_role(array['content_admin']::admin_role[])) with check (has_role(array['content_admin']::admin_role[]));

-- Konten: publik baca yang diterbitkan, admin konten kelola semua.
create policy "public read published announcements" on announcements for select using (status = 'published' or is_admin());
create policy "admin manage announcements" on announcements for all using (has_role(array['content_admin']::admin_role[])) with check (has_role(array['content_admin']::admin_role[]));
create policy "public read published events" on events for select using (status = 'published' or is_admin());
create policy "admin manage events" on events for all using (has_role(array['content_admin']::admin_role[])) with check (has_role(array['content_admin']::admin_role[]));
create policy "public read jumuah" on jumuah_schedules for select using (published or is_admin());
create policy "admin manage jumuah" on jumuah_schedules for all using (has_role(array['content_admin']::admin_role[])) with check (has_role(array['content_admin']::admin_role[]));
create policy "public read published lectures" on lectures for select using (status = 'published' or is_admin());
create policy "admin manage lectures" on lectures for all using (has_role(array['content_admin']::admin_role[])) with check (has_role(array['content_admin']::admin_role[]));
create policy "public read published news" on news for select using (status = 'published' or is_admin());
create policy "admin manage news" on news for all using (has_role(array['content_admin']::admin_role[])) with check (has_role(array['content_admin']::admin_role[]));

-- Formulir publik: siapa pun boleh INSERT, hanya admin yang membaca/mengubah.
create policy "public insert donation confirmations" on donation_confirmations for insert with check (true);
create policy "donation admin read confirmations" on donation_confirmations for select using (has_role(array['donation_admin']::admin_role[]));
create policy "donation admin update confirmations" on donation_confirmations for update using (has_role(array['donation_admin']::admin_role[]));
create policy "public insert recurring donors" on recurring_donors for insert with check (true);
create policy "donation admin manage recurring" on recurring_donors for all using (has_role(array['donation_admin']::admin_role[]));
create policy "public insert event registrations" on event_registrations for insert with check (true);
create policy "content admin manage registrations" on event_registrations for all using (has_role(array['content_admin']::admin_role[]));
create policy "public insert program registrations" on program_registrations for insert with check (true);
create policy "content admin manage program registrations" on program_registrations for all using (has_role(array['content_admin']::admin_role[]));
create policy "public insert suggestions" on suggestions for insert with check (true);
create policy "content admin manage suggestions" on suggestions for all using (has_role(array['content_admin']::admin_role[]));
create policy "public insert room bookings" on room_bookings for insert with check (true);
create policy "content admin manage bookings" on room_bookings for all using (has_role(array['content_admin']::admin_role[]));
create policy "public insert contact messages" on contact_messages for insert with check (true);
create policy "content admin manage contact" on contact_messages for all using (has_role(array['content_admin']::admin_role[]));
create policy "public upsert own push subscription" on push_subscriptions for insert with check (true);
create policy "public update own push subscription" on push_subscriptions for update using (true) with check (true);
create policy "public delete own push subscription" on push_subscriptions for delete using (true);
create policy "admin read push subscriptions" on push_subscriptions for select using (is_admin());
create policy "admin read activity log" on activity_log for select using (is_admin());
create policy "admin insert activity log" on activity_log for insert with check (is_admin());

-- ---------------------------------------------------------------
-- Storage bucket untuk gambar (galeri, sampul, QRIS)
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "admin write media" on storage.objects for insert with check (bucket_id = 'media' and is_admin());
create policy "admin update media" on storage.objects for update using (bucket_id = 'media' and is_admin());
create policy "admin delete media" on storage.objects for delete using (bucket_id = 'media' and is_admin());

-- ---------------------------------------------------------------
-- Indeks
-- ---------------------------------------------------------------
create index if not exists announcements_published_idx on announcements (status, published_at desc);
create index if not exists events_starts_idx on events (status, starts_at);
create index if not exists lectures_published_idx on lectures (status, published_at desc);
create index if not exists news_published_idx on news (status, published_at desc);
create index if not exists donation_confirmations_status_idx on donation_confirmations (status, created_at desc);
create index if not exists event_registrations_event_idx on event_registrations (event_id);
