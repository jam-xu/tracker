-- ─────────────────────────────────────────────────────────────────
-- Finance Tracker — Supabase schema
-- Run this once in your Supabase project: SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────

-- Transactions table
create table if not exists transactions (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        text not null,
  type        text not null check (type in ('expense','income','investment')),
  category    text not null default '',
  subcategory text not null default '',
  amount      numeric(12,2) not null default 0,
  account     text not null default '',
  note        text not null default '',
  created_at  timestamptz default now()
);

-- User config table (one row per user)
create table if not exists user_config (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  currency   text not null default 'CAD',
  room_left  jsonb not null default '{}',
  categories jsonb not null default '{}',
  accounts   jsonb not null default '[]',
  onboarded  boolean not null default false,
  updated_at timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────
-- Users can only see and modify their own rows.

alter table transactions enable row level security;
alter table user_config   enable row level security;

-- Transactions policies
create policy "Users can read own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- User config policies
create policy "Users can read own config"
  on user_config for select
  using (auth.uid() = user_id);

create policy "Users can upsert own config"
  on user_config for insert
  with check (auth.uid() = user_id);

create policy "Users can update own config"
  on user_config for update
  using (auth.uid() = user_id);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists transactions_user_date
  on transactions (user_id, date desc);

create index if not exists transactions_user_type
  on transactions (user_id, type);
