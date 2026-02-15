-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  photo text,
  gender text,
  activity_level text,
  goals text[],
  weight_kg numeric,
  height_cm numeric,
  age integer,
  fasting_window text default '14:10',
  water_target numeric default 3.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Workouts table
create table public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  date date not null,
  morning_hiit_completed integer default 0,
  evening_walk_minutes integer default 0,
  exercises_completed text[],
  notes text,
  synced integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for workouts
alter table public.workouts enable row level security;
create policy "Users can view own workouts" on public.workouts for select using (auth.uid() = user_id);
create policy "Users can insert own workouts" on public.workouts for insert with check (auth.uid() = user_id);
create policy "Users can update own workouts" on public.workouts for update using (auth.uid() = user_id);
create policy "Users can delete own workouts" on public.workouts for delete using (auth.uid() = user_id);

-- Meals table
create table public.meals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  date date not null,
  lunch text,
  dinner text,
  water_liters numeric default 0,
  green_tea_cups integer default 0,
  if_compliant boolean default false,
  synced integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for meals
alter table public.meals enable row level security;
create policy "Users can view own meals" on public.meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on public.meals for insert with check (auth.uid() = user_id);
create policy "Users can update own meals" on public.meals for update using (auth.uid() = user_id);
create policy "Users can delete own meals" on public.meals for delete using (auth.uid() = user_id);

-- Sugar Logs table
create table public.sugar_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  date date,
  timestamp timestamp with time zone,
  type text, -- 'craving' or 'intake'
  item text,
  intensity integer,
  trigger text,
  replacement_action text,
  success_resisted boolean,
  is_late_night boolean default false,
  synced integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for sugar_logs
alter table public.sugar_logs enable row level security;
create policy "Users can view own sugar logs" on public.sugar_logs for select using (auth.uid() = user_id);
create policy "Users can insert own sugar logs" on public.sugar_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own sugar logs" on public.sugar_logs for update using (auth.uid() = user_id);
create policy "Users can delete own sugar logs" on public.sugar_logs for delete using (auth.uid() = user_id);

-- Body Stats table
create table public.body_stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  date timestamp with time zone,
  weight_kg numeric,
  waist_cm numeric,
  notes text,
  synced integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for body_stats
alter table public.body_stats enable row level security;
create policy "Users can view own body stats" on public.body_stats for select using (auth.uid() = user_id);
create policy "Users can insert own body stats" on public.body_stats for insert with check (auth.uid() = user_id);
create policy "Users can update own body stats" on public.body_stats for update using (auth.uid() = user_id);
create policy "Users can delete own body stats" on public.body_stats for delete using (auth.uid() = user_id);

-- Diet Reflections table
create table public.diet_reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  date timestamp with time zone,
  description text,
  quality text, -- 'healthy', 'moderate', 'unhealthy'
  synced integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for diet_reflections
alter table public.diet_reflections enable row level security;
create policy "Users can view own diet reflections" on public.diet_reflections for select using (auth.uid() = user_id);
create policy "Users can insert own diet reflections" on public.diet_reflections for insert with check (auth.uid() = user_id);
create policy "Users can update own diet reflections" on public.diet_reflections for update using (auth.uid() = user_id);
create policy "Users can delete own diet reflections" on public.diet_reflections for delete using (auth.uid() = user_id);

-- Function to handle new user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
