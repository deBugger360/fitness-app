-- Analytics Events Table for ML Training Data
create table public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  event_category text not null, -- 'workout', 'nutrition', 'behavior', 'biometrics'
  event_action text not null,   -- 'log_run', 'log_meal', 'daily_check', 'weight_log'
  value numeric,                -- Primary metric: duration, calories, score, weight
  tags text[] default '{}',     -- 'morning', 'high_intensity', 'sugar_craving'
  context jsonb default '{}',   -- raw data, weather, location, suggestions given
  occurred_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.analytics_events enable row level security;
create policy "Users can insert own analytics" on public.analytics_events for insert with check (auth.uid() = user_id);
create policy "Users can view own analytics" on public.analytics_events for select using (auth.uid() = user_id);
