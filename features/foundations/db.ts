import { createClient } from "@/utils/supabase/client";
import { FOUNDATION_PRINCIPLES } from "./constants";

export const getFoundations = async (userId: string, date: string) => {
    const supabase = createClient();
    const { data } = await supabase
        .from('foundations')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();
    return data;
};

export const getWeeklyFoundations = async (userId: string, startDate: string, endDate: string) => {
    const supabase = createClient();
    const { data } = await supabase
        .from('foundations')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });
    return data || [];
};

export const saveFoundationLog = async (userId: string, date: string, completed: string[], notes: Record<string, string>) => {
    const supabase = createClient();
    const score = completed.length;

    // Check if exists
    const { data: existing } = await supabase
        .from('foundations')
        .select('id')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

    if (existing) {
        return await supabase
            .from('foundations')
            .update({ completed_principles: completed, notes, score })
            .eq('id', existing.id);
    } else {
        return await supabase
            .from('foundations')
            .insert({ user_id: userId, date, completed_principles: completed, notes, score });
    }
};
