"use client";

import { createClient } from "@/utils/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { SyncManager as SharedSyncManager, SyncTable, SyncStatus } from "@repo/lib";

export type { SyncTable };

// Web-specific singleton wrapper around the shared SyncManager
class WebSyncManager {
    private static instance: WebSyncManager;
    private sharedManager: SharedSyncManager;

    private constructor() {
        this.sharedManager = SharedSyncManager.getInstance();
    }

    public static getInstance(): WebSyncManager {
        if (!WebSyncManager.instance) {
            WebSyncManager.instance = new WebSyncManager();
        }
        return WebSyncManager.instance;
    }

    public init(userId: string) {
        const supabase = createClient();

        // Pass the web client and a custom callback for toast notifications
        this.sharedManager.init(supabase, userId, (table: string) => {
            const tableName = table.replace('_', ' ');
            toast({
                title: "Data Synced",
                description: `New ${tableName.slice(0, -1)} data received from cloud.`,
            });
        });
    }

    public subscribe(listener: (status: SyncStatus) => void) {
        return this.sharedManager.subscribe(listener);
    }

    public cleanup() {
        this.sharedManager.cleanup();
    }
}

// Export a centralized getter function
export function getSyncManager() {
    return WebSyncManager.getInstance();
}

export const initSyncManager = async () => {
    const manager = getSyncManager();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        manager.init(user.id);
    }
};
