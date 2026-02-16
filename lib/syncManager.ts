"use client";

import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";

export type SyncTable = 'workouts' | 'meals' | 'sugar_logs' | 'foundations' | 'reflections';

class SyncManager {
    private static instance: SyncManager;
    private supabase;
    private listeners: ((status: 'idle' | 'syncing' | 'synced' | 'error') => void)[] = [];
    private _status: 'idle' | 'syncing' | 'synced' | 'error' = 'idle';
    private channels: Record<string, any> = {};

    private constructor() {
        this.supabase = createClient();
    }

    public static getInstance(): SyncManager {
        if (!SyncManager.instance) {
            SyncManager.instance = new SyncManager();
        }
        return SyncManager.instance;
    }

    public subscribe(listener: (status: 'idle' | 'syncing' | 'synced' | 'error') => void) {
        this.listeners.push(listener);
        listener(this._status); // Emit current status immediately

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private setStatus(status: 'idle' | 'syncing' | 'synced' | 'error') {
        this._status = status;
        this.listeners.forEach(l => l(status));

        if (status === 'syncing') {
            // Revert to synced after a delay for UX
            setTimeout(() => {
                this.setStatus('synced');
            }, 2000);
        }
    }

    public init(userId: string) {
        if (!userId) return;
        console.log("Initializing Sync Manager for user:", userId);

        // Define tables to listen to
        const tables: SyncTable[] = ['workouts', 'meals', 'sugar_logs', 'foundations', 'reflections'];

        tables.forEach(table => {
            this.subscribeToTable(table, userId);
        });
    }

    private subscribeToTable(table: SyncTable, userId: string) {
        if (this.channels[table]) return; // Already subscribed

        this.channels[table] = this.supabase
            .channel(`public:${table}:${userId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: table,
                filter: `user_id=eq.${userId}`
            }, (payload: any) => {
                this.handleRealtimeUpdate(table, payload);
            })
            .subscribe((status: any) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to realtime updates for ${table}`);
                }
            });
    }

    private handleRealtimeUpdate(table: SyncTable, payload: any) {
        console.log(`Realtime update received for ${table}:`, payload);
        this.setStatus('syncing');

        // Notify user of remote change
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const tableName = table.replace('_', ' ');
            toast({
                title: "Data Synced",
                description: `New ${tableName.slice(0, -1)} data received from cloud.`,
            });
        }
    }

    public cleanup() {
        Object.values(this.channels).forEach(channel => {
            this.supabase.removeChannel(channel);
        });
        this.channels = {};
        this.listeners = [];
    }
}

export const syncManager = SyncManager.getInstance();

export const initSyncManager = async () => {
    const manager = SyncManager.getInstance();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        manager.init(user.id);
    }
};
