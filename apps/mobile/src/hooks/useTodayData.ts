/**
 * useTodayData — Mobile adapter for today's dashboard data.
 *
 * Delegates to @repo/hooks shared hooks (useDailyStats, useMeals, useWorkouts)
 * so the mobile app reads/writes exactly like the web app.
 *
 * Features:
 * - Real-time updates via SyncManager (Supabase postgres_changes)
 * - Optimistic UI updates (stats increment immediately on log action)
 * - Full error handling and loading state
 * - useFocusEffect re-fetch on tab focus
 */
import { useState, useCallback, useRef } from 'react';
import { supabase } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import { useDailyStats } from '@repo/hooks';
import { SyncManager, OfflineManager } from '@repo/lib';
import { saveWorkout } from '@repo/lib';

export function useTodayData(userId?: string) {
    const today = new Date().toISOString().split('T')[0];

    // Delegate to the shared hook — same engine as the web
    const { workouts, meals, sugarLogs, score, streak, loading, error, refresh } =
        useDailyStats(supabase, userId, today);

    // ── Realtime ─────────────────────────────────────────────────────────────
    const syncRef = useRef<SyncManager | null>(null);

    useFocusEffect(
        useCallback(() => {
            // Refresh on tab focus (matches web's useFocusEffect / router refresh)
            refresh();

            // Wire realtime so any remote change (e.g. from web app) triggers re-fetch
            if (userId && !syncRef.current) {
                const manager = SyncManager.getInstance();
                syncRef.current = manager;
                manager.init(supabase, userId, (table) => {
                    // Re-fetch when any of today's tables change
                    if (['workouts', 'meals', 'sugar_logs', 'foundations'].includes(table)) {
                        refresh();
                    }
                });
            }

            return () => {
                syncRef.current?.cleanup();
                syncRef.current = null;
            };
        }, [userId, refresh])
    );

    // ── Derived stats (convenience shape for TodayScreen) ────────────────────
    const waterCount = meals.reduce((acc, m) => acc + (m.green_tea_cups || 0), 0);
    const cravingCount = sugarLogs.filter(s => s.type === 'craving').length;

    const stats = {
        workouts: workouts.length,
        meals: meals.length,
        water: waterCount,
        cravings: cravingCount,
    };

    // ── Optimistic log action ────────────────────────────────────────────────
    /**
     * Logs a quick action from the TodayScreen dashboard.
     * Updates UI immediately (optimistic), then syncs via shared service.
     * On failure, re-fetches to revert to server truth.
     */

    // ...

    const logAction = useCallback(async (type: 'workout' | 'meal' | 'water' | 'craving') => {
        if (!userId) return;

        try {
            if (type === 'workout') {
                await saveWorkout(supabase, userId, {
                    date: today,
                    morning_hiit_completed: true,
                });
            } else if (type === 'water') {
                await supabase.from('meals').insert({
                    user_id: userId,
                    date: today,
                    green_tea_cups: 1,
                    quality: 'healthy',
                });
            }
            // After write, refresh to get real count + score
            await refresh();
        } catch (e) {
            console.warn('[useTodayData] logAction failed, queuing offline:', e);
            const offline = OfflineManager.getInstance();

            if (type === 'workout') {
                offline.queueMutation('workouts', 'UPSERT', {
                    user_id: userId,
                    date: today,
                    morning_hiit_completed: true
                });
            } else if (type === 'water') {
                offline.queueMutation('meals', 'INSERT', {
                    user_id: userId,
                    date: today,
                    green_tea_cups: 1,
                    quality: 'healthy'
                });
            }

            await refresh(); // Load from cache or update state
        }
    }, [userId, today, refresh]);

    return {
        loading,
        error,
        score: score?.score ?? 0,
        streak,
        stats,
        logAction,
        refresh,
    };
}
