create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key,
  email text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists icps (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  industry text not null,
  locations text[] not null default '{}',
  min_employees integer,
  max_employees integer,
  min_revenue numeric,
  max_revenue numeric,
  business_type text,
  target_titles text[] not null default '{}',
  keywords text[] not null default '{}',
  excluded_industries text[] not null default '{}',
  growth_preferences text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  company text not null,
  website text,
  domain text,
  industry text,
  product_service_category text,
  business_type text,
  employees integer,
  revenue numeric,
  year_founded integer,
  bbb_rating text,
  street text,
  city text,
  state text,
  country text,
  company_phone text,
  company_linkedin text,
  owner_first_name text,
  owner_last_name text,
  owner_title text,
  owner_linkedin text,
  owner_phone text,
  owner_email text,
  technologies text[] not null default '{}',
  funding text,
  hiring_signals text,
  recent_news text,
  growth_signals text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_scores (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  icp_id uuid not null references icps(id) on delete cascade,
  total_score integer not null,
  industry_fit integer not null,
  company_size_fit integer not null,
  revenue_potential integer not null,
  growth_signals integer not null,
  contactability integer not null,
  decision_maker_fit integer not null,
  data_quality integer not null,
  recommended_action text not null,
  reasons text[] not null default '{}',
  concerns text[] not null default '{}',
  ai_explanation text,
  ai_generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(lead_id, icp_id)
);

create table if not exists lead_signals (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  signal_type text not null,
  signal_value text not null,
  source text,
  confidence numeric,
  created_at timestamptz not null default now()
);

insert into users (id,email,name)
values ('00000000-0000-0000-0000-000000000001','demo@leadpulse.local','Demo User')
on conflict (id) do nothing;

create index if not exists idx_leads_domain on leads(domain);
create index if not exists idx_leads_company on leads(company);
create index if not exists idx_leads_industry on leads(industry);
create index if not exists idx_leads_state on leads(state);
create index if not exists idx_leads_user_id on leads(user_id);
create index if not exists idx_lead_scores_lead_id on lead_scores(lead_id);
create index if not exists idx_lead_scores_icp_id on lead_scores(icp_id);
create index if not exists idx_lead_scores_total_score on lead_scores(total_score desc);
