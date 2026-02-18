import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
    planData,
    getBasePlanForDay,
    calculateWaterTarget,
    calculateFastingWindow,
    calculateUserLevel,
    mapExercises
} from '@repo/shared';

export interface ExercisePlan {
    name: string;
    targetReps: number;
    unit?: string;
    safetyTip?: string;
}

export interface PersonalizedPlan {
    day: string;
    workoutType: string;
    exercises: ExercisePlan[];
    fastingWindow: string;
    waterTarget: number;
    level: string;
    streak: number;
}

export function usePersonalizedPlan(currentUserId: string | null) {
    const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculatePlan = async () => {
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const todayIndex = new Date().getDay();
            const dayName = days[todayIndex];

            // 1. Get Base Plan from Shared Logic
            const { workoutType, rawExercises } = getBasePlanForDay(dayName);

            // 2. Base values from Shared Data
            let level = "Beginner";
            let streak = 0;
            let repMultiplier = 1.0;
            let waterTarget = planData.profile.water_liters_per_day;
            let fastingWindow = planData.profile.fasting_window;

            if (currentUserId) {
                setLoading(true);

                try {
                    const supabase = createClient();
                    const { data: user } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', currentUserId)
                        .single();

                    if (user) {
                        waterTarget = calculateWaterTarget(user.weight_kg, user.activity_level);
                        fastingWindow = calculateFastingWindow(user.goals);
                    }

                    // Fetch history logic (Supabase) stays here as it's data access
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - 14);

                    const { data: historyData } = await supabase
                        .from('workouts')
                        .select('*')
                        .gte('date', startDate.toISOString().split('T')[0])
                        .lte('date', endDate.toISOString().split('T')[0])
                        .eq('user_id', currentUserId);

                    const history = historyData || [];
                    const workoutCount = history.filter((h: any) => h.morning_hiit_completed === 1).length;

                    // Use Shared Level Logic
                    const levelResult = calculateUserLevel(workoutCount, user?.activity_level);
                    level = levelResult.level;
                    repMultiplier = levelResult.repMultiplier;

                    streak = workoutCount;
                } catch (e) {
                    console.error("Error fetching history", e);
                }
            }

            // 3. Map Exercises with Shared Logic
            const processedExercises = mapExercises(rawExercises, repMultiplier);

            setPlan({
                day: dayName,
                workoutType,
                exercises: processedExercises,
                fastingWindow,
                waterTarget,
                level,
                streak
            });
            setLoading(false);
        };

        calculatePlan();
    }, [currentUserId]);

    return { plan, loading };
}
