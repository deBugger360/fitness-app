import { SupabaseClient } from '@supabase/supabase-js';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
export type SyncTable = 'workouts' | 'meals' | 'sugar_logs' | 'foundations' | 'reflections';

export class SyncManager {
    private static instance: SyncManager;
    private supabase: SupabaseClient | null = null;
    private listeners: ((status: SyncStatus) => void)[] = [];
    private _status: SyncStatus = 'idle';
    private channels: Record<string, any> = {};
    private onSyncCallback: ((table: string) => void) | null = null;

    private constructor() { }

    public static getInstance(): SyncManager {
        if (!SyncManager.instance) {
            SyncManager.instance = new SyncManager();
        }
        return SyncManager.instance;
    }

    public init(client: SupabaseClient, userId: string, onSync?: (table: string) => void) {
        if (!userId) return;
        this.supabase = client;
        if (onSync) this.onSyncCallback = onSync;

        console.log("Initializing Sync Manager for user:", userId);

        // Define tables to listen to
        const tables: SyncTable[] = ['workouts', 'meals', 'sugar_logs', 'foundations', 'reflections'];

        tables.forEach(table => {
            this.subscribeToTable(table, userId);
        });
    }

    public subscribe(listener: (status: SyncStatus) => void) {
        this.listeners.push(listener);
        listener(this._status); // Emit current status immediately

        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private setStatus(status: SyncStatus) {
        this._status = status;
        this.listeners.forEach(l => l(status));

        if (status === 'syncing') {
            // Revert to synced after a delay for UX
            setTimeout(() => {
                this.setStatus('synced');
            }, 2000);
        }
    }

    private subscribeToTable(table: SyncTable, userId: string) {
        if (!this.supabase) return;
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

        // Notify callback if provided (e.g. for toast or refetch)
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (this.onSyncCallback) {
                this.onSyncCallback(table);
            }
        }
    }

    public cleanup() {
        if (this.supabase) {
            Object.values(this.channels).forEach(channel => {
                this.supabase!.removeChannel(channel);
            });
        }
        this.channels = {};
        this.listeners = [];
    }
}

export const getSyncManager = () => SyncManager.getInstance();
