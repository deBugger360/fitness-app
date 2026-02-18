
import { calculateRecommendations } from '@repo/shared';
import { WorkoutLog, MealLog, SugarLog } from '@repo/types';
import { Foundation } from '@repo/shared';

// ─── Fixtures ────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const FOUR_DAYS_AGO = new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0];

const makeWorkout = (date = TODAY, overrides: Partial<WorkoutLog> = {}): WorkoutLog => ({
    id: 'w1', date, user_id: 'u1', type: 'hiit',
    morning_hiit_completed: true, ...overrides
});

const makeMeal = (overrides: Partial<MealLog> = {}): MealLog => ({
    id: 'm1', date: TODAY, user_id: 'u1', quality: 'healthy',
    green_tea_cups: 2, ...overrides
});

const makeSugar = (overrides: Partial<SugarLog> = {}): SugarLog => ({
    id: 's1', date: TODAY, user_id: 'u1', type: 'craving',
    success_resisted: true, ...overrides
});

const makeFoundation = (notes: Record<string, any> = {}): Foundation => ({
    id: 'f1', date: TODAY, user_id: 'u1', notes
});

// ─── calculateRecommendations ─────────────────────────────────────────────────
describe('calculateRecommendations', () => {

    describe('Workout recommendations', () => {

        it('recommends "Start Strong" when no workouts exist', () => {
            const recs = calculateRecommendations([], [], [], null);
            const ids = recs.map(r => r.id);
            expect(ids).toContain('workout_start');
        });

        it('"Start Strong" has high priority', () => {
            const recs = calculateRecommendations([], [], [], null);
            const rec = recs.find(r => r.id === 'workout_start');
            expect(rec?.priority).toBe('high');
        });

        it('recommends "Get Back on Track" when last workout was 3+ days ago', () => {
            const recs = calculateRecommendations([makeWorkout(FOUR_DAYS_AGO)], [], [], null);
            const ids = recs.map(r => r.id);
            expect(ids).toContain('workout_missed');
        });

        it('recommends "Ready for More?" when 3+ recent workouts and last was recent', () => {
            const workouts = [
                makeWorkout(TODAY, { id: 'w1' }),
                makeWorkout(YESTERDAY, { id: 'w2' }),
                makeWorkout(YESTERDAY, { id: 'w3' }),
            ];
            const recs = calculateRecommendations(workouts, [], [], null);
            const ids = recs.map(r => r.id);
            expect(ids).toContain('workout_boost');
        });
    });

    describe('Hydration recommendations', () => {

        it('recommends hydration boost when average tea cups < 1', () => {
            const meals = [makeMeal({ green_tea_cups: 0 })];
            const recs = calculateRecommendations([], meals, [], null);
            const ids = recs.map(r => r.id);
            expect(ids).toContain('hydration-boost');
        });

        it('does NOT recommend hydration boost when average >= 1', () => {
            const meals = [makeMeal({ green_tea_cups: 2 })];
            const recs = calculateRecommendations([], meals, [], null);
            const ids = recs.map(r => r.id);
            expect(ids).not.toContain('hydration-boost');
        });

        it('recommends hydration boost when no meals logged', () => {
            // averageTea = 0 / 1 = 0 < 1
            const recs = calculateRecommendations([], [], [], null);
            const ids = recs.map(r => r.id);
            expect(ids).toContain('hydration-boost');
        });
    });

    describe('Sugar recommendations', () => {

        it('recommends "Sugar Watch" when more than 2 intakes', () => {
            const sugarLogs = [
                makeSugar({ id: 's1', type: 'intake', success_resisted: false }),
                makeSugar({ id: 's2', type: 'intake', success_resisted: false }),
                makeSugar({ id: 's3', type: 'intake', success_resisted: false }),
            ];
            const recs = calculateRecommendations([], [], sugarLogs, null);
            const ids = recs.map(r => r.id);
            expect(ids).toContain('sugar-alert');
        });

        it('does NOT recommend "Sugar Watch" for exactly 2 intakes', () => {
            const sugarLogs = [
                makeSugar({ id: 's1', type: 'intake' }),
                makeSugar({ id: 's2', type: 'intake' }),
            ];
            const recs = calculateRecommendations([], [], sugarLogs, null);
            const ids = recs.map(r => r.id);
            expect(ids).not.toContain('sugar-alert');
        });

        it('recommends "Willpower Warrior" when 4+ cravings resisted', () => {
            const sugarLogs = Array.from({ length: 4 }, (_, i) =>
                makeSugar({ id: `s${i}`, type: 'craving', success_resisted: true })
            );
            const recs = calculateRecommendations([], [], sugarLogs, null);
            const ids = recs.map(r => r.id);
            expect(ids).toContain('sugar-win');
        });

        it('"Willpower Warrior" has low priority', () => {
            const sugarLogs = Array.from({ length: 4 }, (_, i) =>
                makeSugar({ id: `s${i}`, type: 'craving', success_resisted: true })
            );
            const recs = calculateRecommendations([], [], sugarLogs, null);
            const rec = recs.find(r => r.id === 'sugar-win');
            expect(rec?.priority).toBe('low');
        });
    });

    describe('Sleep / Recovery recommendations', () => {

        it('recommends recovery mode when sleep < 6 hours', () => {
            const foundations = [makeFoundation({ sleep_quality: 'Hours: 5' })];
            const recs = calculateRecommendations([], [], [], foundations);
            const ids = recs.map(r => r.id);
            expect(ids).toContain('recovery_mode');
        });

        it('does NOT recommend recovery mode when sleep >= 6 hours', () => {
            const foundations = [makeFoundation({ sleep_quality: 'Hours: 7' })];
            const recs = calculateRecommendations([], [], [], foundations);
            const ids = recs.map(r => r.id);
            expect(ids).not.toContain('recovery_mode');
        });

        it('does NOT recommend recovery mode when sleep_quality note is absent', () => {
            const foundations = [makeFoundation({ hydration: true })];
            const recs = calculateRecommendations([], [], [], foundations);
            const ids = recs.map(r => r.id);
            expect(ids).not.toContain('recovery_mode');
        });
    });

    describe('Sorting / Priority', () => {

        it('returns an array', () => {
            const recs = calculateRecommendations([], [], [], null);
            expect(Array.isArray(recs)).toBe(true);
        });

        it('high priority recommendations appear before low priority', () => {
            const sugarLogs = Array.from({ length: 4 }, (_, i) =>
                makeSugar({ id: `s${i}`, type: 'craving', success_resisted: true })
            );
            const recs = calculateRecommendations([], [], sugarLogs, null);
            const priorities = recs.map(r => r.priority);
            const firstLowIndex = priorities.indexOf('low');
            const lastHighIndex = priorities.lastIndexOf('high');
            if (firstLowIndex !== -1 && lastHighIndex !== -1) {
                expect(lastHighIndex).toBeLessThan(firstLowIndex);
            }
        });

        it('each recommendation has required fields', () => {
            const recs = calculateRecommendations([], [], [], null);
            recs.forEach(rec => {
                expect(rec).toHaveProperty('id');
                expect(rec).toHaveProperty('title');
                expect(rec).toHaveProperty('message');
                expect(rec).toHaveProperty('priority');
                expect(rec).toHaveProperty('category');
                expect(['high', 'medium', 'low']).toContain(rec.priority);
            });
        });
    });
});
