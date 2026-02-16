"use client";

import React, { useState } from 'react';
import { Check, Trophy } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";

interface WorkoutCardProps {
    currentUserId: string | null;
    workoutType: string;
    exercises: any[];
    onSave?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ currentUserId, workoutType, exercises, onSave }) => {
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
    const [eveningWalkMinutes, setEveningWalkMinutes] = useState(0);
    const [morningSaved, setMorningSaved] = useState(false);
    const [eveningSaved, setEveningSaved] = useState(false);

    // Load existing data
    React.useEffect(() => {
        if (!currentUserId) return;
        const loadToday = async () => {
            const supabase = createClient();
            const today = new Date().toISOString().split('T')[0];
            try {
                const { data: existing } = await supabase
                    .from('workouts')
                    .select('*')
                    .eq('date', today)
                    .eq('user_id', currentUserId)
                    .single();

                if (existing) {
                    if (existing.exercises_completed) {
                        setCompletedExercises(new Set(existing.exercises_completed));
                    }
                    if (existing.evening_walk_minutes) {
                        setEveningWalkMinutes(existing.evening_walk_minutes);
                    }

                    // Determine saved states
                    if (existing.morning_hiit_completed === 1) setMorningSaved(true);
                    if (existing.evening_walk_minutes > 0) setEveningSaved(true);
                }
            } catch (error) {
                console.error("Error loading workout:", error);
            }
        };
        loadToday();
    }, [currentUserId]);

    const toggleExercise = (exercise: string) => {
        const newCompleted = new Set(completedExercises);
        if (newCompleted.has(exercise)) {
            newCompleted.delete(exercise);
        } else {
            newCompleted.add(exercise);
        }
        setCompletedExercises(newCompleted);
        setMorningSaved(false); // Valid modification unlocks save button
    };

    const saveMorningHiit = async () => {
        if (!currentUserId) return;
        const today = new Date().toISOString().split('T')[0];
        const exercisesList = Array.from(completedExercises);

        // Logic: specific exercises checked + explicitly saving = done
        const isHiitDone = exercisesList.length > 0;

        try {
            const supabase = createClient();
            const { data: existing } = await supabase
                .from('workouts')
                .select('*')
                .eq('date', today)
                .eq('user_id', currentUserId)
                .single();

            const payload: any = {
                user_id: currentUserId,
                date: today,
                morning_hiit_completed: isHiitDone ? 1 : 0,
                exercises_completed: exercisesList
            };

            if (existing) {
                await supabase.from('workouts').update(payload).eq('id', existing.id);
            } else {
                await supabase.from('workouts').insert({ ...payload, evening_walk_minutes: 0, synced: 0 });
            }

            setMorningSaved(true);
            if (onSave) onSave();
        } catch (error) {
            console.error("Failed to save morning hiit:", error);
        }
    };

    const saveEveningCardio = async () => {
        if (!currentUserId) return;
        const today = new Date().toISOString().split('T')[0];

        try {
            const supabase = createClient();
            const { data: existing } = await supabase
                .from('workouts')
                .select('*')
                .eq('date', today)
                .eq('user_id', currentUserId)
                .single();

            const payload: any = {
                user_id: currentUserId,
                date: today,
                evening_walk_minutes: eveningWalkMinutes
            };

            if (existing) {
                await supabase.from('workouts').update(payload).eq('id', existing.id);
            } else {
                await supabase.from('workouts').insert({ ...payload, morning_hiit_completed: 0, exercises_completed: [], synced: 0 });
            }

            setEveningSaved(true);
            if (onSave) onSave();
        } catch (error) {
            console.error("Failed to save evening cardio:", error);
        }
    };

    if (!exercises || exercises.length === 0) {
        return (
            <div className="p-6 bg-green-50 rounded-2xl text-center border border-green-100">
                <p className="text-green-700 font-medium">Rest Day! 🎉</p>
                <p className="text-green-600 text-sm mt-1">Take it easy and recover.</p>
            </div>
        );
    }

    return (
        <div className="mb-10 space-y-8">
            {/* Morning HIIT Section */}
            <div className={`bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-xl shadow-slate-100 dark:shadow-none border transition-colors duration-300 relative overflow-hidden ${morningSaved ? 'border-green-200 dark:border-green-900/50' : 'border-slate-50 dark:border-slate-800'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 dark:bg-yellow-900/20 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center tracking-tight transition-colors duration-300">
                            <Trophy className="w-6 h-6 mr-3 text-yellow-500 fill-yellow-500" />
                            Morning HIIT
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 ml-9 font-medium transition-colors duration-300">15 mins • Bodyweight Only</p>
                    </div>
                    {morningSaved && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm border border-green-200 dark:border-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Done
                        </span>
                    )}
                </div>

                <div className="space-y-3 relative z-10 mb-6">
                    {exercises.map((exercise: any, index: number) => {
                        const name = typeof exercise === 'string' ? exercise : exercise.name;
                        const tip = typeof exercise === 'string' ? null : exercise.safetyTip;
                        const target = typeof exercise === 'string' ? null : exercise.targetReps;
                        const unit = typeof exercise === 'string' ? 'reps' : (exercise.unit || 'reps');

                        return (
                            <div
                                key={name}
                                onClick={() => toggleExercise(name)}
                                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group active:scale-[0.98] animate-fade-in-up ${completedExercises.has(name)
                                    ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50'
                                    : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md dark:shadow-none'
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start">
                                    <div className={`w-7 h-7 shrink-0 rounded-full border-[2.5px] mr-4 mt-0.5 flex items-center justify-center transition-all duration-300 ${completedExercises.has(name)
                                        ? 'bg-blue-500 border-blue-500 scale-110'
                                        : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-400'
                                        }`}>
                                        {completedExercises.has(name) && <Check className="w-4 h-4 text-white font-bold animate-scale-in" strokeWidth={4} />}
                                    </div>
                                    <div>
                                        <span className={`capitalize text-base font-semibold block transition-colors ${completedExercises.has(name) ? 'text-slate-400 dark:text-slate-500 line-through decoration-2 decoration-slate-300 dark:decoration-slate-600' : 'text-slate-800 dark:text-slate-200'
                                            }`}>
                                            {name.replace(/_/g, ' ')}
                                        </span>
                                        {tip && !completedExercises.has(name) && (
                                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1.5 flex items-start leading-relaxed bg-orange-50/80 dark:bg-orange-900/20 px-2.5 py-1.5 rounded-lg border border-orange-100 dark:border-orange-900/50 max-w-[95%]">
                                                <span className="mr-1.5 mt-0.5 text-[10px]">🛡️</span>
                                                <span>{tip}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {target && !completedExercises.has(name) && (
                                    <span className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-3 py-1.5 rounded-full tracking-wide shrink-0">
                                        {target} {unit}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={saveMorningHiit}
                    disabled={morningSaved || completedExercises.size === 0}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${morningSaved
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                        : 'bg-black dark:bg-slate-700 text-white hover:bg-gray-800 dark:hover:bg-slate-600 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                >
                    {morningSaved ? 'Morning Workout Saved' : 'Save Morning HIIT'}
                </button>
            </div>

            {/* Evening Cardio Section */}
            <div className={`bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-xl shadow-slate-100 dark:shadow-none border transition-colors duration-300 relative overflow-hidden ${eveningSaved ? 'border-green-200 dark:border-green-900/50' : 'border-slate-50 dark:border-slate-800'}`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center tracking-tight transition-colors duration-300">
                            <Trophy className="w-6 h-6 mr-3 text-purple-500 fill-purple-500" />
                            Evening Cardio
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 ml-9 font-medium transition-colors duration-300">Walking / Light Jog</p>
                    </div>
                    {eveningSaved && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm border border-green-200 dark:border-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Done
                        </span>
                    )}
                </div>

                <div className="flex flex-col space-y-6 relative z-10 mb-8">
                    <div className="flex justify-between items-end">
                        <span className="text-slate-600 dark:text-slate-400 font-semibold text-sm uppercase tracking-wide">Duration</span>
                        <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tighter transition-colors duration-300">
                            {eveningWalkMinutes} <span className="text-base font-semibold text-slate-400 dark:text-slate-500 -ml-1">min</span>
                        </span>
                    </div>

                    <div className="relative h-10 flex items-center group">
                        <div className="absolute w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 transition-all" style={{ width: `${(eveningWalkMinutes / 120) * 100}%` }}></div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="120"
                            step="5"
                            value={eveningWalkMinutes}
                            onChange={(e) => {
                                setEveningWalkMinutes(Number(e.target.value));
                                setEveningSaved(false); // Unlock save if modified
                            }}
                            className="w-full h-10 absolute opacity-0 cursor-pointer z-20"
                        />
                        {/* Custom Thumb */}
                        <div
                            className="w-8 h-8 bg-white dark:bg-slate-800 border-4 border-purple-500 rounded-full shadow-lg absolute pointer-events-none transition-all z-10 flex items-center justify-center transform -translate-x-1/2 group-active:scale-110"
                            style={{ left: `${(eveningWalkMinutes / 120) * 100}%` }}
                        >
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex justify-between text-xs font-bold text-slate-400 dark:text-slate-500 px-1">
                        <span>0</span>
                        <span>30</span>
                        <span>60</span>
                        <span>90</span>
                        <span>120+</span>
                    </div>
                </div>

                <button
                    onClick={saveEveningCardio}
                    disabled={eveningSaved || eveningWalkMinutes === 0}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${eveningSaved
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                        : 'bg-black dark:bg-slate-700 text-white hover:bg-gray-800 dark:hover:bg-slate-600 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                >
                    {eveningSaved ? 'Evening Cardio Saved' : 'Save Evening Walk'}
                </button>
            </div>
        </div>
    );
};

export default WorkoutCard;
