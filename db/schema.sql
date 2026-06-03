-- Foundational relational schema for the 285-feature PC Comparer platform.
-- This can be translated directly to Prisma, Drizzle, or managed Postgres on Vercel.

create table app_user (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  avatar_url text,
  theme text not null default 'light',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table oauth_account (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  provider text not null,
  provider_account_id text not null,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  unique (provider, provider_account_id)
);

create table machine (
  id uuid primary key default gen_random_uuid(),
  make text not null,
  model text not null,
  class text not null,
  current_spec_json jsonb not null default '{}'::jsonb,
  raw_source_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table hardware_capability (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid not null references machine(id) on delete cascade,
  category text not null,
  key text not null,
  value_json jsonb not null,
  confidence numeric(5, 2) not null default 0,
  source_url text,
  unique (machine_id, key)
);

create table feature_definition (
  id text primary key,
  category text not null,
  title text not null,
  layer text not null,
  status text not null,
  config_schema jsonb not null default '{}'::jsonb
);

create table comparison_board (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_user(id) on delete set null,
  title text not null,
  workload text not null,
  machine_ids uuid[] not null default '{}',
  result_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table budget_hunt (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_user(id) on delete set null,
  budget_cents integer not null,
  use_case text not null,
  constraints text,
  grounded_response_json jsonb not null,
  created_at timestamptz not null default now()
);

create table retailer_offer (
  id uuid primary key default gen_random_uuid(),
  machine_id uuid references machine(id) on delete cascade,
  retailer text not null,
  url text not null,
  condition text not null default 'new',
  price_cents integer not null,
  coupon_code text,
  in_stock boolean not null default true,
  verified_at timestamptz not null default now()
);

create table price_snapshot (
  id uuid primary key default gen_random_uuid(),
  retailer_offer_id uuid not null references retailer_offer(id) on delete cascade,
  price_cents integer not null,
  availability text not null,
  captured_at timestamptz not null default now()
);

create table saved_build (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  name text not null,
  target_use_case text not null,
  parts_json jsonb not null default '{}'::jsonb,
  dream_build boolean not null default false,
  created_at timestamptz not null default now()
);

create table price_alert (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  machine_id uuid references machine(id) on delete cascade,
  target_price_cents integer not null,
  email_enabled boolean not null default true,
  triggered_at timestamptz
);

create table user_report (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_user(id) on delete set null,
  machine_id uuid not null references machine(id) on delete cascade,
  report_type text not null,
  body text not null,
  evidence_url text,
  created_at timestamptz not null default now()
);

create table glossary_entry (
  id uuid primary key default gen_random_uuid(),
  term text unique not null,
  short_definition text not null,
  deep_dive_markdown text not null,
  related_feature_ids text[] not null default '{}'
);
