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
export function useSugarLogs(
    supabase: SupabaseClient,
    userId: string | undefined,
    options: UseSugarLogsOptions = {}
): UseSugarLogsResult {
    const [sugarLogs, setSugarLogs] = useState<SugarLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId) {
            setSugarLogs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

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
            setSugarLogs((data as SugarLog[]) || []);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to fetch sugar logs');
        } finally {
            setLoading(false);
        }
    }, [userId, options.date, options.startDate, options.endDate]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const logSugar = useCallback(async (data: LogSugarInput): Promise<SugarLog | null> => {
        if (!userId) return null;

        const today = new Date().toISOString().split('T')[0];

        try {
            const { data: inserted, error: insertError } = await supabase
                .from('sugar_logs')
                .insert({
                    user_id: userId,
                    date: today,
                    ...data,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            const newLog = inserted as SugarLog;
            // Optimistic prepend
            setSugarLogs(prev => [newLog, ...prev]);
            return newLog;
        } catch (e: any) {
            setError(e?.message ?? 'Failed to log sugar event');
            return null;
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
