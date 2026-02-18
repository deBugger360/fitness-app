
import { validateNewWorkout, sanitizeWorkoutUpdate, validateMealInput } from '@repo/shared';

// ─── validateNewWorkout ───────────────────────────────────────────────────────
describe('validateNewWorkout', () => {

    it('sets morning_hiit_completed to 1 when true', () => {
        const result = validateNewWorkout({ date: '2024-01-01', morning_hiit_completed: true });
        expect(result.morning_hiit_completed).toBe(1);
    });

    it('sets morning_hiit_completed to 0 when false', () => {
        const result = validateNewWorkout({ date: '2024-01-01', morning_hiit_completed: false });
        expect(result.morning_hiit_completed).toBe(0);
    });

    it('sets morning_hiit_completed to 0 when undefined', () => {
        const result = validateNewWorkout({ date: '2024-01-01' });
        expect(result.morning_hiit_completed).toBe(0);
    });

    it('defaults notes to empty string', () => {
        const result = validateNewWorkout({ date: '2024-01-01' });
        expect(result.notes).toBe('');
    });

    it('preserves provided notes', () => {
        const result = validateNewWorkout({ date: '2024-01-01', notes: 'Great session' });
        expect(result.notes).toBe('Great session');
    });

    it('defaults exercises_completed to empty array', () => {
        const result = validateNewWorkout({ date: '2024-01-01' });
        expect(result.exercises_completed).toEqual([]);
    });

    it('uses duration_minutes as evening_walk_minutes fallback', () => {
        const result = validateNewWorkout({ date: '2024-01-01', duration_minutes: 30 });
        expect(result.evening_walk_minutes).toBe(30);
    });

    it('preserves date field', () => {
        const result = validateNewWorkout({ date: '2024-01-15' });
        expect(result.date).toBe('2024-01-15');
    });
});

// ─── sanitizeWorkoutUpdate ────────────────────────────────────────────────────
describe('sanitizeWorkoutUpdate', () => {

    it('returns empty object when no fields provided', () => {
        const result = sanitizeWorkoutUpdate({});
        expect(result).toEqual({});
    });

    it('only includes explicitly provided fields', () => {
        const result = sanitizeWorkoutUpdate({ notes: 'Updated' });
        expect(Object.keys(result)).toEqual(['notes']);
    });

    it('converts morning_hiit_completed true to 1', () => {
        const result = sanitizeWorkoutUpdate({ morning_hiit_completed: true });
        expect(result.morning_hiit_completed).toBe(1);
    });

    it('converts morning_hiit_completed false to 0', () => {
        const result = sanitizeWorkoutUpdate({ morning_hiit_completed: false });
        expect(result.morning_hiit_completed).toBe(0);
    });

    it('maps duration_minutes to evening_walk_minutes', () => {
        const result = sanitizeWorkoutUpdate({ duration_minutes: 45 });
        expect(result.evening_walk_minutes).toBe(45);
    });

    it('preserves notes when provided', () => {
        const result = sanitizeWorkoutUpdate({ notes: 'Recovery day' });
        expect(result.notes).toBe('Recovery day');
    });

    it('does not include undefined fields', () => {
        const result = sanitizeWorkoutUpdate({ notes: 'Test' });
        expect(result.morning_hiit_completed).toBeUndefined();
        expect(result.evening_walk_minutes).toBeUndefined();
    });
});

// ─── validateMealInput ────────────────────────────────────────────────────────
describe('validateMealInput', () => {

    it('defaults quality to moderate when not provided', () => {
        const result = validateMealInput({ date: '2024-01-01' });
        expect(result.quality).toBe('moderate');
    });

    it('preserves provided quality', () => {
        const result = validateMealInput({ date: '2024-01-01', quality: 'healthy' });
        expect(result.quality).toBe('healthy');
    });

    it('defaults green_tea_cups to 0', () => {
        const result = validateMealInput({ date: '2024-01-01' });
        expect(result.green_tea_cups).toBe(0);
    });

    it('preserves provided green_tea_cups', () => {
        const result = validateMealInput({ date: '2024-01-01', green_tea_cups: 3 });
        expect(result.green_tea_cups).toBe(3);
    });

    it('defaults description to empty string', () => {
        const result = validateMealInput({ date: '2024-01-01' });
        expect(result.description).toBe('');
    });

    it('preserves provided description', () => {
        const result = validateMealInput({ date: '2024-01-01', description: 'Chicken salad' });
        expect(result.description).toBe('Chicken salad');
    });

    it('preserves date field', () => {
        const result = validateMealInput({ date: '2024-01-20' });
        expect(result.date).toBe('2024-01-20');
    });

    it('handles completely empty input with defaults', () => {
        const result = validateMealInput({});
        expect(result.quality).toBe('moderate');
        expect(result.green_tea_cups).toBe(0);
        expect(result.description).toBe('');
    });
});
