import { useState, useCallback } from 'react';
import { supabase } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import { BehaviorLog, WorkoutLog, MealLog, SugarLog } from '@repo/types';

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
            // Parallel Fetches
            const [workouts, meals, cravings, behavior] = await Promise.all([
                supabase.from('workouts').select('id, morning_hiit_completed').eq('user_id', userId).eq('date', today),
                supabase.from('meals').select('id, green_tea_cups').eq('user_id', userId).eq('date', today), // Assuming water stored here or similar
                supabase.from('sugar_logs').select('id').eq('user_id', userId).eq('date', today).eq('type', 'craving'),
                supabase.from('reality_logs').select('id').eq('user_id', userId).gte('created_at', today),
            ]);

            // Calculate "Consistency Score" (Primitive implementation)
            let dailyScore = 0;
            const workoutCount = workouts.data?.length || 0;
            const mealCount = meals.data?.length || 0;
            const waterCount = meals.data?.reduce((acc: number, curr: any) => acc + (curr.green_tea_cups || 0), 0) || 0;
            const cravingCount = cravings.data?.length || 0;
            const logCount = behavior.data?.length || 0;

            if (workoutCount > 0) dailyScore += 30;
            if (mealCount > 0) dailyScore += 20;
            if (waterCount >= 4) dailyScore += 20; // 4 cups target
            if (logCount > 0) dailyScore += 30;

            setScore(Math.min(dailyScore, 100));
            setStats({
                workouts: workoutCount,
                meals: mealCount,
                water: waterCount,
                cravings: cravingCount
            });

            // Streak Logic (simplified for now, usually needs recursive check)
            // For MVP, just hardcode or fetch from profile if stored
            setStreak(5); // Placeholder

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

    // Optimistic Updates
    const logAction = async (type: 'workout' | 'meal' | 'water' | 'craving') => {
        const today = new Date().toISOString().split('T')[0];

        // Optimistic UI
        setStats(prev => {
            const next = { ...prev };
            if (type === 'workout') next.workouts++;
            if (type === 'meal') next.meals++;
            if (type === 'water') next.water++;
            if (type === 'craving') next.cravings++;
            return next;
        });

        // Actual DB Call (fire and forget for UI responsiveness, handle error if needed)
        if (!userId) return;

        try {
            if (type === 'workout') {
                await supabase.from('workouts').insert({ user_id: userId, date: today, morning_hiit_completed: true });
            } else if (type === 'water') {
                // Upsert logic usually needed for counters, simplified here insert new row or specific logic
                await supabase.from('meals').insert({ user_id: userId, date: today, green_tea_cups: 1 });
            }
            // Add others...
        } catch (e) {
            console.error("Log failed", e);
            // Revert state if needed
        }
    };

    return { loading, score, streak, stats, logAction, refresh };
}
