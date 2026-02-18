/**
 * @repo/analytics — Shared, pure-TypeScript analytics engine.
 *
 * Works in any JavaScript environment: Node.js, React DOM, React Native.
 * No platform-specific imports. No side effects.
 *
 * Usage:
 *   import {
 *     calculateDailyScore,
 *     calculateStreak,
 *     sugarRiskScore,
 *     consistencyScore,
 *     getHighRiskHours,
 *     analyzeTriggers,
 *     getCravingHeatmap,
 *   } from '@repo/analytics';
 */

// Scoring engine
export {
    calculateDailyScore,
    calculateStreak,
    sugarRiskScore,
    consistencyScore,
    SCORE_WEIGHTS,
    SUGAR_PENALTY,
    STREAK_THRESHOLD,
} from './scoring';

// Sugar-specific analytics
export {
    getHighRiskHours,
    analyzeTriggers,
    getCravingHeatmap,
} from './sugarAnalytics';

export type { HeatmapDay } from './sugarAnalytics';
