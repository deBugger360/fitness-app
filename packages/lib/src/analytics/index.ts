/**
 * @repo/lib/analytics — backward-compatibility re-export.
 *
 * The scoring engine now lives in @repo/analytics.
 * This file re-exports everything so that existing imports:
 *
 *   import { calculateDailyScore } from '@repo/lib';
 *
 * continue to work without any changes to the callers.
 *
 * New code should import directly from '@repo/analytics'.
 */
export {
    calculateDailyScore,
    calculateStreak,
    sugarRiskScore,
    consistencyScore,
    SCORE_WEIGHTS,
    SUGAR_PENALTY,
    STREAK_THRESHOLD,
} from '@repo/analytics';
