create table if not exists public.kv_store_9a7b4805 (
  key text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_kv_store_updated_at on public.kv_store_9a7b4805;
create trigger trg_kv_store_updated_at
before update on public.kv_store_9a7b4805
for each row execute function public.set_updated_at();

alter table public.kv_store_9a7b4805 enable row level security;

create policy "service_role_full_access"
on public.kv_store_9a7b4805
as permissive
for all
to service_role
using (true)
with check (true);
