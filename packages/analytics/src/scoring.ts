import {
    WorkoutLog,
    MealLog,
    SugarLog,
    DailyScore
} from '@repo/types';
import { Foundation } from '@repo/shared';

// ─── Scoring Constants ────────────────────────────────────────────────────────

/** Weight of each component in the 0-100 daily score. */
export const SCORE_WEIGHTS = {
    workout: 30,
    nutrition: 30,
    hydration: 20,
    lifestyle: 20,
} as const;

/** Points deducted when sugar intake is logged. */
export const SUGAR_PENALTY = 50;

/** Minimum score (0-100) to count as an "active" day for streak purposes. */
export const STREAK_THRESHOLD = 60;

// ─── Daily Score ─────────────────────────────────────────────────────────────

/**
 * Calculates a comprehensive daily consistency score (0-100).
 *
 * Pure function — deterministic based on inputs, no side effects.
 *
 * Scoring breakdown:
 *  - Workout (30 pts): Any logged workout = full points.
 *  - Nutrition (30 pts): Majority-healthy meals = full; majority-moderate = half.
 *  - Hydration (20 pts): `foundations.notes.hydration === true`.
 *  - Lifestyle (20 pts): Proportion of completed foundation habits.
 *  - Sugar penalty (−50 pts): Applied if any sugar intake is logged.
 */
export function calculateDailyScore(
    workouts: WorkoutLog[],
    meals: MealLog[],
    sugarLogs: SugarLog[],
    foundations: Foundation | null
): DailyScore {
    const today = new Date().toISOString().split('T')[0];

    // 1. Workout Component (Max 30)
    const workoutScore = workouts.length > 0 ? SCORE_WEIGHTS.workout : 0;

    // 2. Nutrition Component (Max 30)
    let nutritionScore = 0;
    if (meals.length > 0) {
        const healthyCount = meals.filter(m => m.quality === 'healthy').length;
        const moderateCount = meals.filter(m => m.quality === 'moderate').length;
        if (healthyCount >= meals.length / 2) {
            nutritionScore = SCORE_WEIGHTS.nutrition;
        } else if (moderateCount + healthyCount >= meals.length / 2) {
            nutritionScore = SCORE_WEIGHTS.nutrition / 2;
        }
    }

    // 3. Hydration Component (Max 20)
    let hydrationScore = 0;
    if (foundations?.notes && foundations.notes['hydration'] === true) {
        hydrationScore = SCORE_WEIGHTS.hydration;
    }

    // 4. Lifestyle / Habits Component (Max 20)
    let lifestyleScore = 0;
    if (foundations?.notes) {
        const habits = Object.keys(foundations.notes).length;
        const completed = Object.values(foundations.notes).filter(Boolean).length;
        if (habits > 0) {
            lifestyleScore = (completed / habits) * SCORE_WEIGHTS.lifestyle;
        }
    }

    // Sugar Penalty
    const sugarIntake = sugarLogs.filter(s => s.type === 'intake').length;
    let totalScore = workoutScore + nutritionScore + hydrationScore + lifestyleScore;

    if (sugarIntake > 0) {
        totalScore = Math.max(0, totalScore - SUGAR_PENALTY);
    }

    return {
        date: today,
        score: Math.round(totalScore),
        breakdown: {
            workout: workoutScore,
            nutrition: nutritionScore,
            hydration: hydrationScore,
            sugar: sugarIntake > 0 ? -SUGAR_PENALTY : 0,
            habits: lifestyleScore,
        },
    };
}

// ─── Streak ───────────────────────────────────────────────────────────────────

/**
 * Calculates the current consecutive-day streak from a history of daily scores.
 *
 * An "active day" is defined as score >= STREAK_THRESHOLD (60).
 * Scores are sorted descending by date; the streak breaks on the first
 * day below the threshold.
 *
 * Pure function — no side effects.
 */
export function calculateStreak(dailyScores: DailyScore[]): number {
    if (!dailyScores.length) return 0;

    const sorted = [...dailyScores].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    for (const day of sorted) {
        if (day.score >= STREAK_THRESHOLD) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

// ─── Sugar Risk ───────────────────────────────────────────────────────────────

/**
 * Calculates a sugar risk score (0-100) where 100 = highest risk.
 *
 * Heuristic:
 *  - Each craving contributes 10 pts (tracked but resisted)
 *  - Each intake contributes 40 pts (actually consumed)
 *
 * Pure function — no side effects.
 */
export function sugarRiskScore(cravings: SugarLog[], intakes: SugarLog[]): number {
    let risk = 0;
    risk += cravings.length * 10;
    risk += intakes.length * 40;
    return Math.min(100, risk);
}

// ─── Consistency ─────────────────────────────────────────────────────────────

/**
 * Calculates overall consistency as a percentage over a time period.
 *
 * Formula: (sum of all scores) / (days × 100) × 100
 *
 * Pure function — no side effects.
 */
export function consistencyScore(dailyScores: DailyScore[]): number {
    if (dailyScores.length === 0) return 0;
    const totalPossible = dailyScores.length * 100;
    const totalActual = dailyScores.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round((totalActual / totalPossible) * 100);
}
