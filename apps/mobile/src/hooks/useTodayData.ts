import { useState, useCallback } from 'react';
import { supabase } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import { BehaviorLog, WorkoutLog, MealLog, SugarLog } from '@repo/types';
import { Foundation } from '@repo/shared';
import { calculateDailyScore } from '@repo/analytics';
import { saveWorkout } from '@repo/lib';

export function useTodayData(userId?: string) {
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [stats, setStats] = useState({
        workouts: 0,
        meals: 0,
        water: 0,
        cravings: 0
    });

    const refresh = useCallback(async () => {
        if (!userId) return;
        setLoading(true);

        const today = new Date().toISOString().split('T')[0];

        try {
            // Parallel fetches
            const [workouts, meals, sugarLogs, behavior, foundations] = await Promise.all([
                supabase.from('workouts').select('*').eq('user_id', userId).eq('date', today),
                supabase.from('meals').select('*').eq('user_id', userId).eq('date', today),
                supabase.from('sugar_logs').select('*').eq('user_id', userId).eq('date', today),
                supabase.from('reality_logs').select('id').eq('user_id', userId).gte('created_at', today),
                supabase.from('foundations').select('*').eq('user_id', userId).eq('date', today).maybeSingle()
            ]);

            const workoutData: WorkoutLog[] = workouts.data || [];
            const mealData: MealLog[] = meals.data || [];
            const sugarData: SugarLog[] = sugarLogs.data || [];
            const foundationData: Foundation | null = foundations.data || null;

            // Use shared analytics engine
            const dailyScore = calculateDailyScore(workoutData, mealData, sugarData, foundationData);
            setScore(dailyScore.score);

            const waterCount = mealData.reduce((acc, curr) => acc + (curr.green_tea_cups || 0), 0);
            const cravingCount = sugarData.filter(s => s.type === 'craving').length;

            setStats({
                workouts: workoutData.length,
                meals: mealData.length,
                water: waterCount,
                cravings: cravingCount
            });

            // Streak: placeholder until we build a proper streak calculation
            setStreak(5);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );

    /**
     * Optimistic log action — updates UI immediately, then persists via shared service.
     */
    const logAction = async (type: 'workout' | 'meal' | 'water' | 'craving') => {
        const today = new Date().toISOString().split('T')[0];

        // Optimistic UI update
        setStats(prev => {
            const next = { ...prev };
            if (type === 'workout') next.workouts++;
            if (type === 'meal') next.meals++;
            if (type === 'water') next.water++;
            if (type === 'craving') next.cravings++;
            return next;
        });

        if (!userId) return;

        try {
            if (type === 'workout') {
                // Use shared saveWorkout service (handles upsert + defaults)
                await saveWorkout(supabase, userId, {
                    date: today,
                    morning_hiit_completed: true
                });
            } else if (type === 'water') {
                await supabase.from('meals').insert({
                    user_id: userId,
                    date: today,
                    green_tea_cups: 1,
                    quality: 'healthy'
                });
            }
        } catch (e) {
            console.error("Log failed", e);
            // Revert optimistic update on failure
            setStats(prev => {
                const next = { ...prev };
                if (type === 'workout') next.workouts--;
                if (type === 'meal') next.meals--;
                if (type === 'water') next.water--;
                if (type === 'craving') next.cravings--;
                return next;
            });
        }
    };

    return { loading, score, streak, stats, logAction, refresh };
}
