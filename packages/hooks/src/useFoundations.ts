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
import { OfflineManager } from '@repo/lib';

export function useFoundations(
    supabase: SupabaseClient,
    userId: string | undefined,
    options: UseFoundationsOptions = {}
): UseFoundationsResult {
    const [foundations, setFoundations] = useState<Foundation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const offline = OfflineManager.getInstance();
        const cacheKey = `foundations_${options.date || 'all'}`;

        if (loading) {
            const cached = await offline.getCached<Foundation[]>(cacheKey);
            if (cached) {
                setFoundations(cached);
                setLoading(false);
            }
        }

        if (!userId) {
            setLoading(false);
            return;
        }

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

            const fetched = (data as Foundation[]) || [];
            setFoundations(fetched);

            offline.setCache(cacheKey, fetched);
        } catch (e: any) {
            console.error('Fetch failed, using cache if available', e);
            setError(e?.message ?? 'Failed to fetch foundations');
        } finally {
            setLoading(false);
        }
    }, [userId, options.date, options.startDate, options.endDate, loading]);

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
        const foundationData = {
            user_id: userId,
            date,
            completed_principles: completed,
            notes,
            score
        };

        // Optimistic update
        const optimistic: Foundation = {
            id: 'temp-' + Date.now(),
            created_at: new Date().toISOString(),
            ...foundationData
        } as Foundation;

        setFoundations(prev => {
            const idx = prev.findIndex(f => f.date === date);
            if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...foundationData };
                return next;
            }
            return [optimistic, ...prev];
        });

        try {
            const { data: result, error } = await supabase
                .from('foundations')
                .upsert(foundationData)
                .select()
                .single();

            if (error) throw error;

            const saved = result as Foundation;
            setFoundations(prev => prev.map(f => f.date === date ? saved : f));
            return saved;
        } catch (e: any) {
            console.warn('Online saveFoundation failed, queuing offline mutation');
            OfflineManager.getInstance().queueMutation('foundations', 'UPSERT', foundationData);
            return optimistic;
        }
    }, [supabase, userId]);

    const today = options.date
        ? foundations.find(f => f.date === options.date) ?? null
        : null;

    return { foundations, today, loading, error, refresh, saveFoundation };
}
