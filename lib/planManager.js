import planData from '../fitness_plan.json';

export function getTodayWorkout() {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayIndex = new Date().getDay();
  const dayName = days[todayIndex];

  const scheduleString = planData.weekly_schedule[dayName];
  
  // Schedule string format example: "HIIT_A + walk" or "rest"
  // We need to extract the workout key (e.g., "HIIT_A")
  let exercises = [];
  let workoutType = 'Rest Day';

  if (scheduleString && scheduleString !== 'rest') {
    workoutType = scheduleString;
    // Attempt to match the start of the string with a known workout key
    const knownWorkouts = Object.keys(planData.workouts);
    const matchedKey = knownWorkouts.find(key => scheduleString.startsWith(key));
    
    if (matchedKey) {
      exercises = planData.workouts[matchedKey];
    }
  }

  return {
    day: dayName,
    workoutType,
    exercises,
    fastingWindow: planData.profile.fasting_window,
    waterTarget: planData.profile.water_liters_per_day
  };
}
