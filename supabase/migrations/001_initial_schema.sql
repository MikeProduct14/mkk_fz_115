-- Организации (МФО)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  inn varchar(12) not null,
  name text not null,
  org_type text check (org_type in ('МКК', 'МФК')) not null,
  address text,
  sdl_name text,
  sdl_position text,
  pvk_updated_at date,
  created_at timestamptz default now()
);

-- Клиенты (заёмщики)
create table clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  last_name text not null,
  first_name text not null,
  middle_name text,
  birthday date not null,
  citizenship text not null default 'РФ',
  passport_series varchar(4) not null,
  passport_number varchar(6) not null,
  passport_issued_by text not null,
  passport_issued_date date not null,
  passport_division_code varchar(7),
  reg_address text not null,
  live_address text,
  snils varchar(14),
  inn varchar(12),
  loan_purpose text,
  income_source text,
  is_pep boolean default false,
  pep_description text,
  risk_level text check (risk_level in ('low', 'medium', 'high')) not null default 'low',
  risk_reason text,
  status text check (status in ('draft', 'checking', 'approved', 'rejected')) not null default 'draft',
  reject_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- История проверок клиента
create table client_checks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  check_type text check (check_type in ('rfm', 'passport')) not null,
  result text check (result in ('clear', 'found', 'error', 'manual_required')) not null,
  details jsonb,
  checked_at timestamptz default now()
);

-- История версий анкеты
create table client_history (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  snapshot jsonb not null,
  changed_at timestamptz default now()
);

-- Индексы для производительности
create index idx_clients_org_id on clients(org_id);
create index idx_clients_status on clients(status);
create index idx_client_checks_client_id on client_checks(client_id);
create index idx_client_history_client_id on client_history(client_id);

-- RLS политики

-- Organizations: пользователь видит только свою организацию
alter table organizations enable row level security;

create policy "users_own_org" on organizations
  for all using (auth.uid() = user_id);

-- Clients: СДЛ видит только клиентов своей МФО
alter table clients enable row level security;

create policy "org_own_clients" on clients
  for all using (
    org_id in (select id from organizations where user_id = auth.uid())
  );

-- Client checks: доступ через клиента
alter table client_checks enable row level security;

create policy "org_own_checks" on client_checks
  for all using (
    client_id in (
      select c.id from clients c
      join organizations o on c.org_id = o.id
      where o.user_id = auth.uid()
    )
  );

-- Client history: аналогично
alter table client_history enable row level security;

create policy "org_own_history" on client_history
  for all using (
    client_id in (
      select c.id from clients c
      join organizations o on c.org_id = o.id
      where o.user_id = auth.uid()
    )
  );

-- Функция для автоматического обновления updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Триггер для clients
create trigger update_clients_updated_at
  before update on clients
  for each row
  execute function update_updated_at_column();
