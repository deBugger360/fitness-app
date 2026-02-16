import { createClient } from "@/utils/supabase/client";

export const saveRealityLog = async (foods: string, mood: string, calorieDensity: string, tags: string[], suggestions: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("No user authenticated");
        return null;
    }

    const { data, error } = await supabase
        .from('behavior_logs')
        .insert({
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            foods,
            mood,
            calorie_density: calorieDensity,
            tags,
            suggestions
        })
        .select()
        .single();

    if (error) {
        console.error("Error saving reality log:", error);
        throw error;
    }

    return data;
};

export const getRealityLogs = async (userId: string, date: string) => {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('behavior_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
};
