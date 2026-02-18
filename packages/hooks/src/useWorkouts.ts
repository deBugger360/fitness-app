import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { WorkoutLog } from '@repo/types';
import { saveWorkout } from '@repo/lib';
import { CreateWorkoutInput } from '@repo/shared';

export interface UseWorkoutsOptions {
    /** YYYY-MM-DD. If omitted, fetches all time (last 30 days). */
    date?: string;
    /** Date range start (YYYY-MM-DD). Takes priority over `date`. */
    startDate?: string;
    /** Date range end (YYYY-MM-DD). */
    endDate?: string;
}

export interface UseWorkoutsResult {
    workouts: WorkoutLog[];
    loading: boolean;
    error: string | null;
    /** Re-fetch from the server. */
    refresh: () => Promise<void>;
    /** Upsert a workout (insert or update for the given date). */
    save: (data: CreateWorkoutInput) => Promise<WorkoutLog | null>;
}

/**
 * useWorkouts — platform-agnostic hook for fetching and saving workout logs.
 *
 * Works in React DOM (web) and React Native (mobile).
 * The caller injects their platform's SupabaseClient.
 *
 * @example
 * // Web
 * const supabase = createClient(); // @/utils/supabase/client
 * const { workouts, save } = useWorkouts(supabase, userId, { date: today });
 *
 * // Mobile
 * const { workouts, save } = useWorkouts(supabase, userId, { date: today });
 */
export function useWorkouts(
    supabase: SupabaseClient,
    userId: string | undefined,
    options: UseWorkoutsOptions = {}
): UseWorkoutsResult {
    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId) {
            setWorkouts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('workouts')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });

            if (options.startDate && options.endDate) {
                query = query.gte('date', options.startDate).lte('date', options.endDate);
            } else if (options.date) {
                query = query.eq('date', options.date);
            } else {
                // Default: last 30 days
                const since = new Date();
                since.setDate(since.getDate() - 30);
                query = query.gte('date', since.toISOString().split('T')[0]);
            }

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            setWorkouts((data as WorkoutLog[]) || []);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to fetch workouts');
        } finally {
            setLoading(false);
        }
    }, [userId, options.date, options.startDate, options.endDate]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const save = useCallback(async (data: CreateWorkoutInput): Promise<WorkoutLog | null> => {
        if (!userId) return null;
        try {
            const result = await saveWorkout(supabase, userId, data);
            // Optimistically update local state
            setWorkouts(prev => {
                const idx = prev.findIndex(w => w.date === data.date);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = result as WorkoutLog;
                    return next;
                }
                return [result as WorkoutLog, ...prev];
            });
            return result as WorkoutLog;
        } catch (e: any) {
            setError(e?.message ?? 'Failed to save workout');
            return null;
        }
    }, [supabase, userId]);

    return { workouts, loading, error, refresh, save };
}
