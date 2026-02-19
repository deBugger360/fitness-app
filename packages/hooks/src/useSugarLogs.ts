import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { SugarLog } from '@repo/types';

export interface UseSugarLogsOptions {
    date?: string;
    startDate?: string;
    endDate?: string;
}

export interface LogSugarInput {
    type: 'intake' | 'craving';
    success_resisted: boolean;
    amount_grams?: number;
    trigger?: string;
    mood_context?: string;
    activity_context?: string;
    severity?: number;
}

export interface UseSugarLogsResult {
    sugarLogs: SugarLog[];
    /** Convenience: only intake events */
    intakes: SugarLog[];
    /** Convenience: only craving events */
    cravings: SugarLog[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    /** Log a sugar intake or craving event. */
    logSugar: (data: LogSugarInput) => Promise<SugarLog | null>;
}

/**
 * useSugarLogs — platform-agnostic hook for fetching and logging sugar events.
 *
 * Works in React DOM (web) and React Native (mobile).
 */
import { OfflineManager } from '@repo/lib';

export function useSugarLogs(
    supabase: SupabaseClient,
    userId: string | undefined,
    options: UseSugarLogsOptions = {}
): UseSugarLogsResult {
    const [sugarLogs, setSugarLogs] = useState<SugarLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const offline = OfflineManager.getInstance();
        const cacheKey = `sugar_logs_${options.date || 'all'}`;

        if (loading) {
            const cached = await offline.getCached<SugarLog[]>(cacheKey);
            if (cached) {
                setSugarLogs(cached);
                setLoading(false);
            }
        }

        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            let query = supabase
                .from('sugar_logs')
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

            const fetched = (data as SugarLog[]) || [];
            setSugarLogs(fetched);

            offline.setCache(cacheKey, fetched);
        } catch (e: any) {
            console.error('Fetch failed, using cache if available', e);
            setError(e?.message ?? 'Failed to fetch sugar logs');
        } finally {
            setLoading(false);
        }
    }, [userId, options.date, options.startDate, options.endDate, loading]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const logSugar = useCallback(async (data: LogSugarInput): Promise<SugarLog | null> => {
        if (!userId) return null;

        const today = new Date().toISOString().split('T')[0];
        const logData = { user_id: userId, date: today, ...data };

        // Optimistic object
        const optimistic: SugarLog = {
            id: 'temp-' + Date.now(),
            created_at: new Date().toISOString(),
            ...logData
        } as SugarLog;

        setSugarLogs(prev => [optimistic, ...prev]);

        try {
            const { data: inserted, error: insertError } = await supabase
                .from('sugar_logs')
                .insert(logData)
                .select()
                .single();

            if (insertError) throw insertError;

            const newLog = inserted as SugarLog;
            // Replace temp with real
            setSugarLogs(prev => prev.map(l => l.id === optimistic.id ? newLog : l));
            return newLog;
        } catch (e: any) {
            console.warn('Online logSugar failed, queuing offline mutation');
            OfflineManager.getInstance().queueMutation('sugar_logs', 'INSERT', logData);
            return optimistic;
        }
    }, [supabase, userId]);

    return {
        sugarLogs,
        intakes: sugarLogs.filter(s => s.type === 'intake'),
        cravings: sugarLogs.filter(s => s.type === 'craving'),
        loading,
        error,
        refresh,
        logSugar,
    };
}
