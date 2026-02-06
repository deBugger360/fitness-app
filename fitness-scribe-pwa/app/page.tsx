"use client";

import React, { useState, useEffect } from "react";
import { getTodayWorkout } from "@/lib/planManager";
import { db } from "@/lib/db";
import { Check, Droplets, Trophy } from "lucide-react";

import WorkoutCard from "@/components/WorkoutCard";
import FastingTimer from "@/components/FastingTimer";
import WaterCounter from "@/components/WaterCounter";
import WeightLogModal from "@/components/WeightLogModal";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const data = getTodayWorkout();
    console.log(`📅 Daily Logic: It's ${data.day}, scheduling ${data.workoutType}`);
    setWorkoutData(data);

    const initUserAndStats = async () => {
      // 1. Get or Create User
      let userId = 1; // Default
      try {
        const user = await db.table('users').limit(1).first();
        if (user) {
          userId = user.id;
        } else {
          userId = await db.table('users').add({
            name: 'Default Athlete',
            age: 28,
            height_cm: 175,
            weight_kg: 75
          }) as number;
        }
        setCurrentUserId(userId);

      } catch (err) {
        console.error("Error initializing user data:", err);
      }
    };

    initUserAndStats();
  }, []);

  if (!isClient || !workoutData) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="pb-24 px-6 pt-10">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Today's Plan
          </h1>
          <p className="text-gray-500 capitalize mt-1 font-medium">{workoutData.day}</p>
        </div>
        <button
          onClick={() => setIsWeightModalOpen(true)}
          className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Habit Timers */}
      <FastingTimer />

      {/* Stats Card */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-sm text-gray-400 mb-1">Fasting Window</span>
          <span className="font-semibold text-gray-800">{workoutData.fastingWindow}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <span className="text-sm text-gray-400 mb-1">Workout</span>
          <span className="font-semibold text-gray-800 text-sm">{workoutData.workoutType.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Workout Section */}
      <section className="mb-10">
        <WorkoutCard
          currentUserId={currentUserId}
          workoutType={workoutData.workoutType}
          exercises={workoutData.exercises}
          onSave={() => console.log("Workout Saved via Card!")}
        />
      </section>

      {/* Water Section */}
      <WaterCounter
        currentUserId={currentUserId}
        waterGoal={workoutData.waterTarget}
      />

      {/* Weight Modal */}
      <WeightLogModal
        currentUserId={currentUserId}
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />
    </div>
  );
}
