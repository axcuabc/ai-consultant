-- Схема базы для ИИ-Консультанта.
-- Запуск: Supabase → SQL Editor → вставить весь файл → Run.
-- Скрипт можно запускать повторно: он ничего не ломает в уже созданных таблицах.

create extension if not exists pgcrypto with schema extensions;

-- Автообновление updated_at
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Пользователи (профиль поверх auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  subscription_ends_at timestamptz,
  has_paid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.users enable row level security;

drop policy if exists "Users can view own data" on public.users;
create policy "Users can view own data" on public.users
  for select using (auth.uid() = id);

-- Раньше пользователи могли сами менять свою запись (в том числе дату подписки)
-- и кто угодно мог вставлять строки. Теперь пишет только сервер (service role).
drop policy if exists "Users can update own data" on public.users;
drop policy if exists "Service can insert user data" on public.users;

create index if not exists users_email_idx on public.users(email);

drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Консультанты
-- ---------------------------------------------------------------------------
create table if not exists public.consultants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'ИИ-консультант',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.consultants add column if not exists category text not null default 'other';
alter table public.consultants add column if not exists business_info text not null default '';
alter table public.consultants add column if not exists contact_cta text not null default '';
alter table public.consultants add column if not exists custom_prompt text not null default '';
alter table public.consultants add column if not exists welcome_message text not null default 'Здравствуйте! Чем могу помочь?';
alter table public.consultants add column if not exists theme_color text not null default '#4F46E5';
alter table public.consultants add column if not exists icon text not null default 'chat';
alter table public.consultants add column if not exists position text not null default 'right';
alter table public.consultants add column if not exists font text not null default 'system';
alter table public.consultants add column if not exists allowed_domain text not null default '';

-- Старая версия разрешала только одного консультанта на пользователя
alter table public.consultants drop constraint if exists unique_user_consultant;

-- Ограничения на значения
alter table public.consultants drop constraint if exists consultants_color_chk;
alter table public.consultants add constraint consultants_color_chk check (theme_color ~ '^#[0-9a-fA-F]{6}$');
alter table public.consultants drop constraint if exists consultants_position_chk;
alter table public.consultants add constraint consultants_position_chk check (position in ('right', 'left'));
alter table public.consultants drop constraint if exists consultants_lengths_chk;
alter table public.consultants add constraint consultants_lengths_chk check (
  char_length(name) <= 60 and char_length(welcome_message) <= 300
  and char_length(business_info) <= 8000 and char_length(contact_cta) <= 500
  and char_length(custom_prompt) <= 3000 and char_length(allowed_domain) <= 200
);

alter table public.consultants enable row level security;

drop policy if exists "Users can view own consultants" on public.consultants;
create policy "Users can view own consultants" on public.consultants
  for select using (auth.uid() = user_id);
drop policy if exists "Users can create own consultants" on public.consultants;
-- Не больше 3 консультантов на аккаунт (то же число, что PLAN.maxConsultants в lib/plans.ts)
create policy "Users can create own consultants" on public.consultants
  for insert with check (
    auth.uid() = user_id
    and (select count(*) from public.consultants c where c.user_id = auth.uid()) < 3
  );
drop policy if exists "Users can update own consultants" on public.consultants;
create policy "Users can update own consultants" on public.consultants
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own consultants" on public.consultants;
create policy "Users can delete own consultants" on public.consultants
  for delete using (auth.uid() = user_id);

create index if not exists consultants_user_id_idx on public.consultants(user_id);

drop trigger if exists update_consultants_updated_at on public.consultants;
create trigger update_consultants_updated_at
  before update on public.consultants
  for each row execute function public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Платежи (каждый платёж ЮKassa обрабатывается ровно один раз)
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  payment_id text primary key,
  user_id uuid references public.users(id) on delete set null,
  email text not null,
  kind text not null,
  amount numeric not null,
  status text not null,
  created_at timestamptz default now()
);

alter table public.payments enable row level security;

drop policy if exists "Users can view own payments" on public.payments;
create policy "Users can view own payments" on public.payments
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Права: без входа к таблицам доступа нет; пользователи и платежи пишет только сервер
-- ---------------------------------------------------------------------------
revoke all on public.users, public.consultants, public.payments from anon;
revoke insert, update, delete on public.users, public.payments from authenticated;

-- ---------------------------------------------------------------------------
-- Профиль создаётся сразу при регистрации: до оплаты можно создать и проверить консультанта
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, lower(new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.users (id, email)
select id, lower(email) from auth.users where email is not null
on conflict (id) do nothing;
