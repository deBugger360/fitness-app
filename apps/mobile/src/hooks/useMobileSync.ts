import { useEffect, useRef } from 'react';
import { SyncManager, SyncStatus } from '@repo/lib';
import { supabase } from '../context/AuthProvider';

/**
 * useMobileSync — initialises the shared SyncManager for the mobile app.
 *
 * Pass an `onSync` callback to react to incoming realtime changes
 * (e.g. trigger a data refresh or show a local notification).
 *
 * Usage:
 *   useMobileSync(user?.id, (table) => refresh());
 */
export function useMobileSync(
    userId: string | undefined,
    onSync?: (table: string) => void
) {
    const managerRef = useRef<SyncManager | null>(null);

    useEffect(() => {
        if (!userId) return;

        const manager = SyncManager.getInstance();
        managerRef.current = manager;

        manager.init(supabase, userId, (table) => {
            console.log(`[MobileSync] Realtime update on: ${table}`);
            onSync?.(table);
        });

        return () => {
            manager.cleanup();
        };
    }, [userId]);

    return managerRef.current;
}
