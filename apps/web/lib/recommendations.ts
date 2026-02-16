
import { createClient } from "@/utils/supabase/client";
import { calculateRecommendations, Recommendation, Workout, Meal, SugarLog, Foundation } from "@repo/shared";

export type { Recommendation };

export const generateRecommendations = async (userId: string): Promise<Recommendation[]> => {
    // Fetch recent data using existing supabase client
    const supabase = createClient();

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

    const workouts = (workoutsData || []) as Workout[];
    const meals = (mealsData || []) as Meal[];
    const sugarLogs = (sugarLogsData || []) as SugarLog[];
    const foundations = (foundationsData || []) as Foundation[];

    // Use shared logic
    return calculateRecommendations(workouts, meals, sugarLogs, foundations);
};
