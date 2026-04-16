-- Development-only admin account.

do $$
declare
  admin_id uuid;
begin
  if not exists (
    select 1
    from auth.users
    where email = 'admin@admin.pl'
  ) then
    admin_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@admin.pl',
      crypt('admin1234', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"name":"Admin","role":"admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      admin_id,
      admin_id,
      jsonb_build_object(
        'sub', admin_id::text,
        'email', 'admin@admin.pl'
      ),
      'email',
      now(),
      now(),
      now()
    );

    insert into public.users (
      uid,
      name,
      name_lowercase,
      email,
      role,
      created_at,
      last_online
    )
    values (
      admin_id::text,
      'Admin',
      'admin',
      'admin@admin.pl',
      'admin',
      now(),
      now()
    );
  end if;
end;
$$;
