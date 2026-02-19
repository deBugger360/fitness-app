import { SupabaseClient } from '@supabase/supabase-js';

export interface StorageAdapter {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
}

export type MutationOperation = 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT';

export interface QueuedMutation {
    id: string; // unique ID for the mutation
    table: string;
    operation: MutationOperation;
    data: any;
    timestamp: number;
    synced: boolean;
}

export class OfflineManager {
    private static instance: OfflineManager;
    private storage: StorageAdapter | null = null;
    private supabase: SupabaseClient | null = null;
    private userId: string | null = null;
    private queue: QueuedMutation[] = [];
    private isProcessing = false;

    private constructor() { }

    public static getInstance(): OfflineManager {
        if (!OfflineManager.instance) {
            OfflineManager.instance = new OfflineManager();
        }
        return OfflineManager.instance;
    }

    public async init(storage: StorageAdapter, supabase: SupabaseClient, userId: string) {
        this.storage = storage;
        this.supabase = supabase;
        this.userId = userId;
        console.log('[OfflineManager] Initialized for user:', userId);
        await this.loadQueue();
        this.processQueue(); // Try processing immediately on init
    }

    // ─── Cache Management ────────────────────────────────────────────────────────

    private getUserKey(key: string): string {
        return `user:${this.userId}:${key}`;
    }

    public async getCached<T>(key: string): Promise<T | null> {
        if (!this.storage || !this.userId) return null;
        try {
            const json = await this.storage.getItem(this.getUserKey(key));
            return json ? JSON.parse(json) : null;
        } catch (e) {
            console.error('[OfflineManager] Failed to get cache:', e);
            return null;
        }
    }

    public async setCache<T>(key: string, data: T): Promise<void> {
        if (!this.storage || !this.userId) return;
        try {
            await this.storage.setItem(this.getUserKey(key), JSON.stringify(data));
        } catch (e) {
            console.error('[OfflineManager] Failed to set cache:', e);
        }
    }

    // ─── Mutation Queue ──────────────────────────────────────────────────────────

    private async loadQueue() {
        if (!this.storage) return;
        try {
            const json = await this.storage.getItem(this.getUserKey('mutation_queue'));
            if (json) {
                this.queue = JSON.parse(json);
                console.log(`[OfflineManager] Loaded ${this.queue.length} pending mutations`);
            }
        } catch (e) {
            console.error('[OfflineManager] Failed to load queue:', e);
        }
    }

    private async saveQueue() {
        if (!this.storage) return;
        try {
            await this.storage.setItem(this.getUserKey('mutation_queue'), JSON.stringify(this.queue));
        } catch (e) {
            console.error('[OfflineManager] Failed to save queue:', e);
        }
    }

    public async queueMutation(table: string, operation: MutationOperation, data: any) {
        const mutation: QueuedMutation = {
            id: Math.random().toString(36).substr(2, 9),
            table,
            operation,
            data,
            timestamp: Date.now(),
            synced: false
        };

        this.queue.push(mutation);
        await this.saveQueue();
        console.log(`[OfflineManager] Queued ${operation} on ${table}`);

        // Attempt to sync immediately
        this.processQueue();
    }

    public async processQueue() {
        if (this.isProcessing || this.queue.length === 0 || !this.supabase) return;

        this.isProcessing = true;
        console.log('[OfflineManager] Processing queue...');

        const failed: QueuedMutation[] = [];
        const succeededIds: string[] = [];

        for (const mutation of this.queue) {
            try {
                const { table, operation, data } = mutation;
                let error = null;

                // Handle composite keys or specifics if needed, generically assuming 'id' or data structure
                // Assuming simple INSERT/UPDATE for now. For DELETE, usually need ID.

                if (operation === 'INSERT') {
                    const { error: e } = await this.supabase.from(table).insert(data);
                    error = e;
                } else if (operation === 'UPSERT') {
                    const { error: e } = await this.supabase.from(table).upsert(data);
                    error = e;
                } else if (operation === 'UPDATE') {
                    // Update requires ID. Data should contain it.
                    if (!data.id) throw new Error('Update requires ID');
                    const { id, ...updates } = data;
                    const { error: e } = await this.supabase.from(table).update(updates).eq('id', id);
                    error = e;
                } else if (operation === 'DELETE') {
                    // Delete requires ID
                    if (!data.id) throw new Error('Delete requires ID');
                    const { error: e } = await this.supabase.from(table).delete().eq('id', data.id);
                    error = e;
                }

                if (error) {
                    throw error;
                }

                succeededIds.push(mutation.id);
            } catch (e) {
                console.error(`[OfflineManager] Sync failed via mutation ${mutation.id}:`, e);
                failed.push(mutation);
                // If network error, stop processing rest of queue to preserve order? 
                // Usually yes, but simplified here to retry next time.
                // Stopping loop on failure is safer for ordered mutations.
                this.isProcessing = false;
                // Save simplified queue (removed succeeded)
                this.queue = [...failed, ...this.queue.filter(m => !succeededIds.includes(m.id) && !failed.includes(m))]; // Logic slightly flawed if we stop early

                // Better: keep queue intact, just remove succeeded ones so far
                this.queue = this.queue.filter(m => !succeededIds.includes(m.id));
                await this.saveQueue();
                return;
            }
        }

        // All succeeded
        this.queue = [];
        await this.saveQueue();
        this.isProcessing = false;
        console.log('[OfflineManager] Queue processed successfully');
    }
}
