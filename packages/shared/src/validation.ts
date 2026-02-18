import { WorkoutLog, MealLog } from '@repo/types';

// Types for creating new entries (Omit auto-generated fields; user_id comes from auth context)
export type CreateWorkoutInput = Partial<Omit<WorkoutLog, 'id' | 'user_id' | 'created_at' | 'date'>> & {
    date: string; // YYYY-MM-DD required for identification
    evening_walk_minutes?: number; // web-specific field not in shared WorkoutLog type
};

export type CreateMealInput = Partial<Omit<MealLog, 'id' | 'user_id' | 'created_at'>> & {
    date: string;
};

/**
 * Validates and normalizes a *new* workout entry.
 * Enforces defaults for all optional fields.
 */
export const validateNewWorkout = (data: Partial<CreateWorkoutInput>) => {
    return {
        ...data,
        morning_hiit_completed: data.morning_hiit_completed ? 1 : 0,
        evening_walk_minutes: (data as any).evening_walk_minutes || data.duration_minutes || 0,
        notes: data.notes || '',
        exercises_completed: (data as any).exercises_completed || []
    };
};

/**
 * Sanitizes partial update data for workouts.
 * Only includes fields that are explicitly provided.
 */
export const sanitizeWorkoutUpdate = (data: Partial<CreateWorkoutInput>) => {
    const update: Record<string, any> = {};

    if (data.morning_hiit_completed !== undefined) {
        update.morning_hiit_completed = data.morning_hiit_completed ? 1 : 0;
    }
    if ((data as any).evening_walk_minutes !== undefined) {
        update.evening_walk_minutes = (data as any).evening_walk_minutes;
    } else if (data.duration_minutes !== undefined) {
        update.evening_walk_minutes = data.duration_minutes;
    }
    if (data.notes !== undefined) {
        update.notes = data.notes;
    }
    if ((data as any).exercises_completed !== undefined) {
        update.exercises_completed = (data as any).exercises_completed;
    }

    return update;
};

/**
 * Validates and normalizes meal input data.
 */
export const validateMealInput = (data: Partial<CreateMealInput>) => {
    return {
        ...data,
        quality: data.quality || 'moderate',
        green_tea_cups: data.green_tea_cups || 0,
        description: data.description || ''
    };
};
