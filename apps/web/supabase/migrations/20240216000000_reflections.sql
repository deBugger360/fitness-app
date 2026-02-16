-- Reflections table
create table public.reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  date date default CURRENT_DATE,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  quality text CHECK (quality IN ('positive', 'neutral', 'negative')),
  tags text[] default '{}',
  suggestions text[] default '{}',
  sentiment_score numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for reflections
alter table public.reflections enable row level security;
create policy "Users can view own reflections" on public.reflections for select using (auth.uid() = user_id);
create policy "Users can insert own reflections" on public.reflections for insert with check (auth.uid() = user_id);
create policy "Users can update own reflections" on public.reflections for update using (auth.uid() = user_id);
create policy "Users can delete own reflections" on public.reflections for delete using (auth.uid() = user_id);
