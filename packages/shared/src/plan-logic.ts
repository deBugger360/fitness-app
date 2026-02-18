import planData from './fitness_plan.json';

export { planData };

export interface ExercisePlan {
    name: string;
    targetReps: number;
    unit?: string;
    safetyTip?: string;
}

export interface PersonalizedPlan {
    day: string;
    workoutType: string;
    exercises: ExercisePlan[];
    fastingWindow: string;
    waterTarget: number;
    level: string;
    streak: number;
}

export const getBasePlanForDay = (dayName: string) => {
    const scheduleString = (planData.weekly_schedule as any)[dayName];
    let workoutType = 'Rest Day';
    let rawExercises: string[] = [];

    if (scheduleString && scheduleString !== 'rest') {
        workoutType = scheduleString;
        const knownWorkouts = Object.keys(planData.workouts);
        const matchedKey = knownWorkouts.find(key => scheduleString.startsWith(key));
        if (matchedKey) {
            rawExercises = (planData.workouts as any)[matchedKey];
        }
    }
    return { workoutType, rawExercises };
};

export const calculateWaterTarget = (weightKg: number, activityLevel: string): number => {
    let calculated = (weightKg || 75) * 0.033;
    if (activityLevel === 'active') calculated += 0.5;
    if (activityLevel === 'very_active') calculated += 1.0;
    return Math.round(calculated * 2) / 2;
};

export const calculateFastingWindow = (goals: string[] = []): string => {
    // Default base from JSON would be imported, but for logic here:
    if (goals.includes('fat_loss')) return "16:8";
    if (goals.includes('strength') || goals.includes('stamina')) return "14:10";
    return planData.profile.fasting_window || "12:12";
};

export const calculateUserLevel = (workoutCount: number, activityLevel?: string): { level: string, repMultiplier: number } => {
    let level = "Beginner";
    let repMultiplier = 1.0;

    if (workoutCount > 8 || (activityLevel === 'active' && workoutCount > 5)) {
        level = "Advanced";
        repMultiplier = 1.5;
    } else if (workoutCount > 4 || activityLevel === 'moderate') {
        level = "Intermediate";
        repMultiplier = 1.2;
    }
    return { level, repMultiplier };
};

export const mapExercises = (rawExercises: string[], repMultiplier: number): ExercisePlan[] => {
    return rawExercises.map(exName => {
        let target = 15;
        let unit = 'reps';
        let tip = "";

        const nameLower = exName.toLowerCase();

        if (nameLower.includes("pushup")) {
            target = Math.ceil(10 * repMultiplier);
            tip = "Keep core tight to protect lower back. Knees down if needed.";
        } else if (nameLower.includes("squat")) {
            target = Math.ceil(20 * repMultiplier);
            tip = "Weight in heels. Don't round your spine.";
        } else if (nameLower.includes("hollow") || nameLower.includes("plank") || nameLower.includes("wall sit")) {
            target = Math.ceil(30 * repMultiplier); // seconds
            unit = 's';
            tip = "Hold steady. Breathe evenly.";
            if (nameLower.includes("hollow")) tip = "Press lower back into floor/mat.";
        } else if (nameLower.includes("jumping") || nameLower.includes("jack")) {
            target = Math.ceil(30 * repMultiplier);
            tip = "Soft knees on landing. Step-out for low impact.";
        } else {
            target = Math.ceil(15 * repMultiplier);
            tip = "Focus on form over speed.";
        }

        return {
            name: exName,
            targetReps: target,
            unit,
            safetyTip: tip
        };
    });
};
