-- LogTraq Tax Portal MVP schema
-- Run this in Supabase SQL editor after reviewing bucket/RLS requirements.
-- This script assumes authenticated users and organization/practice membership will be added before production use.

create table if not exists public.tax_practices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  logo_url text,
  accent_color text default '#4a9f45',
  created_at timestamptz not null default now()
);

create table if not exists public.tax_clients (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.tax_practices(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  status text not null default 'Intake',
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tax_documents (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.tax_practices(id) on delete cascade,
  client_id uuid not null references public.tax_clients(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  file_size bigint,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.tax_practices enable row level security;
alter table public.tax_clients enable row level security;
alter table public.tax_documents enable row level security;

create policy "practice owners can manage practices"
on public.tax_practices
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "practice owners can manage clients"
on public.tax_clients
for all
using (
  exists (
    select 1 from public.tax_practices p
    where p.id = tax_clients.practice_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.tax_practices p
    where p.id = tax_clients.practice_id
      and p.owner_id = auth.uid()
  )
);

create policy "practice owners can manage documents"
on public.tax_documents
for all
using (
  exists (
    select 1 from public.tax_practices p
    where p.id = tax_documents.practice_id
      and p.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.tax_practices p
    where p.id = tax_documents.practice_id
      and p.owner_id = auth.uid()
  )
);

-- Create a private Supabase Storage bucket named tax-documents in the dashboard.
-- Keep it private. Use signed URLs for viewing/downloading documents.
