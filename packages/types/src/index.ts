export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    age?: number;
    height_cm?: number;
    weight_range_kg?: number[];
    goals?: string[]; // e.g., ["fat_loss", "muscle_gain"]
    fasting_window?: string;
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
    morning_hiit_completed: boolean | number; // boolean or 0/1
    exercises_completed?: string[]; // stored as jsonb or array in supabase
    evening_walk_minutes?: number;
    type: string;
    duration_minutes?: number;
    notes?: string;
    created_at?: string;
}

export interface MealLog {
    id: string;
    user_id: string;
    date: string;
    water_liters?: number; // Main hydration metric
    green_tea_cups: number;
    lunch?: string;
    dinner?: string;
    if_compliant?: boolean;
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
    trigger?: string; // e.g., "Stress", "Boredom"
    severity?: number; // 1-10 intensity
    success_resisted: boolean; // TRUE if they didn't eat it
    created_at?: string; // Essential for time-of-day analytics
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
