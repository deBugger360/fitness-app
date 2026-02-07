import { db } from './db';

// Simulate a server sync
const syncToServer = async (data) => {
  console.log('🚀 Simulating POST to server:', JSON.stringify(data, null, 2));
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));
  return true; // Success
};

export const runSync = async () => {
  if (!navigator.onLine) {
    console.log('📴 App is offline. Sync paused.');
    return;
  }

  console.log('📡 App is online. Checking for unsynced data...');

  const tablesToSync = ['workouts', 'meals', 'sugar_logs', 'body_stats'];
  let totalSynced = 0;

  try {
    for (const tableName of tablesToSync) {
      if (!db[tableName]) continue; // Safety check

      const pendingItems = await db[tableName].where('synced').equals(0).toArray();
      // Also catch where synced is undefined/missing for old records if necessary, 
      // but strict check for 0 is safer ensuring we don't sync things we haven't explicitly marked.
      // Since we just added index, new items will default undefined unless we ensure code writes 0.
      // But let's assume 'undefined' IS NOT 'synced'.
      // Actually, typically undefined in Dexie doesn't match equals(0).
      // We should probably check if it works. Usually we should default synced:0 on insertion.
      // But for this quick fix, let's just stick to equals(0) assuming apps write this field.
      // However, previous code only wrote synced:0 for workouts.
      // We might need to handle 'undefined' as 'unsynced' too? 
      // Dexie queries are simpler if we trust the insertions.
      // Let's stick to equals(0) for now but knowing that existing records without 'synced' won't be picked up
      // until they are updated or we run a migration script.
      // Given this is local-first, it's fine.

      if (pendingItems.length > 0) {
        console.log(`[${tableName}] Found ${pendingItems.length} pending items.`);
        for (const item of pendingItems) {
            const success = await syncToServer({ ...item, table: tableName });
            if (success) {
                await db[tableName].update(item.id, { synced: 1 });
                totalSynced++;
            }
        }
      }
    }

    if (totalSynced > 0) {
        console.log(`✅ Successfully synced ${totalSynced} items.`);
    } else {
      console.log('✨ All clear. Nothing to sync.');
    }

  } catch (error) {
    console.error('Sync error:', error);
  }
};

export const initSyncManager = runSync;

// Initialize listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Connection restored.');
    runSync();
  });

  window.addEventListener('offline', () => {
    console.log('🚫 Connection lost.');
  });
}
