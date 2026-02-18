import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { MealLog } from '@repo/types';
import { validateMealInput, CreateMealInput } from '@repo/shared';

export interface UseMealsOptions {
    date?: string;
    startDate?: string;
    endDate?: string;
}

export interface UseMealsResult {
    meals: MealLog[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    /** Log a new meal or update today's entry. */
    logMeal: (data: Partial<CreateMealInput>) => Promise<MealLog | null>;
    /** Log water (green tea cups) — convenience wrapper. */
    logWater: (cups?: number) => Promise<void>;
}

/**
 * useMeals — platform-agnostic hook for fetching and logging meal data.
 *
 * Works in React DOM (web) and React Native (mobile).
 */
export function useMeals(
    supabase: SupabaseClient,
    userId: string | undefined,
    options: UseMealsOptions = {}
): UseMealsResult {
    const [meals, setMeals] = useState<MealLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId) {
            setMeals([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('meals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (options.startDate && options.endDate) {
                query = query.gte('date', options.startDate).lte('date', options.endDate);
            } else if (options.date) {
                query = query.eq('date', options.date);
            } else {
                const since = new Date();
                since.setDate(since.getDate() - 30);
                query = query.gte('date', since.toISOString().split('T')[0]);
            }

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            setMeals((data as MealLog[]) || []);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to fetch meals');
        } finally {
            setLoading(false);
        }
    }, [userId, options.date, options.startDate, options.endDate]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const logMeal = useCallback(async (data: Partial<CreateMealInput>): Promise<MealLog | null> => {
        if (!userId) return null;

        const today = new Date().toISOString().split('T')[0];
        const normalized = validateMealInput({ date: today, ...data });

        try {
            // Check for existing entry today (upsert pattern)
            const { data: existing } = await supabase
                .from('meals')
                .select('id')
                .eq('user_id', userId)
                .eq('date', normalized.date ?? today)
                .maybeSingle();

            let result;
            if (existing) {
                const { data: updated, error } = await supabase
                    .from('meals')
                    .update(normalized)
                    .eq('id', existing.id)
                    .select()
                    .single();
                if (error) throw error;
                result = updated as MealLog;
            } else {
                const { data: inserted, error } = await supabase
                    .from('meals')
                    .insert({ user_id: userId, ...normalized })
                    .select()
                    .single();
                if (error) throw error;
                result = inserted as MealLog;
            }

            // Optimistic local update
            setMeals(prev => {
                const idx = prev.findIndex(m => m.id === result.id);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = result;
                    return next;
                }
                return [result, ...prev];
            });

            return result;
        } catch (e: any) {
            setError(e?.message ?? 'Failed to log meal');
            return null;
        }
    }, [supabase, userId]);

    const logWater = useCallback(async (cups = 1) => {
        await logMeal({ green_tea_cups: cups, quality: 'healthy' });
    }, [logMeal]);

    return { meals, loading, error, refresh, logMeal, logWater };
}
