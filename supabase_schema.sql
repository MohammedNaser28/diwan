-- Run this once in your Supabase SQL editor
-- (Dashboard → SQL Editor → New query)

-- ── poems table ──────────────────────────────────────────────────────────────
create table if not exists public.poems (
    id         text        primary key,
    text       text        not null,
    poet       text        not null default '',
    source     text        not null default '',
    tags       text        not null default '[]',    -- JSON array as text
    updated_at bigint      not null,                 -- Unix ms timestamp
    deleted_at bigint                                -- NULL = active
);

-- ── index for efficient sync (pull records newer than a timestamp) ──────────
create index if not exists idx_poems_updated on public.poems(updated_at);

-- ── Row-Level Security ───────────────────────────────────────────────────────
-- Replace with proper auth policies when you add user accounts.
alter table public.poems enable row level security;

create policy "Allow all for anon key"
    on public.poems
    for all
    using (true)
    with check (true);

-- ── realtime (optional: for live push between devices) ───────────────────────
-- alter publication supabase_realtime add table public.poems;
