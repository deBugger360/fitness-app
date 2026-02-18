
import { calculateDailyScore, calculateStreak, sugarRiskScore } from '../index';
import { DailyScore, WorkoutLog, MealLog, SugarLog, Foundation } from '@repo/types';

describe('Analytics Engine', () => {

    // Helper to create date
    const today = new Date().toISOString().split('T')[0];

    it('calculateDailyScore calculates correct score including sugar penalty', () => {
        const workouts: WorkoutLog[] = [{ id: '1', date: today, user_id: 'u1', type: 'hiit', morning_hiit_completed: true }];
        const meals: MealLog[] = [{ id: '2', date: today, user_id: 'u1', quality: 'healthy', green_tea_cups: 0 }];
        const sugarLogs: SugarLog[] = [{ id: '3', date: today, user_id: 'u1', type: 'intake', success_resisted: false }];
        const foundations: Foundation = { id: '4', date: today, user_id: 'u1', notes: { hydration: true } };

        const result = calculateDailyScore(workouts, meals, sugarLogs, foundations);

        // Expected: 30 (workout) + 30 (meal) + 20 (hydration) + ~2 (part of lifestyle) - 50 (sugar)
        // Base score = 80 + lifestyle. Let's assume just < 50 due to penalty.
        // Actually: 30+30+20 + (1/1 * 20) = 100 base. 
        // 100 - 50 = 50.
        // Wait, 'hydration' is ONE key. If foundation notes has 1 key and it is true, lifestyle is 100% of 20 = 20.
        // Total = 30+30+20+20 = 100.
        // Penalty = -50.
        // Result = 50.

        expect(result.score).toBe(50);
    });

    it('calculateStreak counts consecutive passing days', () => {
        // Mock daily scores
        const history: DailyScore[] = [
            { date: '2024-01-03', score: 80, breakdown: {} as any },
            { date: '2024-01-02', score: 90, breakdown: {} as any },
            { date: '2024-01-01', score: 40, breakdown: {} as any }, // Fail
        ];

        // NOTE: The function calculates streak backwards from "today".
        // If we mock calculateStreak to use provided history without strict "today" check for this unit test context,
        // it would be easier. But the function uses `new Date()`.
        // Ideally we mock Date, but for this simple test, we just check the logic logic of the loop.
        // Actually, the current implementation iterates `sorted` and breaks on < 60.
        // It doesn't strictly check for "yesterday" connectivity in the MVP loop (it just counts valid scores in desc order).
        // So this test expects 2.

        expect(calculateStreak(history)).toBe(2);
    });

    it('sugarRiskScore increases with cravings', () => {
        const cravings: SugarLog[] = [
            { id: '1', date: today, user_id: 'u1', type: 'craving', success_resisted: true },
            { id: '2', date: today, user_id: 'u1', type: 'craving', success_resisted: true },
            { id: '3', date: today, user_id: 'u1', type: 'craving', success_resisted: true }
        ];
        const intakes: SugarLog[] = [];

        // 3 * 10 = 30
        expect(sugarRiskScore(cravings, intakes)).toBe(30);
    });
});
