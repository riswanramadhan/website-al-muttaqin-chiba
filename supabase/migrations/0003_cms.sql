-- CMS panel admin: koleksi konten generik, pengaturan situs, hitungan pendaftar, dan batas unggahan.
-- Aman dijalankan ulang (idempoten). Jalankan setelah 0001_init.sql dan 0002_admin.sql.

-- ---------------------------------------------------------------
-- Koleksi konten (FAQ, galeri, rekening donasi, program, ruangan, tempat halal, pengurus, dst.)
-- Satu baris = satu item; `data` menyimpan bentuk yang sama dengan tipe di src/lib/types.ts.
-- ---------------------------------------------------------------
create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  item_key text not null,
  data jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  published boolean not null default true,
  updated_by uuid references admins (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_items_key_format check (item_key ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  constraint content_items_unique_key unique (collection, item_key)
);

create index if not exists content_items_collection_idx on content_items (collection, sort_order, created_at);

drop trigger if exists set_updated_at on content_items;
create trigger set_updated_at before update on content_items
  for each row execute function set_updated_at();

-- Rekening dan laporan donasi hanya boleh diubah admin donasi (dan super admin);
-- koleksi lain oleh admin konten.
create or replace function can_manage_collection(target text)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when target in ('donation_accounts', 'donation_programs', 'transparency_reports')
      then has_role(array['donation_admin']::admin_role[])
    else has_role(array['content_admin']::admin_role[])
  end;
$$;

alter table content_items enable row level security;

drop policy if exists "public read published content items" on content_items;
create policy "public read published content items" on content_items
  for select using (published or is_admin());

drop policy if exists "admin manage content items" on content_items;
create policy "admin manage content items" on content_items
  for all using (can_manage_collection(collection)) with check (can_manage_collection(collection));

-- ---------------------------------------------------------------
-- Pengaturan situs (profil & kontak, video unggulan, pop-up promo): kolom audit.
-- ---------------------------------------------------------------
alter table site_settings add column if not exists updated_by uuid references admins (id) on delete set null;

drop trigger if exists set_updated_at on site_settings;
create trigger set_updated_at before update on site_settings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------
-- Hitungan pendaftar agenda: `events.registration.registered` selalu dihitung ulang dari
-- tabel event_registrations, sehingga kuota di situs publik akurat tanpa campur tangan admin.
-- ---------------------------------------------------------------
create or replace function events_keep_registered()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.registration := jsonb_set(
    coalesce(new.registration, '{"required": false}'::jsonb),
    '{registered}',
    to_jsonb((
      select coalesce(sum(participants), 0)
      from event_registrations
      where event_id = new.id and status in ('registered', 'attended')
    ))
  );
  return new;
end;
$$;

drop trigger if exists events_keep_registered on events;
create trigger events_keep_registered before insert or update on events
  for each row execute function events_keep_registered();

create or replace function sync_event_registered()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    update events set registration = registration where id = old.event_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') then
    update events set registration = registration where id = new.event_id;
  end if;
  return null;
end;
$$;

drop trigger if exists sync_event_registered on event_registrations;
create trigger sync_event_registered after insert or update or delete on event_registrations
  for each row execute function sync_event_registered();

-- ---------------------------------------------------------------
-- Storage: bucket `media` publik untuk dibaca, dibatasi 5 MB per berkas dan hanya gambar/PDF.
-- Gambar dikompres di browser admin sebelum diunggah (lihat src/components/admin/cms/image-upload.tsx).
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'application/pdf'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Hak tulis bucket media mengikuti folder: `donations/` (QRIS) dan `reports/` (laporan keuangan)
-- hanya admin donasi; folder lain hanya admin konten. Super admin selalu boleh, peran viewer tidak.
-- Tanpa ini admin konten bisa menimpa gambar QRIS lewat Storage API dengan token sesinya sendiri.
create or replace function can_manage_media(object_name text)
returns boolean language sql stable security definer set search_path = public as $$
  select case
    when split_part(object_name, '/', 1) in ('donations', 'reports')
      then has_role(array['donation_admin']::admin_role[])
    else has_role(array['content_admin']::admin_role[])
  end;
$$;

drop policy if exists "admin write media" on storage.objects;
create policy "admin write media" on storage.objects for insert
  with check (bucket_id = 'media' and can_manage_media(name));
drop policy if exists "admin update media" on storage.objects;
create policy "admin update media" on storage.objects for update
  using (bucket_id = 'media' and can_manage_media(name))
  with check (bucket_id = 'media' and can_manage_media(name));
drop policy if exists "admin delete media" on storage.objects;
create policy "admin delete media" on storage.objects for delete
  using (bucket_id = 'media' and can_manage_media(name));

-- Jalur berkas (relatif terhadap bucket media) yang masih dirujuk di mana pun. Dipakai panel admin
-- sebelum menghapus berkas lama, supaya gambar yang dipakai dua item tidak ikut terhapus.
create or replace function media_paths_in_use(paths text[])
returns text[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(p), '{}'::text[])
  from unnest(paths) as p
  where exists (select 1 from content_items where position(p in data::text) > 0)
     or exists (select 1 from site_settings where position(p in value::text) > 0)
     or exists (select 1 from events where position(p in coalesce(cover_image, '')) > 0)
     or exists (select 1 from news where position(p in coalesce(cover_image, '')) > 0);
$$;

-- ---------------------------------------------------------------
-- Admin: penanda wajib ganti kata sandi awal, dan perbaikan trigger pelindung.
-- ---------------------------------------------------------------
alter table admins add column if not exists must_change_password boolean not null default false;

-- Tanpa sesi pengguna (SQL Editor atau service role, auth.uid() null) pemanggil sudah tepercaya,
-- jadi peran/aktif boleh diubah. Sebelumnya undangan ulang admin dan admin-user.sql diam-diam
-- gagal mengubah peran. Pengunjung anonim tetap tidak bisa mengubah apa pun karena RLS.
create or replace function admins_guard_self_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not has_role(array['super_admin']::admin_role[]) then
    new.role := old.role;
    new.active := old.active;
    new.email := old.email;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------
-- Hak akses eksplisit. Proyek Supabase lama memberi hak ini secara otomatis; proyek baru bisa tidak.
-- Aman dijalankan ulang. RLS di atas tetap menjadi penjaga utama: GRANT hanya membuka pintu tabel.
-- ---------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

-- Pengunjung: baca konten terbit, kirim formulir.
grant select on prayer_config, site_settings, announcements, events, jumuah_schedules, lectures, news, content_items to anon;
grant insert on donation_confirmations, recurring_donors, event_registrations, program_registrations,
  suggestions, room_bookings, contact_messages to anon;

-- Admin yang masuk (dibatasi RLS per peran).
grant select, insert, update, delete on admins, prayer_config, site_settings, announcements, events,
  jumuah_schedules, lectures, news, donation_confirmations, recurring_donors, event_registrations,
  program_registrations, suggestions, room_bookings, contact_messages, push_subscriptions, activity_log,
  content_items to authenticated;

-- Server tepercaya (push, undangan admin).
grant all on admins, prayer_config, site_settings, announcements, events, jumuah_schedules, lectures, news,
  donation_confirmations, recurring_donors, event_registrations, program_registrations, suggestions,
  room_bookings, contact_messages, push_subscriptions, activity_log, content_items to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;

grant execute on function is_admin(), has_role(admin_role[]), can_manage_collection(text), can_manage_media(text)
  to anon, authenticated, service_role;
revoke execute on function media_paths_in_use(text[]) from public, anon;
grant execute on function media_paths_in_use(text[]) to authenticated, service_role;
