
import { calculateDailyScore, calculateStreak, sugarRiskScore, consistencyScore } from '../analytics/index';
import { DailyScore, WorkoutLog, MealLog, SugarLog } from '@repo/types';
import { Foundation } from '@repo/shared';

// ─── Fixtures ────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];

const makeWorkout = (overrides: Partial<WorkoutLog> = {}): WorkoutLog => ({
    id: 'w1', date: TODAY, user_id: 'u1', type: 'hiit',
    morning_hiit_completed: true, ...overrides
});

const makeMeal = (overrides: Partial<MealLog> = {}): MealLog => ({
    id: 'm1', date: TODAY, user_id: 'u1', quality: 'healthy',
    green_tea_cups: 0, ...overrides
});

const makeSugar = (overrides: Partial<SugarLog> = {}): SugarLog => ({
    id: 's1', date: TODAY, user_id: 'u1', type: 'craving',
    success_resisted: true, ...overrides
});

const makeFoundation = (notes: Record<string, boolean> = {}): Foundation => ({
    id: 'f1', date: TODAY, user_id: 'u1', notes
});

// ─── calculateDailyScore ─────────────────────────────────────────────────────
describe('calculateDailyScore', () => {

    it('returns 0 for empty inputs', () => {
        const result = calculateDailyScore([], [], [], null);
        expect(result.score).toBe(0);
        expect(result.breakdown.workout).toBe(0);
        expect(result.breakdown.nutrition).toBe(0);
    });

    it('awards 30 points for any workout', () => {
        const result = calculateDailyScore([makeWorkout()], [], [], null);
        expect(result.breakdown.workout).toBe(30);
    });

    it('does NOT double-award workout points for multiple workouts', () => {
        const result = calculateDailyScore(
            [makeWorkout({ id: 'w1' }), makeWorkout({ id: 'w2' })],
            [], [], null
        );
        expect(result.breakdown.workout).toBe(30);
    });

    it('awards 30 nutrition points when majority of meals are healthy', () => {
        const result = calculateDailyScore(
            [],
            [makeMeal({ quality: 'healthy' }), makeMeal({ id: 'm2', quality: 'healthy' })],
            [], null
        );
        expect(result.breakdown.nutrition).toBe(30);
    });

    it('awards 15 nutrition points when majority are moderate', () => {
        const result = calculateDailyScore(
            [],
            [makeMeal({ quality: 'moderate' }), makeMeal({ id: 'm2', quality: 'unhealthy' })],
            [], null
        );
        expect(result.breakdown.nutrition).toBe(15);
    });

    it('awards 0 nutrition points for unhealthy meals', () => {
        const result = calculateDailyScore(
            [],
            [makeMeal({ quality: 'unhealthy' })],
            [], null
        );
        expect(result.breakdown.nutrition).toBe(0);
    });

    it('awards 20 hydration points when foundation has hydration: true', () => {
        const result = calculateDailyScore([], [], [], makeFoundation({ hydration: true }));
        expect(result.breakdown.hydration).toBe(20);
    });

    it('awards 0 hydration points when hydration is false', () => {
        const result = calculateDailyScore([], [], [], makeFoundation({ hydration: false }));
        expect(result.breakdown.hydration).toBe(0);
    });

    it('calculates lifestyle score proportionally from foundation notes', () => {
        // 2 of 4 habits completed = 50% of 20 = 10
        const result = calculateDailyScore([], [], [], makeFoundation({
            hydration: true, sleep: false, steps: true, mindfulness: false
        }));
        expect(result.breakdown.habits).toBe(10);
    });

    it('applies -50 sugar penalty for any intake log', () => {
        const result = calculateDailyScore(
            [makeWorkout()],
            [makeMeal()],
            [makeSugar({ type: 'intake', success_resisted: false })],
            makeFoundation({ hydration: true })
        );
        expect(result.breakdown.sugar).toBe(-50);
        // 30 + 30 + 20 + 20 = 100 - 50 = 50
        expect(result.score).toBe(50);
    });

    it('does NOT apply sugar penalty for cravings (only intakes)', () => {
        const result = calculateDailyScore(
            [makeWorkout()],
            [],
            [makeSugar({ type: 'craving' })],
            null
        );
        expect(result.breakdown.sugar).toBe(0);
        expect(result.score).toBe(30);
    });

    it('clamps score to 0 minimum even with heavy penalty', () => {
        const result = calculateDailyScore(
            [],
            [],
            [makeSugar({ type: 'intake' })],
            null
        );
        expect(result.score).toBe(0);
    });

    it('returns a date field matching today', () => {
        const result = calculateDailyScore([], [], [], null);
        expect(result.date).toBe(TODAY);
    });

    it('full perfect day scores 100', () => {
        const result = calculateDailyScore(
            [makeWorkout()],
            [makeMeal({ quality: 'healthy' })],
            [],
            makeFoundation({ hydration: true, sleep: true, steps: true, mindfulness: true })
        );
        // 30 + 30 + 20 + 20 = 100
        expect(result.score).toBe(100);
    });
});

// ─── calculateStreak ─────────────────────────────────────────────────────────
describe('calculateStreak', () => {

    it('returns 0 for empty history', () => {
        expect(calculateStreak([])).toBe(0);
    });

    it('counts consecutive passing days (>= 60)', () => {
        const history: DailyScore[] = [
            { date: '2024-01-03', score: 80, breakdown: {} as any },
            { date: '2024-01-02', score: 90, breakdown: {} as any },
            { date: '2024-01-01', score: 40, breakdown: {} as any }, // fails
        ];
        expect(calculateStreak(history)).toBe(2);
    });

    it('breaks streak at first failing day', () => {
        const history: DailyScore[] = [
            { date: '2024-01-04', score: 70, breakdown: {} as any },
            { date: '2024-01-03', score: 55, breakdown: {} as any }, // fails — streak breaks here
            { date: '2024-01-02', score: 90, breakdown: {} as any },
            { date: '2024-01-01', score: 80, breakdown: {} as any },
        ];
        expect(calculateStreak(history)).toBe(1);
    });

    it('returns full count when all days pass', () => {
        const history: DailyScore[] = [
            { date: '2024-01-03', score: 100, breakdown: {} as any },
            { date: '2024-01-02', score: 75, breakdown: {} as any },
            { date: '2024-01-01', score: 60, breakdown: {} as any },
        ];
        expect(calculateStreak(history)).toBe(3);
    });

    it('treats score of exactly 60 as passing', () => {
        const history: DailyScore[] = [
            { date: '2024-01-01', score: 60, breakdown: {} as any },
        ];
        expect(calculateStreak(history)).toBe(1);
    });

    it('treats score of 59 as failing', () => {
        const history: DailyScore[] = [
            { date: '2024-01-01', score: 59, breakdown: {} as any },
        ];
        expect(calculateStreak(history)).toBe(0);
    });
});

// ─── sugarRiskScore ───────────────────────────────────────────────────────────
describe('sugarRiskScore', () => {

    it('returns 0 with no logs', () => {
        expect(sugarRiskScore([], [])).toBe(0);
    });

    it('adds 10 per craving', () => {
        const cravings = [makeSugar(), makeSugar({ id: 's2' }), makeSugar({ id: 's3' })];
        expect(sugarRiskScore(cravings, [])).toBe(30);
    });

    it('adds 40 per intake', () => {
        const intakes = [makeSugar({ type: 'intake' }), makeSugar({ id: 's2', type: 'intake' })];
        expect(sugarRiskScore([], intakes)).toBe(80);
    });

    it('combines cravings and intakes', () => {
        const cravings = [makeSugar()]; // 10
        const intakes = [makeSugar({ id: 's2', type: 'intake' })]; // 40
        expect(sugarRiskScore(cravings, intakes)).toBe(50);
    });

    it('caps at 100', () => {
        const intakes = Array.from({ length: 5 }, (_, i) =>
            makeSugar({ id: `s${i}`, type: 'intake' })
        ); // 5 * 40 = 200
        expect(sugarRiskScore([], intakes)).toBe(100);
    });
});

// ─── consistencyScore ────────────────────────────────────────────────────────
describe('consistencyScore', () => {

    it('returns 0 for empty history', () => {
        expect(consistencyScore([])).toBe(0);
    });

    it('returns 100 for all perfect days', () => {
        const history: DailyScore[] = [
            { date: '2024-01-01', score: 100, breakdown: {} as any },
            { date: '2024-01-02', score: 100, breakdown: {} as any },
        ];
        expect(consistencyScore(history)).toBe(100);
    });

    it('returns 50 for half-score days', () => {
        const history: DailyScore[] = [
            { date: '2024-01-01', score: 50, breakdown: {} as any },
            { date: '2024-01-02', score: 50, breakdown: {} as any },
        ];
        expect(consistencyScore(history)).toBe(50);
    });

    it('averages mixed scores correctly', () => {
        const history: DailyScore[] = [
            { date: '2024-01-01', score: 80, breakdown: {} as any },
            { date: '2024-01-02', score: 60, breakdown: {} as any },
        ];
        // (80 + 60) / 200 = 70%
        expect(consistencyScore(history)).toBe(70);
    });
});
