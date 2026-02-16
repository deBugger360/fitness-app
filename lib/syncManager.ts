import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";

export type SyncTable = 'workouts' | 'meals' | 'sugar_logs' | 'foundations' | 'reflections';

interface SyncConfig {
    table: SyncTable;
    onUpdate: (payload: any) => void;
}

class SyncManager {
    private supabase = createClient();
    private channels: Record<string, any> = {};

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
            }, (payload) => {
                this.handleRealtimeUpdate(table, payload);
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to realtime updates for ${table}`);
                }
            });
    }

    private handleRealtimeUpdate(table: SyncTable, payload: any) {
        console.log(`Realtime update received for ${table}:`, payload);

        // Notify user of remote change
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // We could trigger a global state update here (e.g., via Context or Recoil/Zustand)
            // For now, we'll show a toast to indicate data is staying in sync
            // NOTE: In a real app, you'd want to silence self-updates to avoid double-toasting
            // But since this catches *remote* updates (e.g. phone updating tablet), it's useful.

            // Debounce or filter could be added here
        }
    }

    public cleanup() {
        Object.values(this.channels).forEach(channel => {
            this.supabase.removeChannel(channel);
        });
        this.channels = {};
    }
}

export const syncManager = new SyncManager();

export const initSyncManager = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        syncManager.init(user.id);
    }
};
