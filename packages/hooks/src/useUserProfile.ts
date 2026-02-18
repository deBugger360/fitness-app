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
export function useUserProfile(
    supabase: SupabaseClient,
    userId: string | undefined
): UseUserProfileResult {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!userId) {
            setProfile(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (fetchError) throw fetchError;
            setProfile(data as UserProfile);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
        if (!userId) return null;

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
            return updated;
        } catch (e: any) {
            setError(e?.message ?? 'Failed to update profile');
            return null;
        }
    }, [supabase, userId]);

    return { profile, loading, error, refresh, updateProfile };
}
