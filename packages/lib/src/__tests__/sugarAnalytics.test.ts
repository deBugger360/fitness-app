
import { getHighRiskHours, analyzeTriggers, getCravingHeatmap } from '../sugar/analytics';
import { SugarLog } from '@repo/types';

const TODAY = new Date().toISOString().split('T')[0];

const makeSugar = (overrides: Partial<SugarLog> = {}): SugarLog => ({
    id: 's1', date: TODAY, user_id: 'u1', type: 'craving',
    success_resisted: true, ...overrides
});

// ─── getHighRiskHours ─────────────────────────────────────────────────────────
describe('getHighRiskHours', () => {

    it('returns empty array for no logs', () => {
        expect(getHighRiskHours([])).toEqual([]);
    });

    it('ignores logs without created_at', () => {
        const logs = [makeSugar({ created_at: undefined })];
        expect(getHighRiskHours(logs)).toEqual([]);
    });

    it('groups logs by hour correctly', () => {
        const logs = [
            makeSugar({ id: 's1', created_at: '2024-01-01T14:00:00Z' }),
            makeSugar({ id: 's2', created_at: '2024-01-01T14:30:00Z' }),
            makeSugar({ id: 's3', created_at: '2024-01-01T09:00:00Z' }),
        ];
        const result = getHighRiskHours(logs);
        // Hour 14 has 2 logs, hour 9 has 1 — sorted descending
        expect(result[0].count).toBe(2);
        expect(result[1].count).toBe(1);
    });

    it('returns results sorted by count descending', () => {
        const logs = [
            makeSugar({ id: 's1', created_at: '2024-01-01T08:00:00Z' }),
            makeSugar({ id: 's2', created_at: '2024-01-01T20:00:00Z' }),
            makeSugar({ id: 's3', created_at: '2024-01-01T20:30:00Z' }),
            makeSugar({ id: 's4', created_at: '2024-01-01T20:45:00Z' }),
        ];
        const result = getHighRiskHours(logs);
        expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
    });
});

// ─── analyzeTriggers ──────────────────────────────────────────────────────────
describe('analyzeTriggers', () => {

    it('returns empty arrays for no logs', () => {
        const result = analyzeTriggers([]);
        expect(result.topTriggers).toEqual([]);
        expect(result.topMoods).toEqual([]);
    });

    it('ignores logs without trigger or mood', () => {
        const logs = [makeSugar({ trigger: undefined, mood_context: undefined })];
        const result = analyzeTriggers(logs);
        expect(result.topTriggers).toEqual([]);
        expect(result.topMoods).toEqual([]);
    });

    it('counts triggers correctly', () => {
        const logs = [
            makeSugar({ id: 's1', trigger: 'stress' }),
            makeSugar({ id: 's2', trigger: 'stress' }),
            makeSugar({ id: 's3', trigger: 'boredom' }),
        ];
        const result = analyzeTriggers(logs);
        expect(result.topTriggers[0]).toEqual(['stress', 2]);
        expect(result.topTriggers[1]).toEqual(['boredom', 1]);
    });

    it('counts moods correctly', () => {
        const logs = [
            makeSugar({ id: 's1', mood_context: 'anxious' }),
            makeSugar({ id: 's2', mood_context: 'happy' }),
            makeSugar({ id: 's3', mood_context: 'anxious' }),
        ];
        const result = analyzeTriggers(logs);
        expect(result.topMoods[0]).toEqual(['anxious', 2]);
    });

    it('sorts triggers by frequency descending', () => {
        const logs = [
            makeSugar({ id: 's1', trigger: 'boredom' }),
            makeSugar({ id: 's2', trigger: 'stress' }),
            makeSugar({ id: 's3', trigger: 'stress' }),
            makeSugar({ id: 's4', trigger: 'stress' }),
        ];
        const result = analyzeTriggers(logs);
        expect(result.topTriggers[0][0]).toBe('stress');
        expect(result.topTriggers[0][1]).toBe(3);
    });
});

// ─── getCravingHeatmap ────────────────────────────────────────────────────────
describe('getCravingHeatmap', () => {

    it('returns 7 days always', () => {
        const result = getCravingHeatmap([]);
        expect(result).toHaveLength(7);
    });

    it('all counts are 0 for empty logs', () => {
        const result = getCravingHeatmap([]);
        result.forEach(day => expect(day.count).toBe(0));
    });

    it('increments correct day of week', () => {
        // 2024-01-01 is a Monday (day index 1)
        const logs = [
            makeSugar({ id: 's1', created_at: '2024-01-01T10:00:00Z' }),
            makeSugar({ id: 's2', created_at: '2024-01-01T15:00:00Z' }),
        ];
        const result = getCravingHeatmap(logs);
        const monday = result.find(d => d.day === 'Mon');
        expect(monday?.count).toBe(2);
    });

    it('ignores logs without created_at', () => {
        const logs = [makeSugar({ created_at: undefined })];
        const result = getCravingHeatmap(logs);
        result.forEach(day => expect(day.count).toBe(0));
    });

    it('has correct day labels', () => {
        const result = getCravingHeatmap([]);
        const days = result.map(d => d.day);
        expect(days).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });
});
