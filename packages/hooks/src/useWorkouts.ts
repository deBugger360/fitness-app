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
import { OfflineManager } from '@repo/lib';

export function useWorkouts(
    supabase: SupabaseClient,
    userId: string | undefined,
    options: UseWorkoutsOptions = {}
): UseWorkoutsResult {
    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const offline = OfflineManager.getInstance();
        const cacheKey = `workouts_${options.date || 'all'}`;

        // 1. Load from cache immediately
        if (loading) {
            const cached = await offline.getCached<WorkoutLog[]>(cacheKey);
            if (cached) {
                setWorkouts(cached);
                setLoading(false);
            }
        }

        if (!userId) {
            setLoading(false);
            return;
        }

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

            const fetchedWorkouts = (data as WorkoutLog[]) || [];
            setWorkouts(fetchedWorkouts);

            // Update cache
            offline.setCache(cacheKey, fetchedWorkouts);
        } catch (e: any) {
            console.error('Fetch failed, using cache if available', e);
            setError(e?.message ?? 'Failed to fetch workouts');
        } finally {
            setLoading(false);
        }
    }, [userId, options.date, options.startDate, options.endDate, loading]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const save = useCallback(async (data: CreateWorkoutInput): Promise<WorkoutLog | null> => {
        if (!userId) return null;

        // Optimistic update
        const optimistic: WorkoutLog = {
            ...data,
            id: 'temp-' + Date.now(),
            user_id: userId,
            created_at: new Date().toISOString()
        } as WorkoutLog;

        setWorkouts(prev => {
            const existingIdx = prev.findIndex(w => w.date === data.date);
            if (existingIdx >= 0) {
                const next = [...prev];
                next[existingIdx] = { ...prev[existingIdx], ...data };
                return next;
            }
            return [optimistic, ...prev];
        });

        try {
            const result = await saveWorkout(supabase, userId, data);
            // Replace temp with real result if needed, or refresh
            // But saveWorkout returns the updated object, so let's update state with real ID
            setWorkouts(prev => prev.map(w => w.date === data.date ? (result as WorkoutLog) : w));
            return result as WorkoutLog;
        } catch (e: any) {
            console.warn('Online save failed, queuing offline mutation');
            OfflineManager.getInstance().queueMutation('workouts', 'UPSERT', { ...data, user_id: userId });
            return optimistic;
        }
    }, [supabase, userId]);

    return { workouts, loading, error, refresh, save };
}
