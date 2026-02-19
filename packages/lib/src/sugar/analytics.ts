/**
 * @repo/lib/sugar/analytics — backward-compatibility re-export.
 *
 * Sugar analytics now lives in @repo/analytics.
 * This file re-exports everything so that existing imports:
 *
 *   import { getHighRiskHours } from '@repo/lib';
 *
 * continue to work without any changes to the callers.
 *
 * New code should import directly from '@repo/analytics'.
 */
export {
    getHighRiskHours,
    analyzeTriggers,
    getCravingHeatmap,
} from '@repo/analytics';

export type { HeatmapDay } from '@repo/analytics';
