import { createClient } from "@/utils/supabase/client";

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

    // Check existing
    const { data: existing } = await supabase
        .from('workouts')
        .select('*')
        .eq('date', dateStr)
        .eq('user_id', userId)
        .single();

    const payload = {
        user_id: userId,
        date: dateStr,
        ...data,
        synced: 0 // Mark for sync if PWA logic handles that
    };

    if (existing) {
        // Merge updates carefully
        const updateData: any = {};
        if (data.morning_hiit_completed !== undefined) updateData.morning_hiit_completed = data.morning_hiit_completed;
        if (data.evening_walk_minutes !== undefined) updateData.evening_walk_minutes = data.evening_walk_minutes;
        if (data.exercises_completed !== undefined) updateData.exercises_completed = data.exercises_completed;
        if (data.notes !== undefined) updateData.notes = data.notes;

        await supabase
            .from('workouts')
            .update(updateData)
            .eq('id', existing.id);
    } else {
        await supabase
            .from('workouts')
            .insert({
                ...payload,
                // Defaults for missing fields if this is a new insert
                morning_hiit_completed: data.morning_hiit_completed || 0,
                evening_walk_minutes: data.evening_walk_minutes || 0,
                exercises_completed: data.exercises_completed || []
            });
    }
};
