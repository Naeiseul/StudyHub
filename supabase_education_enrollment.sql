-- ==============================================================================
-- StudyHub / LogTraq Education: EFT Controlled Enrollment & Student Invites
-- Project ID: vqakyvqxqhgcwtpaexjk
-- ==============================================================================

-- 1. Ensure extensions and schema search path
create extension if not exists pgcrypto with schema extensions;
set search_path = public, extensions, auth;

-- 2. Create or extend public.profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text default 'student' check (role in ('teacher', 'student', 'admin')),
  full_name text,
  must_change_password boolean default false,
  student_capacity integer default 20,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles RLS policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Create student_invites table
create table if not exists public.student_invites (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_name text not null,
  student_email text not null,
  invite_code text unique not null,
  temp_password text not null,
  status text default 'pending' check (status in ('pending', 'claimed', 'expired')),
  created_at timestamptz default timezone('utc', now()),
  claimed_at timestamptz
);

-- Enable RLS on student_invites
alter table public.student_invites enable row level security;

-- Student Invites RLS policies
drop policy if exists "Teachers can view own student invites" on public.student_invites;
create policy "Teachers can view own student invites"
  on public.student_invites for select
  using (auth.uid() = teacher_id);

drop policy if exists "Teachers can insert own student invites" on public.student_invites;
create policy "Teachers can insert own student invites"
  on public.student_invites for insert
  with check (auth.uid() = teacher_id);

drop policy if exists "Teachers can update own student invites" on public.student_invites;
create policy "Teachers can update own student invites"
  on public.student_invites for update
  using (auth.uid() = teacher_id);

-- 4. Auto-create or update profile when a user is created in Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions, auth
as 
begin
  insert into public.profiles (id, email, full_name, role, must_change_password)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'teacher'),
    coalesce((new.raw_user_meta_data->>'must_change_password')::boolean, false)
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = coalesce(excluded.role, public.profiles.role);
  return new;
end;
;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Function: enroll_paid_teacher
-- Run this in the Supabase SQL editor whenever someone pays via EFT (and to enroll yourself)
create or replace function public.enroll_paid_teacher(
  p_email text,
  p_full_name text,
  p_temp_password text,
  p_capacity integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, auth
as 
declare
  v_user_id uuid;
  v_encrypted_pw text;
begin
  -- Hash password with bf salt
  v_encrypted_pw := extensions.crypt(p_temp_password, extensions.gen_salt('bf'));

  select id into v_user_id from auth.users where email = lower(trim(p_email));

  if v_user_id is not null then
    -- Update existing user credentials and flag for password change
    update auth.users
    set encrypted_password = v_encrypted_pw,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
          'role', 'teacher',
          'name', p_full_name,
          'must_change_password', true
        ),
        updated_at = now()
    where id = v_user_id;

    insert into public.profiles (id, email, role, full_name, must_change_password, student_capacity, updated_at)
    values (v_user_id, lower(trim(p_email)), 'teacher', p_full_name, true, p_capacity, now())
    on conflict (id) do update set
      role = 'teacher',
      full_name = p_full_name,
      must_change_password = true,
      student_capacity = p_capacity,
      updated_at = now();

    return jsonb_build_object(
      'success', true,
      'action', 'updated',
      'user_id', v_user_id,
      'email', lower(trim(p_email)),
      'role', 'teacher',
      'must_change_password', true,
      'student_capacity', p_capacity
    );
  else
    -- Create new user with confirmed email
    v_user_id := gen_random_uuid();
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
      updated_at
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      lower(trim(p_email)),
      v_encrypted_pw,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('role', 'teacher', 'name', p_full_name, 'must_change_password', true),
      now(),
      now()
    );

    insert into public.profiles (id, email, role, full_name, must_change_password, student_capacity)
    values (v_user_id, lower(trim(p_email)), 'teacher', p_full_name, true, p_capacity)
    on conflict (id) do update set
      role = 'teacher',
      full_name = p_full_name,
      must_change_password = true,
      student_capacity = p_capacity;

    return jsonb_build_object(
      'success', true,
      'action', 'created',
      'user_id', v_user_id,
      'email', lower(trim(p_email)),
      'role', 'teacher',
      'must_change_password', true,
      'student_capacity', p_capacity
    );
  end if;
end;
;

-- 6. Function: create_student_invitation
create or replace function public.create_student_invitation(
  p_student_name text,
  p_student_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, auth
as 
declare
  v_teacher_id uuid;
  v_teacher_role text;
  v_capacity integer;
  v_current_students integer;
  v_code text;
  v_temp_pw text;
  v_invite_id uuid;
begin
  v_teacher_id := auth.uid();
  if v_teacher_id is null then
    raise exception 'Not authenticated';
  end if;

  select role, student_capacity into v_teacher_role, v_capacity
  from public.profiles
  where id = v_teacher_id;

  if v_teacher_role != 'teacher' then
    raise exception 'Only teachers can invite students';
  end if;

  -- Check capacity
  select count(*) into v_current_students
  from public.student_invites
  where teacher_id = v_teacher_id and status in ('pending', 'claimed');

  if v_capacity is not null and v_current_students >= v_capacity then
    raise exception 'Student capacity limit of % reached. Please contact support to upgrade.', v_capacity;
  end if;

  -- Generate unique 6-character code (e.g. STU-A7X9K2)
  v_code := 'STU-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
  -- Generate 8-character temporary password
  v_temp_pw := 'Study#' || floor(1000 + random() * 9000)::text;

  insert into public.student_invites (teacher_id, student_name, student_email, invite_code, temp_password)
  values (v_teacher_id, trim(p_student_name), lower(trim(p_student_email)), v_code, v_temp_pw)
  returning id into v_invite_id;

  return jsonb_build_object(
    'success', true,
    'invite_id', v_invite_id,
    'student_name', trim(p_student_name),
    'student_email', lower(trim(p_student_email)),
    'invite_code', v_code,
    'temp_password', v_temp_pw
  );
end;
;

-- 7. Function: claim_student_invite
create or replace function public.claim_student_invite(
  p_invite_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, auth
as 
declare
  v_student_id uuid;
  v_invite record;
begin
  v_student_id := auth.uid();
  if v_student_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_invite
  from public.student_invites
  where invite_code = upper(trim(p_invite_code)) and status = 'pending';

  if v_invite.id is null then
    raise exception 'Invalid or already claimed invite code';
  end if;

  -- Claim the invite
  update public.student_invites
  set status = 'claimed', claimed_at = now()
  where id = v_invite.id;

  -- Link student to teacher in profiles
  insert into public.profiles (id, email, role, full_name, created_by, must_change_password)
  select v_student_id, email, 'student', v_invite.student_name, v_invite.teacher_id, true
  from auth.users where id = v_student_id
  on conflict (id) do update set
    role = 'student',
    created_by = v_invite.teacher_id,
    full_name = v_invite.student_name,
    must_change_password = true,
    updated_at = now();

  return jsonb_build_object(
    'success', true,
    'teacher_id', v_invite.teacher_id,
    'student_name', v_invite.student_name
  );
end;
;

-- 8. Function: mark_password_changed
create or replace function public.mark_password_changed()
returns boolean
language plpgsql
security definer
set search_path = public, extensions, auth
as 
begin
  update public.profiles
  set must_change_password = false, updated_at = now()
  where id = auth.uid();

  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"must_change_password": false}'::jsonb,
      updated_at = now()
  where id = auth.uid();

  return true;
end;
;
