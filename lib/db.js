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

db.version(4).stores({
  workouts: '++id, date, synced, user_id, morning_hiit_completed, evening_walk_minutes',
  meals: '++id, date, user_id',
  body_stats: '++id, date, user_id'
});

db.version(5).stores({
  sugar_logs: '++id, date, user_id, type, is_late_night',
  workouts: '++id, date, synced, user_id, morning_hiit_completed, evening_walk_minutes',
  meals: '++id, date, user_id',
  body_stats: '++id, date, user_id'
});

db.version(6).stores({
  sugar_logs: '++id, date, user_id, type, is_late_night, synced',
  workouts: '++id, date, synced, user_id, morning_hiit_completed, evening_walk_minutes',
  meals: '++id, date, user_id, synced',
  body_stats: '++id, date, user_id, synced'
});

db.version(7).stores({
  users: '++id, name, gender, activity_level' // goals & photo stored as non-indexed props
});

db.version(8).stores({
  diet_reflections: '++id, date, user_id, quality, synced' // quality: 'healthy' | 'moderate' | 'unhealthy'
});
