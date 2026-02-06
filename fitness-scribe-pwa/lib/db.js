import Dexie from 'dexie';

export const db = new Dexie('FitnessDB');

db.version(1).stores({
  users: '++id, name',
  workouts: '++id, date',
  meals: '++id, date',
  body_stats: '++id, date'
});

db.version(2).stores({
  workouts: '++id, date, synced'
});

db.version(3).stores({
  workouts: '++id, date, synced, user_id',
  meals: '++id, date, user_id',
  body_stats: '++id, date, user_id'
});
