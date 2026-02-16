-- Foundations table
create table public.foundations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  date date not null,
  completed_principles text[] default '{}',
  notes jsonb default '{}',
  score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, date)
);

-- Enable RLS for foundations
alter table public.foundations enable row level security;
create policy "Users can view own foundations" on public.foundations for select using (auth.uid() = user_id);
create policy "Users can insert own foundations" on public.foundations for insert with check (auth.uid() = user_id);
create policy "Users can update own foundations" on public.foundations for update using (auth.uid() = user_id);
create policy "Users can delete own foundations" on public.foundations for delete using (auth.uid() = user_id);
