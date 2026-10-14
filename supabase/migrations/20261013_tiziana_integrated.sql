-- Apply in the Supabase SQL editor after reviewing against the live schema.
-- Existing relationship tables are not modified by this migration.
create table if not exists public.tiziana_privacy_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  compass boolean not null default false,
  moments boolean not null default false,
  discoveries boolean not null default false,
  connections boolean not null default false,
  history boolean not null default false,
  updated_at timestamptz not null default now()
);
create table if not exists public.tiziana_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  locale text not null default 'es' check (locale in ('es','en')),
  title text not null default 'Conversación',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(id,user_id)
);
create table if not exists public.tiziana_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check(role in ('user','assistant')),
  content text not null check(char_length(content) between 1 and 8000),
  created_at timestamptz not null default now(),
  foreign key(conversation_id,user_id) references public.tiziana_conversations(id,user_id) on delete cascade
);
create index if not exists tiziana_messages_conversation_idx on public.tiziana_messages(conversation_id,created_at);
create table if not exists public.tiziana_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check(char_length(content) between 1 and 1500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.tiziana_memory_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check(char_length(content) between 1 and 1500),
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create table if not exists public.product_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null check(product in ('book','tiziana')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists product_entitlements_user_idx on public.product_entitlements(user_id,product);
create table if not exists public.tiziana_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_month date not null default date_trunc('month', current_date)::date,
  message_count integer not null default 0 check(message_count >= 0),
  primary key(user_id,usage_month)
);
create table if not exists public.payment_events (
  provider_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);
-- Enable RLS even if tables already existed.
alter table public.tiziana_privacy_preferences enable row level security;
alter table public.tiziana_conversations enable row level security;
alter table public.tiziana_messages enable row level security;
alter table public.tiziana_memories enable row level security;
alter table public.tiziana_memory_proposals enable row level security;
alter table public.product_entitlements enable row level security;
alter table public.tiziana_usage enable row level security;
alter table public.payment_events enable row level security;
-- A single owner-only policy for user-editable resources.
do $$ declare t text; begin
  foreach t in array array['tiziana_privacy_preferences','tiziana_conversations','tiziana_messages','tiziana_memories','tiziana_memory_proposals'] loop
    execute format('drop policy if exists "owner_select" on public.%I',t);
    execute format('drop policy if exists "owner_insert" on public.%I',t);
    execute format('drop policy if exists "owner_update" on public.%I',t);
    execute format('drop policy if exists "owner_delete" on public.%I',t);
    execute format('create policy "owner_select" on public.%I for select to authenticated using (user_id = (select auth.uid()))',t);
    execute format('create policy "owner_insert" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))',t);
    execute format('create policy "owner_update" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',t);
    execute format('create policy "owner_delete" on public.%I for delete to authenticated using (user_id = (select auth.uid()))',t);
  end loop;
end $$;
-- Entitlements and usage are read-only to users. Only trusted server workflows may grant access.
drop policy if exists "entitlement_owner_read" on public.product_entitlements;
drop policy if exists "usage_owner_read" on public.tiziana_usage;
create policy "entitlement_owner_read" on public.product_entitlements for select to authenticated using(user_id = (select auth.uid()));
create policy "usage_owner_read" on public.tiziana_usage for select to authenticated using(user_id = (select auth.uid()));
-- payment_events intentionally has no client policies.

-- Atomic payment fulfillment. Called only by the trusted webhook with service-role credentials.
create or replace function public.grant_tiziana_purchase(event_id text,event_type text,buyer_id uuid,purchased_product text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if purchased_product not in ('book','bundle') then raise exception 'Invalid product'; end if;
  insert into public.payment_events(provider_event_id,event_type) values(event_id,event_type)
  on conflict do nothing;
  if not found then return; end if;
  if not exists (select 1 from public.product_entitlements where user_id=buyer_id and product='book') then
    insert into public.product_entitlements(user_id,product,expires_at) values(buyer_id,'book',null);
  end if;
  if purchased_product = 'bundle' then
    insert into public.product_entitlements(user_id,product,expires_at)
    values(buyer_id,'tiziana',now()+interval '3 months');
  end if;
end $$;
revoke all on function public.grant_tiziana_purchase(text,text,uuid,text) from public, anon, authenticated;
grant execute on function public.grant_tiziana_purchase(text,text,uuid,text) to service_role;

-- Atomic monthly quota. Only service-role code may execute these functions.
create or replace function public.reserve_tiziana_message(p_user_id uuid, p_month date, p_limit integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare new_count integer;
begin
  if p_user_id is null or p_month is null or p_limit is null or p_month <> date_trunc('month',p_month)::date or p_limit < 1 then
    raise exception 'Invalid usage reservation';
  end if;
  insert into public.tiziana_usage(user_id,usage_month,message_count)
  values(p_user_id,p_month,1)
  on conflict(user_id,usage_month) do update
    set message_count = public.tiziana_usage.message_count + 1
    where public.tiziana_usage.message_count < p_limit
  returning message_count into new_count;
  return new_count;
end $$;
create or replace function public.refund_tiziana_message(p_user_id uuid,p_month date)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.tiziana_usage set message_count = greatest(message_count-1,0)
  where user_id=p_user_id and usage_month=p_month;
end $$;
revoke all on function public.reserve_tiziana_message(uuid,date,integer) from public,anon,authenticated;
revoke all on function public.refund_tiziana_message(uuid,date) from public,anon,authenticated;
grant execute on function public.reserve_tiziana_message(uuid,date,integer) to service_role;
grant execute on function public.refund_tiziana_message(uuid,date) to service_role;

-- The original reflections table has an overly broad duplicate INSERT policy.
-- This removes only the known weaker policy; review all existing policies in staging.
drop policy if exists "Users can insert own reflections" on public.relationship_reflections;

-- Renewal grants are idempotent. A paid Stripe invoice extends access only through
-- the provider-verified subscription period end, never through client-supplied dates.
create or replace function public.grant_tiziana_renewal(event_id text,event_type text,buyer_id uuid,valid_until timestamptz)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if buyer_id is null or valid_until is null or valid_until <= now() then raise exception 'Invalid renewal'; end if;
  insert into public.payment_events(provider_event_id,event_type) values(event_id,event_type) on conflict do nothing;
  if not found then return; end if;
  if exists (select 1 from public.product_entitlements where user_id=buyer_id and product='tiziana' and expires_at is null) then
    return; -- Never replace a perpetual grant with a finite renewal.
  end if;
  if exists (select 1 from public.product_entitlements where user_id=buyer_id and product='tiziana') then
    update public.product_entitlements
      set expires_at=greatest(coalesce(expires_at,valid_until),valid_until)
      where user_id=buyer_id and product='tiziana';
  else
    insert into public.product_entitlements(user_id,product,expires_at) values(buyer_id,'tiziana',valid_until);
  end if;
end $$;
revoke all on function public.grant_tiziana_renewal(text,text,uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.grant_tiziana_renewal(text,text,uuid,timestamptz) to service_role;
