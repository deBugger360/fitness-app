import { db } from "@/lib/db";

export interface Recommendation {
    id: string;
    category: 'workout' | 'nutrition' | 'hydration' | 'habit';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
}

export const generateRecommendations = async (userId: number): Promise<Recommendation[]> => {
    const recommendations: Recommendation[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Fetch recent data (last 7 days)
    const workouts = await db.table('workouts')
        .where('user_id').equals(userId)
        .reverse()
        .limit(7)
        .toArray();

    const meals = await db.table('meals')
        .where('user_id').equals(userId)
        .reverse()
        .limit(7)
        .toArray();

    const sugarLogs = await db.table('sugar_logs')
        .where('user_id').equals(userId)
        .reverse()
        .limit(14)
        .toArray();

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

    // 2. Hydration Logic
    const avgWater = meals.reduce((acc, m) => acc + (m.water_liters || 0), 0) / (meals.length || 1);
    if (avgWater < 2.0) {
        recommendations.push({
            id: 'hydration_low',
            category: 'hydration',
            title: 'Hydration Alert',
            message: `Your average is only ${avgWater.toFixed(1)}L. Aim for 3L today to boost energy.`,
            priority: 'high'
        });
    } else if (avgWater > 2.5) {
        recommendations.push({
            id: 'hydration_good',
            category: 'hydration',
            title: 'Great Hydration!',
            message: "You're hitting your water goals. Keep it up for clearer skin.",
            priority: 'low'
        });
    }

    // 3. Sugar Reduction Logic
    const recentSlips = sugarLogs.filter(s => s.type === 'intake').length;
    const recentCravs = sugarLogs.filter(s => s.type === 'craving').length;

    if (recentSlips > 3) {
        recommendations.push({
            id: 'sugar_warning',
            category: 'nutrition',
            title: 'Sugar Spike Detected',
            message: "You've had a few sugar slips recently. Try replacing your next craving with fruit.",
            priority: 'high'
        });
    } else if (recentCravs > 2 && recentSlips === 0) {
        recommendations.push({
            id: 'sugar_win',
            category: 'nutrition',
            title: 'Willpower of Steel',
            message: "You've resisted multiple cravings lately. Amazing discipline!",
            priority: 'medium'
        });
    }

    // 4. Habit Improvement
    const compliants = meals.filter(m => m.if_compliant).length;
    if (compliants < 3 && meals.length >= 3) {
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
