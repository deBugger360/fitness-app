"use client";

import React, { useState } from 'react';
import { Check, Trophy } from 'lucide-react';
import { db } from '@/lib/db';

interface WorkoutCardProps {
    currentUserId: number | null;
    workoutType: string;
    exercises: string[];
    onSave?: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ currentUserId, workoutType, exercises, onSave }) => {
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
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

        // Map checked exercises to schema numbers (Inference logic)
        // In a real app, these might be input fields.
        const workoutData: any = {
            user_id: currentUserId,
            date: today,
            morning_workout_done: true, // Assuming this is that workout
            exercisesCompleted: exercisesList, // Keep this for UI state restoration if needed
            timestamp: new Date().toISOString(),
            synced: 0,
            // Default schema values
            pushups: 0,
            squats: 0,
            jumping_jacks: 0,
            evening_walk_minutes: 0,
            walk_minutes: 0 // Alias for convenience if schema varies
        };

        // Apply specific values if checked
        if (exercisesList.some(e => e.includes('pushups'))) workoutData.pushups = 20; // Default from plan
        if (exercisesList.some(e => e.includes('squats'))) workoutData.squats = 20;
        if (exercisesList.some(e => e.includes('jumping_jacks'))) workoutData.jumping_jacks = 30;
        if (exercisesList.some(e => e.includes('walk'))) {
            workoutData.evening_walk_minutes = 30;
            workoutData.walk_minutes = 30;
        }

        try {
            await db.table('workouts').add(workoutData);
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
        <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Routine: {workoutType.replace(/_/g, ' ')}
            </h2>

            <div className="space-y-3">
                {exercises.map((exercise: string) => (
                    <div
                        key={exercise}
                        onClick={() => toggleExercise(exercise)}
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${completedExercises.has(exercise)
                                ? 'bg-blue-50 border-blue-200 shadow-inner'
                                : 'bg-white border-gray-100 shadow-sm hover:border-blue-100'
                            }`}
                    >
                        <div className="flex items-center">
                            <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-colors ${completedExercises.has(exercise)
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'border-gray-300 group-hover:border-blue-300'
                                }`}>
                                {completedExercises.has(exercise) && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <span className={`capitalize font-medium ${completedExercises.has(exercise) ? 'text-gray-400 line-through' : 'text-gray-700'
                                }`}>
                                {exercise.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={finishWorkout}
                disabled={isSaved}
                className={`w-full mt-6 py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center ${isSaved
                        ? 'bg-green-500 text-white cursor-default'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
            >
                {isSaved ? (
                    <>
                        <Check className="w-5 h-5 mr-2" />
                        Workout Saved
                    </>
                ) : (
                    'Save Workout'
                )}
            </button>
        </div>
    );
};

export default WorkoutCard;
