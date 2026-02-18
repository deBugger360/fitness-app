import { createClient } from "@/utils/supabase/client";
import { saveWorkout as saveWorkoutService } from "@repo/lib";

export const saveWorkout = async (
    userId: string,
    date: Date,
    data: {
        morning_hiit_completed?: number;
        evening_walk_minutes?: number;
        exercises_completed?: string[];
        notes?: string;
    }
) => {
    const supabase = createClient();
    const dateStr = date.toISOString().split('T')[0];

    // Coerce number to boolean for the shared service's typed input
    await saveWorkoutService(supabase, userId, {
        date: dateStr,
        morning_hiit_completed: data.morning_hiit_completed ? true : false,
        duration_minutes: data.evening_walk_minutes,
        evening_walk_minutes: data.evening_walk_minutes,
        exercises_completed: data.exercises_completed,
        notes: data.notes
    } as any);
};
