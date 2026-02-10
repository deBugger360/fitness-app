"use client";

import React, { useState } from 'react';
import { Check, Trophy } from 'lucide-react';
import { db } from '@/lib/db';

interface WorkoutCardProps {
    currentUserId: number | null;
    workoutType: string;
    exercises: any[];
    onSave?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ currentUserId, workoutType, exercises, onSave }) => {
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
    const [eveningWalkMinutes, setEveningWalkMinutes] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    const toggleExercise = (exercise: string) => {
        const newCompleted = new Set(completedExercises);
        if (newCompleted.has(exercise)) {
            newCompleted.delete(exercise);
        } else {
            newCompleted.add(exercise);
        }
        setCompletedExercises(newCompleted);
        setIsSaved(false);
    };

    const finishWorkout = async () => {
        if (!currentUserId) return;

        const today = new Date().toISOString().split('T')[0];
        const exercisesList = Array.from(completedExercises);

        // Calculate HIIT completion
        const isHiitDone = exercisesList.length > 0 &&
            // Assume if at least 50% of exercises are checked, session is "done"
            (exercisesList.length / exercises.length) >= 0;
        // Ideally we'd be more strict but for UX "logging what you did" is better

        const workoutData: any = {
            user_id: currentUserId,
            date: today,
            morning_hiit_completed: isHiitDone ? 1 : 0,
            evening_walk_minutes: eveningWalkMinutes,
            exercisesCompleted: exercisesList,
            timestamp: new Date().toISOString(),
            synced: 0,

            // Legacy/Fallback Fields
            walk_minutes: eveningWalkMinutes,
            pushups: exercisesList.some(e => e.includes('pushups')) ? 20 : 0,
            squats: exercisesList.some(e => e.includes('squats')) ? 20 : 0,
            jumping_jacks: exercisesList.some(e => e.includes('jumping_jacks')) ? 30 : 0
        };

        try {
            // Check if record exists for today to update instead of add multiple
            const existing = await db.table('workouts')
                .where('date').equals(today)
                .and(w => w.user_id === currentUserId)
                .first();

            if (existing) {
                await db.table('workouts').update(existing.id, workoutData);
            } else {
                await db.table('workouts').add(workoutData);
            }

            setIsSaved(true);
            if (onSave) onSave();
        } catch (error) {
            console.error("Failed to save workout:", error);
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
            {/* Morning HIIT Section */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-100 border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center relative z-10 tracking-tight">
                    <Trophy className="w-6 h-6 mr-3 text-yellow-500 fill-yellow-500" />
                    Morning HIIT
                </h2>
                <p className="text-sm text-slate-500 mb-6 ml-9 relative z-10 font-medium">15 mins • Bodyweight Only</p>

                <div className="space-y-3 relative z-10">
                    {exercises.map((exercise: any, index: number) => {
                        const name = typeof exercise === 'string' ? exercise : exercise.name;
                        const tip = typeof exercise === 'string' ? null : exercise.safetyTip;
                        const target = typeof exercise === 'string' ? null : exercise.targetReps;

                        return (
                            <div
                                key={name}
                                onClick={() => toggleExercise(name)}
                                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between group active:scale-[0.98] animate-fade-in-up ${completedExercises.has(name)
                                    ? 'bg-blue-50/50 border-blue-100'
                                    : 'bg-white border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md'
                                    }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start">
                                    <div className={`w-7 h-7 rounded-full border-[2.5px] mr-4 mt-0.5 flex items-center justify-center transition-all duration-300 ${completedExercises.has(name)
                                        ? 'bg-blue-500 border-blue-500 scale-110'
                                        : 'border-slate-300 group-hover:border-blue-400'
                                        }`}>
                                        {completedExercises.has(name) && <Check className="w-4 h-4 text-white font-bold animate-scale-in" strokeWidth={4} />}
                                    </div>
                                    <div>
                                        <span className={`capitalize text-base font-semibold block transition-colors ${completedExercises.has(name) ? 'text-slate-400 line-through decoration-2 decoration-slate-300' : 'text-slate-800'
                                            }`}>
                                            {name.replace(/_/g, ' ')}
                                        </span>
                                        {tip && !completedExercises.has(name) && (
                                            <p className="text-xs text-orange-600 mt-1.5 flex items-start leading-relaxed bg-orange-50/80 px-2.5 py-1.5 rounded-lg border border-orange-100 max-w-[95%]">
                                                <span className="mr-1.5 mt-0.5 text-[10px]">🛡️</span>
                                                <span>{tip}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {target && !completedExercises.has(name) && (
                                    <span className="ml-2 bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full tracking-wide">
                                        {target}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Evening Cardio Section */}
            {/* Same logic... */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl shadow-slate-100 border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>

                <h2 className="text-2xl font-bold text-slate-900 mb-1 flex items-center relative z-10 tracking-tight">
                    <Trophy className="w-6 h-6 mr-3 text-purple-500 fill-purple-500" />
                    Evening Cardio
                </h2>
                <p className="text-sm text-slate-500 mb-8 ml-9 relative z-10 font-medium">Walking / Light Jog</p>

                <div className="flex flex-col space-y-6 relative z-10">
                    <div className="flex justify-between items-end">
                        <span className="text-slate-600 font-semibold text-sm uppercase tracking-wide">Duration</span>
                        <span className="text-4xl font-extrabold text-slate-900 tracking-tighter">
                            {eveningWalkMinutes} <span className="text-base font-semibold text-slate-400 -ml-1">min</span>
                        </span>
                    </div>

                    <div className="relative h-10 flex items-center group">
                        <div className="absolute w-full h-3 bg-slate-100 rounded-full overflow-hidden">
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
                                setIsSaved(false);
                            }}
                            className="w-full h-10 absolute opacity-0 cursor-pointer z-20"
                        />
                        {/* Custom Thumb */}
                        <div
                            className="w-8 h-8 bg-white border-4 border-purple-500 rounded-full shadow-lg absolute pointer-events-none transition-all z-10 flex items-center justify-center transform -translate-x-1/2 group-active:scale-110"
                            style={{ left: `${(eveningWalkMinutes / 120) * 100}%` }}
                        >
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                    </div>

                    <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
                        <span>0</span>
                        <span>30</span>
                        <span>60</span>
                        <span>90</span>
                        <span>120+</span>
                    </div>
                </div>
            </div>

            <button
                onClick={finishWorkout}
                disabled={isSaved}
                className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center ${isSaved
                    ? 'bg-green-500 text-white cursor-default shadow-green-200 scale-100 animate-scale-in'
                    : 'bg-black text-white hover:bg-gray-800 hover:shadow-xl'
                    }`}
            >
                {isSaved ? (
                    <>
                        <Check className="w-5 h-5 mr-2 animate-scale-in" />
                        Daily Activity Saved
                    </>
                ) : (
                    'Save Activity Log'
                )}
            </button>
        </div>
    );
};

export default WorkoutCard;
