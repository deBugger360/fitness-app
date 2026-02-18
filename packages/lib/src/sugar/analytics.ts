
import { SugarLog } from '@repo/types';

/**
 * Identify high-risk hours based on log timestamps.
 * Returns an array of hours (0-23) sorted by frequency of cravings.
 */
export function getHighRiskHours(logs: SugarLog[]): { hour: number; count: number }[] {
    const hourCounts: Record<number, number> = {};

    logs.forEach(log => {
        if (!log.created_at) return;
        const date = new Date(log.created_at);
        const hour = date.getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count); // Descending
}

/**
 * Analyze triggers and moods associated with cravings.
 */
export function analyzeTriggers(logs: SugarLog[]) {
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
        topMoods: Object.entries(moodCounts).sort((a, b) => b[1] - a[1])
    };
}

/**
 * Generate a simple heatmap data structure: Day of Week -> Intensity (count)
 */
export function getCravingHeatmap(logs: SugarLog[]) {
    // 0 = Sunday, 1 = Monday ...
    const dayCounts = Array(7).fill(0);

    logs.forEach(log => {
        if (!log.created_at) return; // Fallback to date string if needed, but created_at is strictly safer for TZ
        const date = new Date(log.created_at);
        const day = date.getDay();
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
