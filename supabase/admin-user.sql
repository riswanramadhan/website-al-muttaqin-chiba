-- Akun admin pertama (super_admin) untuk panel /admin.
-- Jalankan SETELAH migrasi 0001-0003. Aman dijalankan ulang: bila akun sudah ada,
-- kata sandinya TIDAK ditimpa; hanya dipastikan terdaftar sebagai super_admin aktif.
--
-- SEBELUM MENJALANKAN DI PROYEK BARU: ganti nilai v_password di bawah dengan kata sandi awal
-- pilihan Anda (minimal 8 karakter). Repositori ini publik, jadi kata sandi tidak disimpan di sini.
-- Setelah login pertama, ganti lagi lewat menu "Akun saya" (/admin/account); panel menampilkan
-- peringatan sampai kata sandi awal diganti.

do $$
declare
  v_email text := 'admin@almuttaqinculturalcenter.org';
  v_password text := 'GANTI_KATA_SANDI_AWAL';
  v_name text := 'Admin Al Muttaqin';
  v_id uuid;
  v_created boolean := false;
begin
  -- pgcrypto (crypt, gen_salt) berada di skema `extensions` pada proyek Supabase.
  perform set_config('search_path', 'public, extensions', true);

  select id into v_id from auth.users where email = v_email;

  if v_id is null then
    if v_password = 'GANTI_KATA_SANDI_AWAL' or length(v_password) < 8 then
      raise exception 'Akun admin belum ada. Ganti nilai v_password (minimal 8 karakter) di bagian "Akun admin pertama" berkas SQL ini, lalu jalankan ulang.';
    end if;

    v_id := gen_random_uuid();
    v_created := true;

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
      crypt(v_password, gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      jsonb_build_object('full_name', v_name), now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_id, v_id::text,
      jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
      'email', now(), now(), now()
    );
  end if;

  -- must_change_password hanya dinyalakan bila akun dibuat di sini dengan kata sandi awal di atas.
  insert into public.admins (id, email, full_name, role, ui_locale, active, must_change_password)
  values (v_id, v_email, v_name, 'super_admin', 'id', true, v_created)
  on conflict (id) do update set role = 'super_admin', active = true;
end $$;
