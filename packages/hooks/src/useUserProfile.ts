import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile } from '@repo/types';

export interface UseUserProfileResult {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    /** Partial update — only sends changed fields. */
    updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
}

/**
 * useUserProfile — platform-agnostic hook for reading and updating the user profile.
 *
 * Works in React DOM (web) and React Native (mobile).
 *
 * @example
 * const { profile, updateProfile } = useUserProfile(supabase, userId);
 */
import { OfflineManager } from '@repo/lib';

export function useUserProfile(
    supabase: SupabaseClient,
    userId: string | undefined
): UseUserProfileResult {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        const offline = OfflineManager.getInstance();
        const cacheKey = `user_profile`;

        if (loading) {
            const cached = await offline.getCached<UserProfile>(cacheKey);
            if (cached) {
                setProfile(cached);
                setLoading(false);
            }
        }

        if (!userId) {
            setProfile(null);
            setLoading(false);
            return;
        }

        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (fetchError) throw fetchError;

            const fetchedProfile = data as UserProfile;
            setProfile(fetchedProfile);

            offline.setCache(cacheKey, fetchedProfile);
        } catch (e: any) {
            console.error('Fetch failed, using cache if available', e);
            setError(e?.message ?? 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    }, [userId, loading]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
        if (!userId) return null;

        // Optimistic update
        const optimistic = { ...profile, ...updates } as UserProfile;
        setProfile(optimistic);

        try {
            const { data, error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (updateError) throw updateError;

            const updated = data as UserProfile;
            setProfile(updated);

            OfflineManager.getInstance().setCache(`user_profile`, updated);

            return updated;
        } catch (e: any) {
            console.warn('Online updateProfile failed, queuing offline mutation');
            OfflineManager.getInstance().queueMutation('profiles', 'UPDATE', { id: userId, ...updates });
            // Cache the optimistic version so next reload shows it
            OfflineManager.getInstance().setCache(`user_profile`, optimistic);
            return optimistic;
        }
    }, [supabase, userId, profile]);

    return { profile, loading, error, refresh, updateProfile };
}
