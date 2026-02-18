export interface UserProfile {
    id: string;
    email: string;
    username?: string;
    avatar_url?: string;
    workout_days_per_week: number;
    activity_level: 'sedentary' | 'moderate' | 'active' | 'athlete';
    goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';
    current_streak: number;
    created_at: string;
}

export interface WorkoutLog {
    id: string;
    user_id: string;
    date: string;
    morning_hiit_completed: boolean;
    type: string;
    duration_minutes?: number;
    notes?: string;
    created_at?: string;
}

export interface MealLog {
    id: string;
    user_id: string;
    date: string;
    green_tea_cups: number;
    quality: 'healthy' | 'moderate' | 'unhealthy';
    description?: string;
    fasting_hours?: number;
    created_at?: string;
}

export interface SugarLog {
    id: string;
    user_id: string;
    date: string;
    type: 'intake' | 'craving'; // intake = ate sugar, craving = resisted (or tracked craving)
    amount_grams?: number;
    activity_context?: string; // what were they doing?
    mood_context?: string; // how did they feel?
    success_resisted: boolean; // TRUE if they didn't eat it
    created_at?: string;
}

export interface DailyScore {
    date: string;
    score: number; // 0-100
    breakdown: {
        workout: number;
        nutrition: number;
        hydration: number;
        sugar: number;
        habits: number;
    };
    notes?: string;
}

export interface HabitAnalytics {
    streak_days: number;
    total_workouts: number;
    sugar_free_days: number;
    average_score: number;
    history: { date: string; score: number }[];
}

// Re-export Reality types as they fit here too
export interface RealityLog {
    id: string;
    user_id: string;
    content: string;
    mood: string;
    analysis: BehaviorLog; // Analysis result
    created_at: string;
}

export interface BehaviorLog {
    foods: string; // Original input
    mood: string;
    calorie_density: 'Low' | 'Medium' | 'High';
    tags: string[];
    suggestions: string[];
}
