/**
 * @repo/hooks — Shared, platform-agnostic React hooks for the fitness app.
 *
 * All hooks accept a SupabaseClient as their first argument so they work
 * in both React DOM (web/Next.js) and React Native (mobile/Expo).
 *
 * Usage:
 *   import { useWorkouts, useMeals, useSugarLogs } from '@repo/hooks';
 */

export { useWorkouts } from './useWorkouts';
export type { UseWorkoutsOptions, UseWorkoutsResult } from './useWorkouts';

export { useMeals } from './useMeals';
export type { UseMealsOptions, UseMealsResult } from './useMeals';

export { useSugarLogs } from './useSugarLogs';
export type { UseSugarLogsOptions, UseSugarLogsResult, LogSugarInput } from './useSugarLogs';

export { useUserProfile } from './useUserProfile';
export type { UseUserProfileResult } from './useUserProfile';

export { useFoundations } from './useFoundations';
export type { UseFoundationsOptions, UseFoundationsResult } from './useFoundations';

export { useDailyStats } from './useDailyStats';
export type { UseDailyStatsResult } from './useDailyStats';

export { useDateRangeData } from './useDateRangeData';
export type { UseDateRangeDataResult } from './useDateRangeData';

export { useRecommendations } from './useRecommendations';
export type { UseRecommendationsResult } from './useRecommendations';

export { usePersonalizedPlan } from './usePersonalizedPlan';
export type { PersonalizedPlan, ExercisePlan } from './usePersonalizedPlan';
