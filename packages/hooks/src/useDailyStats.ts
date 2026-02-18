import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { WorkoutLog, MealLog, SugarLog, DailyScore } from '@repo/types';
import { Foundation } from '@repo/shared';
import { calculateDailyScore, calculateStreak } from '@repo/lib';

export interface UseDailyStatsResult {
    workouts: WorkoutLog[];
    meals: MealLog[];
    sugarLogs: SugarLog[];
    foundation: Foundation | null;
    /** Calculated score for the target date (0-100). */
    score: DailyScore | null;
    /** Streak count based on provided history (pass 7+ days for accuracy). */
    streak: number;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

/**
 * useDailyStats — composite hook that fetches all data for a single day
 * and computes the daily score using the shared analytics engine.
 *
 * Platform-agnostic: works in React DOM (web) and React Native (mobile).
 *
 * @param supabase - Platform-injected Supabase client
 * @param userId - Authenticated user ID
 * @param date - YYYY-MM-DD target date (defaults to today)
 * @param scoreHistory - Optional historical DailyScore[] for streak calculation
 */
export function useDailyStats(
    supabase: SupabaseClient,
    userId: string | undefined,
    date?: string,
    scoreHistory?: DailyScore[]
): UseDailyStatsResult {
    const targetDate = date ?? new Date().toISOString().split('T')[0];

    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [meals, setMeals] = useState<MealLog[]>([]);
    const [sugarLogs, setSugarLogs] = useState<SugarLog[]>([]);
    const [foundation, setFoundation] = useState<Foundation | null>(null);
    const [score, setScore] = useState<DailyScore | null>(null);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [workoutsRes, mealsRes, sugarRes, foundationRes] = await Promise.all([
                supabase.from('workouts').select('*').eq('user_id', userId).eq('date', targetDate),
                supabase.from('meals').select('*').eq('user_id', userId).eq('date', targetDate),
                supabase.from('sugar_logs').select('*').eq('user_id', userId).eq('date', targetDate),
                supabase.from('foundations').select('*').eq('user_id', userId).eq('date', targetDate).maybeSingle(),
            ]);

            const workoutData = (workoutsRes.data as WorkoutLog[]) || [];
            const mealData = (mealsRes.data as MealLog[]) || [];
            const sugarData = (sugarRes.data as SugarLog[]) || [];
            const foundationData = (foundationRes.data as Foundation) || null;

            setWorkouts(workoutData);
            setMeals(mealData);
            setSugarLogs(sugarData);
            setFoundation(foundationData);

            // Compute score via shared analytics engine
            const dailyScore = calculateDailyScore(workoutData, mealData, sugarData, foundationData);
            setScore(dailyScore);

            // Streak from history if provided, otherwise just today's pass/fail
            if (scoreHistory && scoreHistory.length > 0) {
                setStreak(calculateStreak(scoreHistory));
            } else {
                setStreak(dailyScore.score >= 60 ? 1 : 0);
            }
        } catch (e: any) {
            setError(e?.message ?? 'Failed to fetch daily stats');
        } finally {
            setLoading(false);
        }
    }, [userId, targetDate]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { workouts, meals, sugarLogs, foundation, score, streak, loading, error, refresh };
}
