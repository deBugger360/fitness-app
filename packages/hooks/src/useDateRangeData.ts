import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { WorkoutLog, MealLog, SugarLog } from '@repo/types';
import { Foundation } from '@repo/shared';

export interface UseDateRangeDataResult {
    workouts: WorkoutLog[];
    meals: MealLog[];
    sugarLogs: SugarLog[];
    foundations: Foundation[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * useDateRangeData — fetches all four data sources for a date range in parallel.
 *
 * Designed for analytics/stats pages that need a week or month of data.
 * Platform-agnostic: works in React DOM (web) and React Native (mobile).
 *
 * @example
 * const { workouts, meals, sugarLogs, foundations } = useDateRangeData(
 *   supabase, userId, '2024-01-01', '2024-01-07'
 * );
 */
export function useDateRangeData(
    supabase: SupabaseClient,
    userId: string | undefined,
    startDate: string,
    endDate: string
): UseDateRangeDataResult {
    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [meals, setMeals] = useState<MealLog[]>([]);
    const [sugarLogs, setSugarLogs] = useState<SugarLog[]>([]);
    const [foundations, setFoundations] = useState<Foundation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId || !startDate || !endDate) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [workoutsRes, mealsRes, sugarRes, foundationsRes] = await Promise.all([
                supabase
                    .from('workouts')
                    .select('*')
                    .eq('user_id', userId)
                    .gte('date', startDate)
                    .lte('date', endDate)
                    .order('date', { ascending: true }),
                supabase
                    .from('meals')
                    .select('*')
                    .eq('user_id', userId)
                    .gte('date', startDate)
                    .lte('date', endDate)
                    .order('date', { ascending: true }),
                supabase
                    .from('sugar_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .gte('date', startDate)
                    .lte('date', endDate)
                    .order('created_at', { ascending: true }),
                supabase
                    .from('foundations')
                    .select('*')
                    .eq('user_id', userId)
                    .gte('date', startDate)
                    .lte('date', endDate)
                    .order('date', { ascending: true }),
            ]);

            if (workoutsRes.error) throw workoutsRes.error;
            if (mealsRes.error) throw mealsRes.error;
            if (sugarRes.error) throw sugarRes.error;
            if (foundationsRes.error) throw foundationsRes.error;

            setWorkouts((workoutsRes.data as WorkoutLog[]) || []);
            setMeals((mealsRes.data as MealLog[]) || []);
            setSugarLogs((sugarRes.data as SugarLog[]) || []);
            setFoundations((foundationsRes.data as Foundation[]) || []);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to fetch range data');
        } finally {
            setLoading(false);
        }
    }, [userId, startDate, endDate]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { workouts, meals, sugarLogs, foundations, loading, error, refresh };
}
