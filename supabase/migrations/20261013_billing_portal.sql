-- Apply AFTER the initial Tiziana migration. Customer IDs are server-managed.
create table if not exists public.tiziana_stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  customer_id text not null unique,
  subscription_id text unique,
  updated_at timestamptz not null default now()
);
alter table public.tiziana_stripe_customers enable row level security;
drop policy if exists "stripe_customer_owner_read" on public.tiziana_stripe_customers;
create policy "stripe_customer_owner_read" on public.tiziana_stripe_customers
  for select to authenticated using (user_id = (select auth.uid()));
-- Client writes are deliberately forbidden; only the service-role webhook may upsert.
