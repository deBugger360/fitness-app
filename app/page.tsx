"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Check, Droplets, Trophy, Flame } from "lucide-react";
import { useRouter } from "next/navigation";

import WorkoutCard from "@/components/WorkoutCard";
import FastingTimer from "@/components/FastingTimer";
import WaterCounter from "@/components/WaterCounter";
import WeightLogModal from "@/components/WeightLogModal";
import { Plus } from "lucide-react";
import { usePersonalizedPlan } from "@/hooks/usePersonalizedPlan";

export default function Dashboard() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const router = useRouter(); // Need to import useRouter at top

  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await db.table('users').limit(1).first();
        if (user && user.onboarded) {
          setCurrentUserId(user.id);
        } else {
          // No user or partial user -> Go to onboarding
          // We do NOT create Default Athlete anymore.
          router.push('/onboarding');
        }
      } catch (err) {
        console.error("Error initializing user:", err);
      }
    };
    initUser();
  }, [router]);

  const { plan: workoutData, loading } = usePersonalizedPlan(currentUserId);

  if (loading || !workoutData) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="pb-24 px-6 pt-10">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Today's Plan
          </h1>
          <p className="text-slate-500 capitalize mt-2 font-medium flex items-center text-lg">
            {workoutData.day}
            <span className="mx-3 text-slate-300">•</span>
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide ${workoutData.level === 'Beginner' ? 'bg-green-100/80 text-green-700' : 'bg-indigo-100/80 text-indigo-700'}`}>
              {workoutData.level}
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsWeightModalOpen(true)}
          className="p-3.5 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95"
          aria-label="Log Weight"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Habit Timers */}
      <div className="mb-8">
        <FastingTimer />
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col items-start justify-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-500 mb-2">
            <div className="w-2 h-2 bg-current rounded-full"></div>
          </div>
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{workoutData.fastingWindow}</span>
          <span className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Fasting Window</span>
        </div>
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col items-start justify-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 text-orange-500 mb-2">
            <Flame className="w-4 h-4 fill-orange-500" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{workoutData.streak}</span>
            <span className="text-sm font-medium text-slate-500">Days</span>
          </div>
          <span className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-wider">Best Streak</span>
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
