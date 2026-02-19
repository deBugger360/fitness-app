import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { generateRecommendations } from '@repo/lib';
import { Recommendation } from '@repo/shared';

export interface UseRecommendationsResult {
    recommendations: Recommendation[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useRecommendations(
    supabase: SupabaseClient,
    userId: string | undefined
): UseRecommendationsResult {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId) {
            setRecommendations([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await generateRecommendations(supabase, userId);
            setRecommendations(data);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to generate recommendations');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { recommendations, loading, error, refresh };
}
