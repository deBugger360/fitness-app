/**
 * @repo/analytics — canonical test suite.
 *
 * Tests run against the source in packages/analytics/src directly.
 * @repo/lib re-exports the same functions; see packages/lib/src/__tests__ for
 * the integration-facing tests that verify the re-exports still work.
 */

import {
    calculateDailyScore,
    calculateStreak,
    sugarRiskScore,
    consistencyScore,
    SCORE_WEIGHTS,
    SUGAR_PENALTY,
    STREAK_THRESHOLD,
    getHighRiskHours,
    analyzeTriggers,
    getCravingHeatmap,
} from '../index';
import { WorkoutLog, MealLog, SugarLog, DailyScore } from '@repo/types';
import { Foundation } from '@repo/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

function makeWorkout(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
    return {
        id: '1', user_id: 'u1', date: TODAY,
        morning_hiit_completed: true, type: 'hiit',
        ...overrides,
    };
}

function makeMeal(quality: 'healthy' | 'moderate' | 'unhealthy' = 'healthy'): MealLog {
    return {
        id: '1', user_id: 'u1', date: TODAY,
        green_tea_cups: 1, quality,
    };
}

function makeSugar(type: 'intake' | 'craving', overrides: Partial<SugarLog> = {}): SugarLog {
    return {
        id: '1', user_id: 'u1', date: TODAY,
        type, success_resisted: type === 'craving',
        created_at: new Date().toISOString(),
        ...overrides,
    };
}

function makeFoundation(notes: Record<string, any> = {}): Foundation {
    return { date: TODAY, notes };
}

function makeScore(date: string, score: number): DailyScore {
    return {
        date, score,
        breakdown: { workout: 0, nutrition: 0, hydration: 0, sugar: 0, habits: 0 },
    };
}

// ─── Constants ────────────────────────────────────────────────────────────────

describe('exported constants', () => {
    it('SCORE_WEIGHTS sum to 100', () => {
        const total = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
        expect(total).toBe(100);
    });

    it('SUGAR_PENALTY is 50', () => {
        expect(SUGAR_PENALTY).toBe(50);
    });

    it('STREAK_THRESHOLD is 60', () => {
        expect(STREAK_THRESHOLD).toBe(60);
    });
});

// ─── calculateDailyScore ─────────────────────────────────────────────────────

describe('calculateDailyScore', () => {
    it('returns zero score for empty inputs', () => {
        const result = calculateDailyScore([], [], [], null);
        expect(result.score).toBe(0);
        expect(result.date).toBe(TODAY);
    });

    it('awards workout component (30) for any logged workout', () => {
        const result = calculateDailyScore([makeWorkout()], [], [], null);
        expect(result.breakdown.workout).toBe(30);
        expect(result.score).toBe(30);
    });

    it('awards full nutrition (30) when majority meals are healthy', () => {
        const meals = [makeMeal('healthy'), makeMeal('healthy'), makeMeal('unhealthy')];
        const result = calculateDailyScore([], meals, [], null);
        expect(result.breakdown.nutrition).toBe(30);
    });

    it('awards half nutrition (15) when majority are moderate', () => {
        const meals = [makeMeal('moderate'), makeMeal('moderate'), makeMeal('unhealthy')];
        const result = calculateDailyScore([], meals, [], null);
        expect(result.breakdown.nutrition).toBe(15);
    });

    it('awards zero nutrition for all-unhealthy meals', () => {
        const meals = [makeMeal('unhealthy'), makeMeal('unhealthy')];
        const result = calculateDailyScore([], meals, [], null);
        expect(result.breakdown.nutrition).toBe(0);
    });

    it('awards hydration (20) when foundation.notes.hydration is true', () => {
        const result = calculateDailyScore([], [], [], makeFoundation({ hydration: true }));
        expect(result.breakdown.hydration).toBe(20);
    });

    it('awards zero hydration when foundation.notes.hydration is false', () => {
        const result = calculateDailyScore([], [], [], makeFoundation({ hydration: false }));
        expect(result.breakdown.hydration).toBe(0);
    });

    it('calculates lifestyle score proportionally from completed habits', () => {
        // 2 out of 4 habits = 50% × 20 = 10
        const foundation = makeFoundation({ a: true, b: true, c: false, d: false });
        const result = calculateDailyScore([], [], [], foundation);
        expect(result.breakdown.habits).toBe(10);
    });

    it('applies SUGAR_PENALTY of 50 when sugar intake is present', () => {
        const fullScore = calculateDailyScore([makeWorkout()], [makeMeal()], [], makeFoundation({ hydration: true }));
        const withSugar = calculateDailyScore([makeWorkout()], [makeMeal()], [makeSugar('intake')], makeFoundation({ hydration: true }));
        expect(withSugar.breakdown.sugar).toBe(-50);
        expect(withSugar.score).toBe(Math.max(0, fullScore.score - 50));
    });

    it('clamps total score to 0 when penalty exceeds points', () => {
        const result = calculateDailyScore([], [], [makeSugar('intake')], null);
        expect(result.score).toBe(0);
    });

    it('cravings (type=craving) do NOT trigger sugar penalty', () => {
        const result = calculateDailyScore([], [], [makeSugar('craving')], null);
        expect(result.breakdown.sugar).toBe(0);
    });

    it('returns score as an integer (Math.round applied)', () => {
        // 1 of 3 habits = 33.33% × 20 = 6.666…
        const f = makeFoundation({ a: true, b: false, c: false });
        const result = calculateDailyScore([], [], [], f);
        expect(Number.isInteger(result.score)).toBe(true);
    });
});

// ─── calculateStreak ──────────────────────────────────────────────────────────

describe('calculateStreak', () => {
    it('returns 0 for empty history', () => {
        expect(calculateStreak([])).toBe(0);
    });

    it('counts consecutive passing days from most recent', () => {
        const history = [
            makeScore('2024-01-03', 80),
            makeScore('2024-01-02', 70),
            makeScore('2024-01-01', 40), // fail — breaks streak
        ];
        expect(calculateStreak(history)).toBe(2);
    });

    it('breaks at first failing day regardless of order in input', () => {
        const history = [
            makeScore('2024-01-01', 80),
            makeScore('2024-01-03', 70),
            makeScore('2024-01-02', 30), // fail
        ];
        // sorted desc: 03(70), 02(30 - break), 01(80)
        expect(calculateStreak(history)).toBe(1);
    });

    it('returns 0 when the most recent day is failing', () => {
        const history = [makeScore('2024-01-03', 20)];
        expect(calculateStreak(history)).toBe(0);
    });

    it('returns count of all days when all pass', () => {
        const history = [
            makeScore('2024-01-01', 100),
            makeScore('2024-01-02', 90),
            makeScore('2024-01-03', 75),
        ];
        expect(calculateStreak(history)).toBe(3);
    });
});

// ─── sugarRiskScore ───────────────────────────────────────────────────────────

describe('sugarRiskScore', () => {
    it('returns 0 with no logs', () => {
        expect(sugarRiskScore([], [])).toBe(0);
    });

    it('gives 10 pts per craving', () => {
        const cravings = [makeSugar('craving'), makeSugar('craving'), makeSugar('craving')];
        expect(sugarRiskScore(cravings, [])).toBe(30);
    });

    it('gives 40 pts per intake', () => {
        const intakes = [makeSugar('intake'), makeSugar('intake')];
        expect(sugarRiskScore([], intakes)).toBe(80);
    });

    it('combines craving and intake contributions', () => {
        const cravings = [makeSugar('craving')];
        const intakes = [makeSugar('intake')];
        expect(sugarRiskScore(cravings, intakes)).toBe(50);
    });

    it('caps at 100 regardless of log count', () => {
        const intakes = Array(10).fill(makeSugar('intake'));
        expect(sugarRiskScore([], intakes)).toBe(100);
    });
});

// ─── consistencyScore ────────────────────────────────────────────────────────

describe('consistencyScore', () => {
    it('returns 0 for empty history', () => {
        expect(consistencyScore([])).toBe(0);
    });

    it('returns 100 when all days have score 100', () => {
        const history = [makeScore('2024-01-01', 100), makeScore('2024-01-02', 100)];
        expect(consistencyScore(history)).toBe(100);
    });

    it('returns 50 when all days average 50', () => {
        const history = [makeScore('2024-01-01', 50), makeScore('2024-01-02', 50)];
        expect(consistencyScore(history)).toBe(50);
    });

    it('calculates correctly with mixed scores', () => {
        // (80 + 60 + 40) / 300 = 60%
        const history = [
            makeScore('2024-01-01', 80),
            makeScore('2024-01-02', 60),
            makeScore('2024-01-03', 40),
        ];
        expect(consistencyScore(history)).toBe(60);
    });
});

// ─── getHighRiskHours ────────────────────────────────────────────────────────

describe('getHighRiskHours', () => {
    it('returns empty array for no logs', () => {
        expect(getHighRiskHours([])).toEqual([]);
    });

    it('counts logs by hour and returns descending', () => {
        const logs = [
            makeSugar('craving', { created_at: '2024-01-01T14:00:00Z' }),
            makeSugar('craving', { created_at: '2024-01-01T14:30:00Z' }),
            makeSugar('craving', { created_at: '2024-01-01T09:00:00Z' }),
        ];
        const result = getHighRiskHours(logs);
        expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
    });

    it('skips logs with no created_at', () => {
        const logs = [makeSugar('craving', { created_at: undefined })];
        expect(getHighRiskHours(logs)).toEqual([]);
    });
});

// ─── analyzeTriggers ──────────────────────────────────────────────────────────

describe('analyzeTriggers', () => {
    it('returns empty arrays for no logs', () => {
        const result = analyzeTriggers([]);
        expect(result.topTriggers).toEqual([]);
        expect(result.topMoods).toEqual([]);
    });

    it('counts triggers correctly, sorted descending', () => {
        const logs = [
            makeSugar('craving', { trigger: 'Stress' }),
            makeSugar('craving', { trigger: 'Stress' }),
            makeSugar('craving', { trigger: 'Boredom' }),
        ];
        const { topTriggers } = analyzeTriggers(logs);
        expect(topTriggers[0][0]).toBe('Stress');
        expect(topTriggers[0][1]).toBe(2);
    });

    it('skips logs missing trigger or mood_context', () => {
        const logs = [makeSugar('craving', { trigger: undefined, mood_context: undefined })];
        const result = analyzeTriggers(logs);
        expect(result.topTriggers).toEqual([]);
        expect(result.topMoods).toEqual([]);
    });
});

// ─── getCravingHeatmap ────────────────────────────────────────────────────────

describe('getCravingHeatmap', () => {
    it('returns 7 entries (one per day of week)', () => {
        expect(getCravingHeatmap([])).toHaveLength(7);
    });

    it('all counts are 0 for empty input', () => {
        const result = getCravingHeatmap([]);
        expect(result.every(d => d.count === 0)).toBe(true);
    });

    it('increments the correct day bucket', () => {
        // 2024-01-07 is a Sunday (day 0)
        const logs = [makeSugar('craving', { created_at: '2024-01-07T12:00:00Z' })];
        const result = getCravingHeatmap(logs);
        expect(result.find(d => d.day === 'Sun')!.count).toBe(1);
    });

    it('has the correct day labels', () => {
        const result = getCravingHeatmap([]);
        const days = result.map(d => d.day);
        expect(days).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });

    it('skips logs without created_at', () => {
        const logs = [makeSugar('craving', { created_at: undefined })];
        const result = getCravingHeatmap(logs);
        expect(result.every(d => d.count === 0)).toBe(true);
    });
});
