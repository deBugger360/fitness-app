import { createClient } from "@/utils/supabase/client";

export interface Recommendation {
    id: string;
    category: 'workout' | 'nutrition' | 'hydration' | 'habit';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
}

export const generateRecommendations = async (userId: string): Promise<Recommendation[]> => {
    const recommendations: Recommendation[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Fetch recent data (last 7 days)
    const supabase = createClient();

    // Fetch recent data (last 7 days)
    const { data: workoutsData } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(7);

    const workouts = workoutsData || [];

    const { data: mealsData } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(7);

    const meals = mealsData || [];

    const { data: sugarLogsData } = await supabase
        .from('sugar_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(14);

    const sugarLogs = sugarLogsData || [];

    // 1. Workout Intensity Logic
    const recentWorkouts = workouts.slice(0, 3);
    const missedWorkouts = recentWorkouts.length < 2; // Less than 2 in last 7 days (if sparse data)? Or check dates closer.

    // Check if user has missed recent days
    if (workouts.length > 0) {
        const lastWorkout = new Date(workouts[0].date);
        const diffDays = Math.floor((new Date().getTime() - lastWorkout.getTime()) / (1000 * 3600 * 24));

        if (diffDays > 2) {
            recommendations.push({
                id: 'workout_missed',
                category: 'workout',
                title: 'Get Back on Track',
                message: "It's been a few days. Start small today with just the 15-min HIIT.",
                priority: 'high'
            });
        }

        // If consistent (3+ in last 5 days), suggest bumping intensity
        if (workouts.length >= 3 && diffDays <= 1) {
            recommendations.push({
                id: 'workout_boost',
                category: 'workout',
                title: 'Ready for More?',
                message: "You're consistent! Try adding an extra set to your squats today.",
                priority: 'medium'
            });
        }
    } else {
        recommendations.push({
            id: 'workout_start',
            category: 'workout',
            title: 'Start Strong',
            message: "The first step is the hardest. Do your first workout today!",
            priority: 'high'
        });
    }

    const averageIntensity = recentWorkouts.reduce((acc: number, m: any) => acc + (m.morning_hiit_completed ? 1 : 0), 0) / (recentWorkouts.length || 1);

    // 2. Hydration Check
    // If average cups < 1 over last week, recommend Green Tea / Water
    const averageTea = meals.reduce((acc: number, m: any) => acc + (m.green_tea_cups || 0), 0) / (meals.length || 1);

    if (averageTea < 1.0) {
        recommendations.push({
            id: 'hydration-boost',
            category: 'nutrition',
            title: 'Hydration Boost',
            message: 'You\'re averaging less than 1 cup of Green Tea. Aim for 2 cups daily for metabolism.',
            priority: 'high'
        });
    }

    // 3. Sugar Reduction
    // If sugar slips > 2 in last week
    const slips = sugarLogs.filter((s: any) => s.type === 'intake').length;
    const resisted = sugarLogs.filter((s: any) => s.type === 'craving' && s.success_resisted).length;

    if (slips > 2) {
        recommendations.push({
            id: 'sugar-alert',
            category: 'nutrition',
            title: 'Sugar Watch',
            message: `You've had ${slips} sugar slips recently. Try formatting cravings with a 10m timer.`,
            priority: 'medium'
        });
    }

    if (resisted > 3) {
        recommendations.push({
            id: 'sugar-win',
            category: 'habit',
            title: 'Willpower Warrior',
            message: `You've resisted ${resisted} cravings! Keep that momentum.`,
            priority: 'low'
        });
    }

    // 4. Habit Stacking
    // If workout consistency is low but meal logging is high
    const workoutConsistency = recentWorkouts.length; // Simple count of days with logs
    const mealConsistency = meals.reduce((acc: number, m: any) => acc + (m.lunch || m.dinner ? 1 : 0), 0);
    if (mealConsistency > 5 && workoutConsistency < 3) { // Example condition
        recommendations.push({
            id: 'fasting_tip',
            category: 'habit',
            title: 'Fasting Consistency',
            message: "Try setting a phone alarm for 6 PM to remind you to close your window.",
            priority: 'medium'
        });
    }

    return recommendations.sort((a, b) => (a.priority === 'high' ? -1 : 1));
};
