export interface Recommendation {
    id: string;
    category: 'workout' | 'nutrition' | 'hydration' | 'habit';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
}

export interface Workout {
    id?: string;
    user_id?: string;
    date: string;
    morning_hiit_completed?: boolean;
    // Add other fields as discovered from codebase
    [key: string]: any;
}

export interface Meal {
    id?: string;
    user_id?: string;
    date: string;
    green_tea_cups?: number;
    lunch?: any;
    dinner?: any;
    [key: string]: any;
}

export interface SugarLog {
    id?: string;
    user_id?: string;
    date: string;
    type: 'intake' | 'craving';
    success_resisted?: boolean;
    [key: string]: any;
}

export interface Foundation {
    id?: string;
    user_id?: string;
    date: string;
    notes?: Record<string, any> | null;
    [key: string]: any;
}
