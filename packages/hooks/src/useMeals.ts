import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { MealLog } from '@repo/types';
import { validateMealInput, CreateMealInput } from '@repo/shared';
import { OfflineManager } from '@repo/lib';

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
        const offline = OfflineManager.getInstance();
        const cacheKey = `meals_${options.date || 'all'}`;

        // 1. Load from cache
        if (loading) {
            const cached = await offline.getCached<MealLog[]>(cacheKey);
            if (cached) {
                setMeals(cached);
                setLoading(false);
            }
        }

        if (!userId) {
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

            const fetchedMeals = (data as MealLog[]) || [];
            setMeals(fetchedMeals);

            // Update cache
            offline.setCache(cacheKey, fetchedMeals);
        } catch (e: any) {
            console.error('Fetch failed, using cache if available', e);
            setError(e?.message ?? 'Failed to fetch meals');
        } finally {
            setLoading(false);
        }
    }, [userId, options.date, options.startDate, options.endDate]); // Removed 'loading'

    useEffect(() => {
        refresh();
    }, [refresh]);

    const logMeal = useCallback(async (data: Partial<CreateMealInput>): Promise<MealLog | null> => {
        if (!userId) return null;

        const today = new Date().toISOString().split('T')[0];
        const normalized = validateMealInput({ date: today, ...data });

        // Optimistic object
        const optimistic: MealLog = {
            ...normalized,
            id: 'temp-' + Date.now(),
            user_id: userId,
            created_at: new Date().toISOString(),
            // Ensure required fields if missing from normalized
            date: normalized.date || today,
            green_tea_cups: normalized.green_tea_cups || 0,
            quality: normalized.quality || 'moderate',
            description: normalized.description || ''
        } as MealLog;

        // Update local state primarily by finding today's entry and merging
        setMeals(prev => {
            const idx = prev.findIndex(m => m.date === (normalized.date || today));
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...normalized };
                return next;
            }
            return [optimistic, ...prev];
        });

        try {
            // Use straightforward UPSERT which covers both Insert and Update for offline simplicity
            // This assumes Supabase table has 'user_id, date' unique constraint logic/policy
            const { data: result, error } = await supabase
                .from('meals')
                .upsert({ user_id: userId, ...normalized })
                .select()
                .single();

            if (error) throw error;

            const saved = result as MealLog;
            setMeals(prev => prev.map(m => m.date === saved.date ? saved : m));
            return saved;
        } catch (e: any) {
            console.warn('Online logMeal failed, queuing offline mutation');
            // Queue UPSERT
            OfflineManager.getInstance().queueMutation('meals', 'UPSERT', { user_id: userId, ...normalized });
            return optimistic;
        }
    }, [supabase, userId]);

    const logWater = useCallback(async (cups = 1) => {
        await logMeal({ green_tea_cups: cups, quality: 'healthy' });
    }, [logMeal]);

    return { meals, loading, error, refresh, logMeal, logWater };
}
