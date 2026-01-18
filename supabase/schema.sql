-- Create apps table
create table public.apps (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  package_id text not null,
  platform text not null check (platform in ('Google Play', 'App Store')),
  region text not null,
  status text not null default 'Online' check (status in ('Online', 'Removed', 'Error')),
  last_check timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create alerts table
create table public.alerts (
  id uuid default gen_random_uuid() primary key,
  app_id uuid references public.apps(id),
  app_name text not null,
  package_id text not null,
  platform text not null,
  region text not null,
  alert_group text,
  alert_time timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create settings table (singleton row usually)
create table public.settings (
  id uuid default gen_random_uuid() primary key,
  admin_email text,
  telegram_bot_token text,
  telegram_chat_id text,
  immediate_notification boolean default true,
  daily_report boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default settings row
insert into public.settings (admin_email, immediate_notification, daily_report)
values ('admin@example.com', true, false);

-- Enable Row Level Security (RLS)
alter table public.apps enable row level security;
alter table public.alerts enable row level security;
alter table public.settings enable row level security;

-- Create policies (Allow all for anon for demo purposes, strictly should be authenticated)
create policy "Allow all access for apps" on public.apps for all using (true) with check (true);
create policy "Allow all access for alerts" on public.alerts for all using (true) with check (true);
create policy "Allow all access for settings" on public.settings for all using (true) with check (true);

-- Create a function to update updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_apps_updated_at
  before update on public.apps
  for each row execute procedure public.handle_updated_at();

create trigger handle_settings_updated_at
  before update on public.settings
  for each row execute procedure public.handle_updated_at();
