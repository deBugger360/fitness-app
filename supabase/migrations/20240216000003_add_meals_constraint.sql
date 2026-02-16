-- Add unique constraint to meals table to allow upsert
ALTER TABLE public.meals ADD CONSTRAINT meals_user_id_date_key UNIQUE (user_id, date);
