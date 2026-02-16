-- Create behavior_logs table for Reality Log feature
create table public.behavior_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date default current_date not null,
  foods text not null, -- User description of what they ate
  mood text, -- 'stressed', 'bored', 'celebrating', 'hungry', etc.
  calorie_density text, -- 'high', 'medium', 'low' (system analyzed)
  tags text[], -- ['sugar', 'processed', 'alcohol'] (system analyzed)
  suggestions text, -- System generated advice
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.behavior_logs enable row level security;

create policy "Users can view their own behavior logs"
  on public.behavior_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own behavior logs"
  on public.behavior_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own behavior logs"
  on public.behavior_logs for update
  using (auth.uid() = user_id);
