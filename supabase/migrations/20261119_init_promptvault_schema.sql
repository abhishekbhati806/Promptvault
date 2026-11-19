-- PromptVault Supabase PostgreSQL schema

create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  hashed_password text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id text primary key,
  title text not null,
  description text not null default '',
  prompt text not null,
  category text not null default 'General',
  tags text[] not null default '{}',
  author text not null default 'Community',
  owner_id text references public.users(id) on delete set null,
  likes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.favorites (
  user_id text not null references public.users(id) on delete cascade,
  prompt_id text not null references public.prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

create index if not exists idx_prompts_category on public.prompts (category);
create index if not exists idx_prompts_owner_id on public.prompts (owner_id);
create index if not exists idx_prompts_created_at on public.prompts (created_at desc);
create index if not exists idx_prompts_likes on public.prompts (likes desc);
create index if not exists idx_favorites_user_id on public.favorites (user_id);

alter table public.users enable row level security;
alter table public.prompts enable row level security;
alter table public.favorites enable row level security;

create or replace function public.increment_prompt_likes(p_id text)
returns setof public.prompts
language sql
security definer
set search_path = public
as $$
  update public.prompts
  set likes = coalesce(likes, 0) + 1
  where id = p_id
  returning *;
$$;
