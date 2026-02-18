import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Foundation } from '@repo/shared';

export interface UseFoundationsOptions {
    date?: string;
    startDate?: string;
    endDate?: string;
}

export interface UseFoundationsResult {
    foundations: Foundation[];
    /** Today's foundation record (if date option is set). */
    today: Foundation | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    /** Upsert a foundation log for a given date. */
    saveFoundation: (
        date: string,
        completed: string[],
        notes?: Record<string, any>
    ) => Promise<Foundation | null>;
}

/**
 * useFoundations — platform-agnostic hook for fetching and saving foundation/habit logs.
 *
 * Works in React DOM (web) and React Native (mobile).
 */
export function useFoundations(
    supabase: SupabaseClient,
    userId: string | undefined,
    options: UseFoundationsOptions = {}
): UseFoundationsResult {
    const [foundations, setFoundations] = useState<Foundation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId) {
            setFoundations([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('foundations')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });

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
            setFoundations((data as Foundation[]) || []);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to fetch foundations');
        } finally {
            setLoading(false);
        }
    }, [userId, options.date, options.startDate, options.endDate]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const saveFoundation = useCallback(async (
        date: string,
        completed: string[],
        notes: Record<string, any> = {}
    ): Promise<Foundation | null> => {
        if (!userId) return null;

        const score = completed.length;

        try {
            // Check for existing record
            const { data: existing } = await supabase
                .from('foundations')
                .select('id')
                .eq('user_id', userId)
                .eq('date', date)
                .maybeSingle();

            let result: Foundation;

            if (existing) {
                const { data: updated, error } = await supabase
                    .from('foundations')
                    .update({ completed_principles: completed, notes, score })
                    .eq('id', existing.id)
                    .select()
                    .single();
                if (error) throw error;
                result = updated as Foundation;
            } else {
                const { data: inserted, error } = await supabase
                    .from('foundations')
                    .insert({ user_id: userId, date, completed_principles: completed, notes, score })
                    .select()
                    .single();
                if (error) throw error;
                result = inserted as Foundation;
            }

            // Optimistic local update
            setFoundations(prev => {
                const idx = prev.findIndex(f => f.date === date);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = result;
                    return next;
                }
                return [result, ...prev];
            });

            return result;
        } catch (e: any) {
            setError(e?.message ?? 'Failed to save foundation');
            return null;
        }
    }, [supabase, userId]);

    const today = options.date
        ? foundations.find(f => f.date === options.date) ?? null
        : null;

    return { foundations, today, loading, error, refresh, saveFoundation };
}
