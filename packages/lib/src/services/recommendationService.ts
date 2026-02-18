import { SupabaseClient } from '@supabase/supabase-js';
import { calculateRecommendations, Recommendation, Foundation } from '@repo/shared';
import { WorkoutLog, MealLog, SugarLog } from '@repo/types';

export const generateRecommendations = async (
    supabase: SupabaseClient,
    userId: string
): Promise<Recommendation[]> => {

    // Fetch workouts (last 7 days)
    const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(7);

    // Fetch meals (last 7 days)
    const { data: mealsData } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(7);

    // Fetch sugar logs (last 14 days)
    const { data: sugarLogsData } = await supabase
        .from('sugar_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(14);

    // Fetch foundations (last 1)
    const { data: foundationsData } = await supabase
        .from('foundations')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1);

    const workouts = (workoutsData || []) as WorkoutLog[];
    const meals = (mealsData || []) as MealLog[];
    const sugarLogs = (sugarLogsData || []) as SugarLog[];
    const foundations = (foundationsData || []) as Foundation[];

    return calculateRecommendations(workouts, meals, sugarLogs, foundations);
};
