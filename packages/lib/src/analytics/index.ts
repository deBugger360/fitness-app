
import {
    WorkoutLog,
    MealLog,
    SugarLog,
    DailyScore
} from '@repo/types';
import { Foundation } from '@repo/shared';

// Constants for Scoring
const SCORE_WEIGHTS = {
    workout: 30,
    nutrition: 30,
    hydration: 20,
    lifestyle: 20,
};

const SUGAR_PENALTY = 50; // Heavily penalize sugar intake

/**
 * Calculates a comprehensive daily consistency score (0-100).
 * pure function: Deterministic based on inputs.
 */
export function calculateDailyScore(
    workouts: WorkoutLog[],
    meals: MealLog[],
    sugarLogs: SugarLog[],
    foundations: Foundation | null
): DailyScore {
    const today = new Date().toISOString().split('T')[0];

    // 1. Workout Component (Max 30)
    // Any workout counts as consistency.
    const workoutScore = workouts.length > 0 ? SCORE_WEIGHTS.workout : 0;

    // 2. Nutrition Component (Max 30)
    // - Healthy meal: full points
    // - Moderate meal: partial points
    // - Unhealthy meal: 0 points
    // Simplified: If avg quality is 'healthy' -> 30, 'moderate' -> 15
    let nutritionScore = 0;
    if (meals.length > 0) {
        const healthyCount = meals.filter(m => m.quality === 'healthy').length;
        const moderateCount = meals.filter(m => m.quality === 'moderate').length;
        // Simple logic: if majority healthy
        if (healthyCount >= meals.length / 2) nutritionScore = SCORE_WEIGHTS.nutrition;
        else if (moderateCount + healthyCount >= meals.length / 2) nutritionScore = SCORE_WEIGHTS.nutrition / 2;
    }

    // 3. Hydration (Max 20 - derived from meals/water logs)
    // Assuming green_tea_cups or water is tracked in meals for now or foundations
    // Note: User requested separate hydration, but schema puts it in meals or foundations. 
    // Adapting to Foundations checklist.
    let hydrationScore = 0;
    // Check foundations note for 'hydration' key being true
    // Foundations.notes is JSON Record<string, boolean>
    if (foundations?.notes && foundations.notes['hydration'] === true) {
        hydrationScore = SCORE_WEIGHTS.hydration;
    }

    // 4. Lifestyle / Sugar Penalty
    let lifestyleScore = 0;
    // Additional foundations like sleep, steps
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
            habits: lifestyleScore
        }
    };
}

/**
 * Calculates current streak based on historical data.
 * Definition of 'Active Day': Score >= 60 (Passing grade)
 */
export function calculateStreak(dailyScores: DailyScore[]): number {
    if (!dailyScores.length) return 0;

    // Sort descending by date
    const sorted = [...dailyScores].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];

    // Check if today is active
    // Allowing "streak freeze" logic? 
    // Simplified: Count backwards consecutive days >= 60 score.

    // If today has no score yet, start from yesterday? 
    // For now, strict mode.

    for (const day of sorted) {
        if (day.score >= 60) {
            streak++;
        } else {
            // Break streak
            break;
        }
    }

    return streak;
}

/**
 * Calculates sugar risk score (0-100) where 100 is high risk.
 * Based on recent cravings and intakes.
 */
export function sugarRiskScore(cravings: SugarLog[], intakes: SugarLog[]): number {
    // 1. Frequency of cravings
    const cravingCount = cravings.length;

    // 2. Frequency of slips (intakes)
    const intakeCount = intakes.length;

    // Simple heuristic
    let risk = 0;
    risk += cravingCount * 10; // 10% risk per craving
    risk += intakeCount * 40;  // 40% risk per intake

    // Capping at 100
    return Math.min(100, risk);
}

/**
 * Calculates overall consistency percentage over a time period.
 */
export function consistencyScore(dailyScores: DailyScore[]): number {
    if (dailyScores.length === 0) return 0;

    const totalPossible = dailyScores.length * 100;
    const totalActual = dailyScores.reduce((acc, curr) => acc + curr.score, 0);

    return Math.round((totalActual / totalPossible) * 100);
}
