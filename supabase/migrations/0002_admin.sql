-- Panel admin (PRD-09): kolom & indeks tambahan. Tidak mengubah 0001.

-- Catatan pencocokan manual donasi oleh admin donasi.
alter table donation_confirmations add column if not exists admin_note text;

-- Log aktivitas dibaca terbaru dulu.
create index if not exists activity_log_created_idx on activity_log (created_at desc);

-- Admin boleh memperbarui baris dirinya sendiri (mis. bahasa UI), tanpa mengubah peran/aktif.
create or replace function admins_guard_self_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not has_role(array['super_admin']::admin_role[]) then
    new.role := old.role;
    new.active := old.active;
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists admins_guard_self_update on admins;
create trigger admins_guard_self_update before update on admins
  for each row execute function admins_guard_self_update();

drop policy if exists "admins update self" on admins;
create policy "admins update self" on admins for update using (id = auth.uid()) with check (id = auth.uid());
