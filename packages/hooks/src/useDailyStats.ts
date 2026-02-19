import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { WorkoutLog, MealLog, SugarLog, DailyScore } from '@repo/types';
import { Foundation } from '@repo/shared';
import { calculateDailyScore, calculateStreak } from '@repo/analytics';
import { OfflineManager } from '@repo/lib';

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
        const offline = OfflineManager.getInstance();
        const cacheKey = `daily_stats_${targetDate}`;

        // 1. Load from cache immediately
        if (loading) { // Only check cache on initial load to avoid flickering
            const cached = await offline.getCached<any>(cacheKey);
            if (cached) {
                setWorkouts(cached.workouts || []);
                setMeals(cached.meals || []);
                setSugarLogs(cached.sugarLogs || []);
                setFoundation(cached.foundation || null);
                setScore(cached.score || null);
                setStreak(cached.streak || 0);
                setLoading(false); // Show cached content
            }
        }

        if (!userId) {
            setLoading(false);
            return;
        }

        // Keep loading true if no cache was found
        // If cache found, we are already showing data, just background updating

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

            let calculatedStreak = 0;
            // Streak from history if provided, otherwise just today's pass/fail
            if (scoreHistory && scoreHistory.length > 0) {
                calculatedStreak = calculateStreak(scoreHistory);
            } else {
                calculatedStreak = dailyScore.score >= 60 ? 1 : 0;
            }
            setStreak(calculatedStreak);

            // Update cache
            offline.setCache(cacheKey, {
                workouts: workoutData,
                meals: mealData,
                sugarLogs: sugarData,
                foundation: foundationData,
                score: dailyScore,
                streak: calculatedStreak
            });

        } catch (e: any) {
            console.error('Fetch failed, using cache if available', e);
            setError(e?.message ?? 'Failed to fetch daily stats');
        } finally {
            setLoading(false);
        }
    }, [userId, targetDate, loading]); // Added loading dependency to allow cache check once

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { workouts, meals, sugarLogs, foundation, score, streak, loading, error, refresh };
}
