-- PromptVault PostgreSQL Schema (Supabase)
-- Matches live production structure, constraints, RLS, and least-privilege grants.

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_users_name_len CHECK (char_length(btrim(name)) BETWEEN 2 AND 60),
  CONSTRAINT chk_users_email_lower CHECK (
    email = lower(btrim(email))
    AND char_length(email) BETWEEN 5 AND 254
    AND position('@' in email) > 1
  )
);

CREATE TABLE IF NOT EXISTS public.prompts (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  prompt text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  difficulty text NOT NULL DEFAULT 'beginner',
  author text NOT NULL DEFAULT 'PromptVault',
  owner_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  likes integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_prompts_title_len CHECK (char_length(btrim(title)) BETWEEN 3 AND 120),
  CONSTRAINT chk_prompts_desc_len CHECK (char_length(description) BETWEEN 1 AND 500),
  CONSTRAINT chk_prompts_body_len CHECK (char_length(btrim(prompt)) BETWEEN 10 AND 8000),
  CONSTRAINT chk_prompts_category CHECK (
    category IN (
      'writing', 'coding', 'business', 'marketing',
      'education', 'creative', 'productivity', 'general'
    )
  ),
  CONSTRAINT chk_prompts_difficulty CHECK (
    difficulty IN ('beginner', 'intermediate', 'advanced')
  ),
  CONSTRAINT chk_prompts_likes_nonneg CHECK (likes >= 0)
);

CREATE TABLE IF NOT EXISTS public.favorites (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_id text NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, prompt_id)
);

-- Query performance indexes
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_owner_id ON public.prompts(owner_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_likes ON public.prompts(likes DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);

-- Atomic like counter helper (locked search_path, restricted to service_role)
CREATE OR REPLACE FUNCTION public.increment_prompt_likes(p_id text)
RETURNS TABLE(id text, likes integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.prompts
     SET likes = public.prompts.likes + 1
   WHERE public.prompts.id = p_id
  RETURNING public.prompts.id, public.prompts.likes;
$$;

-- Defense-in-depth: enable RLS and revoke direct anon/authenticated access.
-- All database mutations pass exclusively through the authenticated FastAPI backend.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.users, public.prompts, public.favorites FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_prompt_likes(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_prompt_likes(text) TO service_role;
