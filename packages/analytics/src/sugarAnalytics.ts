import { SugarLog } from '@repo/types';

// ─── High-Risk Hours ──────────────────────────────────────────────────────────

/**
 * Identifies high-risk hours based on sugar log timestamps.
 *
 * Returns an array of { hour, count } sorted by frequency (descending).
 * Hours with no logs are omitted.
 *
 * Pure function — no side effects.
 */
export function getHighRiskHours(logs: SugarLog[]): { hour: number; count: number }[] {
    const hourCounts: Record<number, number> = {};

    logs.forEach(log => {
        if (!log.created_at) return;
        const hour = new Date(log.created_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour, 10), count }))
        .sort((a, b) => b.count - a.count);
}

// ─── Trigger Analysis ─────────────────────────────────────────────────────────

/**
 * Analyses triggers and moods associated with sugar cravings.
 *
 * Returns sorted arrays of [label, count] tuples for the top triggers
 * and top moods.
 *
 * Pure function — no side effects.
 */
export function analyzeTriggers(logs: SugarLog[]): {
    topTriggers: [string, number][];
    topMoods: [string, number][];
} {
    const triggerCounts: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};

    logs.forEach(log => {
        if (log.trigger) {
            triggerCounts[log.trigger] = (triggerCounts[log.trigger] || 0) + 1;
        }
        if (log.mood_context) {
            moodCounts[log.mood_context] = (moodCounts[log.mood_context] || 0) + 1;
        }
    });

    return {
        topTriggers: Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]),
        topMoods: Object.entries(moodCounts).sort((a, b) => b[1] - a[1]),
    };
}

// ─── Craving Heatmap ─────────────────────────────────────────────────────────

export interface HeatmapDay {
    day: string;
    count: number;
    label: string;
}

/**
 * Generates a day-of-week craving heatmap from sugar logs.
 *
 * Returns an array of 7 entries (Sun–Sat) with craving counts.
 * Uses `created_at` for timezone-accurate day assignment.
 *
 * Pure function — no side effects.
 */
export function getCravingHeatmap(logs: SugarLog[]): HeatmapDay[] {
    const dayCounts = Array(7).fill(0);

    logs.forEach(log => {
        if (!log.created_at) return;
        const day = new Date(log.created_at).getDay();
        dayCounts[day]++;
    });

    return [
        { day: 'Sun', count: dayCounts[0], label: 'S' },
        { day: 'Mon', count: dayCounts[1], label: 'M' },
        { day: 'Tue', count: dayCounts[2], label: 'T' },
        { day: 'Wed', count: dayCounts[3], label: 'W' },
        { day: 'Thu', count: dayCounts[4], label: 'T' },
        { day: 'Fri', count: dayCounts[5], label: 'F' },
        { day: 'Sat', count: dayCounts[6], label: 'S' },
    ];
}
