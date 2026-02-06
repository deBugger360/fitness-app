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

  try {
    // Check for workouts where synced is 0 (false)
    // We use 0/1 for boolean indexing often in IndexedDB, but Dexie handles booleans too if consistent.
    // We will assume 0 = false, 1 = true for indexable integers.
    const unsyncedWorkouts = await db.workouts.where('synced').equals(0).toArray();

    if (unsyncedWorkouts.length > 0) {
      console.log(`Found ${unsyncedWorkouts.length} pending items.`);
      
      for (const workout of unsyncedWorkouts) {
        const success = await syncToServer(workout);
        if (success) {
          await db.workouts.update(workout.id, { synced: 1 });
          console.log(`✅ Workout ${workout.id} synced successfully.`);
        }
      }
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
