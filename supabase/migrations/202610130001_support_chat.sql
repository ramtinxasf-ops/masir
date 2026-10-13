-- Private support chat for Masir. Run once in Supabase SQL Editor.
create table if not exists public.support_chat_threads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  access_token_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.support_chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.support_chat_threads(id) on delete cascade,
  sender text not null check (sender in ('user','admin')),
  message text not null check (char_length(trim(message)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists support_chat_threads_updated_idx on public.support_chat_threads(updated_at desc);
create index if not exists support_chat_messages_thread_idx on public.support_chat_messages(thread_id, created_at);
alter table public.support_chat_threads enable row level security;
alter table public.support_chat_messages enable row level security;
revoke all on public.support_chat_threads from anon, authenticated;
revoke all on public.support_chat_messages from anon, authenticated;
grant all on public.support_chat_threads to service_role;
grant all on public.support_chat_messages to service_role;
