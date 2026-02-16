export interface DailyScore {
    date: string;
    totalScore: number;
    breakdown: {
        diet: number;      // max 40
        movement: number;  // max 25
        sleep: number;     // max 20
        sugar: number;     // max 15
    };
    missedSignals: string[];
}

export const WEIGHTS = {
    DIET: 40,
    MOVEMENT: 25,
    SLEEP: 20,
    SUGAR: 15
};

export function calculateDailyScore(
    date: string,
    workouts: any[],
    sugar: any[],
    meals: any[],
    foundations: any[]
): DailyScore {
    const dayWorkouts = workouts.filter(w => w.date === date);
    const daySugar = sugar.filter(s => s.date === date);
    const dayMeal = meals.find(m => m.date === date);
    const dayFoundation = foundations.find(f => f.date === date);

    let dietScore = 0;
    let movementScore = 0;
    let sleepScore = 0;
    let sugarScore = 0;
    const missedSignals: string[] = [];

    // 1. Diet (40pts)
    // Logic: If IF compliant (+20), Water Goal Met (+10), Protein Target Met (+10) 
    // Simplified for now based on available data:
    if (dayMeal?.if_compliant) dietScore += 20;
    else missedSignals.push("Fasting window missed");

    if ((dayMeal?.water_liters || 0) >= 3) dietScore += 10;
    else missedSignals.push("Water target missed");

    // Assuming if meal log exists, they tracked = partial credit? 
    // For now, let's just give remaining 10 if they logged meals.
    if (dayMeal) dietScore += 10;

    // 2. Movement (25pts)
    // Logic: Workout logged (+25)
    // Or: Steps/Morning HIIT (+10), Main Workout (+15)
    const hasHIIT = dayWorkouts.some(w => w.morning_hiit_completed);
    const hasMainWorkout = dayWorkouts.some(w => w.exercisesCompleted && w.exercisesCompleted.length > 0);

    if (hasMainWorkout) movementScore += 25;
    else if (hasHIIT) movementScore += 10;

    if (movementScore === 0) missedSignals.push("No movement logged");

    // 3. Sleep (20pts)
    // Logic: Rely on Foundations log 'sleep_7hrs' + 'no_phone_bed' 
    // If not in foundations, maybe we default to 0 to encourage logging.
    const completedPrinciples = dayFoundation?.completed_principles || [];
    if (completedPrinciples.includes('sleep_7hrs')) sleepScore += 10;
    else missedSignals.push("Short sleep");

    if (completedPrinciples.includes('no_phone_bed')) sleepScore += 10;
    // else missedSignals.push("Phone in bed"); // Maybe too minor for "Missed Signals" list

    // 4. Sugar (15pts)
    // Logic: No sugar intake logs (+15). 
    // If intake log exists, 0. If craving resisted, full points? 
    // Let's say: If NO 'intake' logs = 15.
    const sugarIntakes = daySugar.filter(s => s.type === 'intake');
    if (sugarIntakes.length === 0) sugarScore += 15;
    else missedSignals.push("Sugar consumed");

    const total = dietScore + movementScore + sleepScore + sugarScore;

    return {
        date,
        totalScore: Math.round(total),
        breakdown: {
            diet: dietScore,
            movement: movementScore,
            sleep: sleepScore,
            sugar: sugarScore
        },
        missedSignals
    };
}
