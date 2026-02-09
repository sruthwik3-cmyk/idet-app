-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
-- Holds user information linked to auth.users
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  phone text,
  dob date,
  user_group text check (user_group in ('Self', 'Family', 'Organization')),
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Row Level Security (RLS) for Profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- DOCUMENTS TABLE
-- Stores content with expiry dates
create table documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  category text,
  expiry_date date,
  priority text check (priority in ('Critical', 'Important', 'Optional')),
  notes text,
  alerts_json jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) for Documents
alter table documents enable row level security;

create policy "Users can view their own documents."
  on documents for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own documents."
  on documents for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own documents."
  on documents for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own documents."
  on documents for delete
  using ( auth.uid() = user_id );

-- Realtime
-- Enable realtime for documents table
alter publication supabase_realtime add table documents;
