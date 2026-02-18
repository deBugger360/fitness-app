import { SupabaseClient } from '@supabase/supabase-js';
import { CreateWorkoutInput, validateNewWorkout, sanitizeWorkoutUpdate } from '@repo/shared';

/**
 * Saves a workout log to the database.
 * Handles both insert (if new for date) and update (if exists).
 *
 * If updating, merges provided fields with existing ones.
 * If creating, enforces defaults for missing fields.
 */
export const saveWorkout = async (
    supabase: SupabaseClient,
    userId: string,
    data: CreateWorkoutInput
): Promise<Record<string, any> | null> => {

    if (!data.date) throw new Error("Date is required to save workout");

    // Check for existing record on this date
    const { data: existing, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .eq('date', data.date)
        .eq('user_id', userId)
        .maybeSingle();

    if (fetchError) {
        console.error("Error fetching existing workout", fetchError);
        throw fetchError;
    }

    if (existing) {
        // Partial update — only send changed fields
        const updatePayload = sanitizeWorkoutUpdate(data);
        if (Object.keys(updatePayload).length === 0) return existing;

        const { data: updated, error } = await supabase
            .from('workouts')
            .update(updatePayload)
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return updated;
    } else {
        // New record — enforce defaults
        const newPayload = validateNewWorkout(data);

        const { data: newRow, error } = await supabase
            .from('workouts')
            .insert({ user_id: userId, ...newPayload })
            .select()
            .single();

        if (error) throw error;
        return newRow;
    }
};
