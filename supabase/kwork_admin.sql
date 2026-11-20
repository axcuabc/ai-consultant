-- ---------------------------------------------------------------------------
-- Помощники для клиентов с Кворка и защита от злоупотреблений
-- ---------------------------------------------------------------------------
-- active_until: если задано, помощник работает до этой даты независимо от подписки владельца
--   (так включаются помощники, проданные через Кворк). Меняет только админ (сервер).
-- monthly_limit: сколько ответов в месяц; пусто = лимит по умолчанию (PLAN.monthlyAnswers)
-- client_note: пометка для себя (клиент, номер заказа)
alter table public.consultants add column if not exists active_until timestamptz;
alter table public.consultants add column if not exists monthly_limit integer;
alter table public.consultants add column if not exists client_note text not null default '';
alter table public.consultants drop constraint if exists consultants_admin_chk;
alter table public.consultants add constraint consultants_admin_chk check (
  char_length(client_note) <= 300 and (monthly_limit is null or monthly_limit between 0 and 100000)
);

-- Пользователи не могут сами себе выставить срок или лимит: пишут только «свои» колонки
revoke insert, update on public.consultants from authenticated;
grant insert (user_id, name, category, business_info, contact_cta, custom_prompt, welcome_message,
  theme_color, icon, position, font, allowed_domain) on public.consultants to authenticated;
grant update (name, category, business_info, contact_cta, custom_prompt, welcome_message,
  theme_color, icon, position, font, allowed_domain) on public.consultants to authenticated;

-- Счётчик ответов по дням
create table if not exists public.consultant_usage (
  consultant_id uuid not null references public.consultants(id) on delete cascade,
  day date not null,
  answers integer not null default 0,
  primary key (consultant_id, day)
);
alter table public.consultant_usage enable row level security;
revoke all on public.consultant_usage from anon, authenticated;

create or replace function public.bump_consultant_usage(p_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.consultant_usage (consultant_id, day, answers)
  values (p_id, (now() at time zone 'Europe/Moscow')::date, 1)
  on conflict (consultant_id, day) do update set answers = public.consultant_usage.answers + 1;
$$;
revoke execute on function public.bump_consultant_usage(uuid) from public, anon, authenticated;
