"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Check, Droplets, Trophy, Flame, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import WorkoutCard from "@/components/WorkoutCard";
import FastingTimer from "@/components/FastingTimer";
import WaterCounter from "@/components/WaterCounter";
import WeightLogModal from "@/components/WeightLogModal";
import Skeleton from "@/components/Skeleton";
import { usePersonalizedPlan } from "@/hooks/usePersonalizedPlan";

export default function Dashboard() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await db.table('users').limit(1).first();
        if (user && user.onboarded) {
          setCurrentUserId(user.id);
        } else {
          router.push('/onboarding');
        }
      } catch (err) {
        console.error("Error initializing user:", err);
      }
    };
    initUser();
  }, [router]);

  const { plan: workoutData, loading } = usePersonalizedPlan(currentUserId);

  if (loading || !workoutData) {
    return (
      <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50">
        <div className="flex justify-between items-end mb-10">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="w-12 h-12 rounded-2xl" />
        </div>
        <Skeleton className="h-40 w-full mb-8 rounded-[32px]" />
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Skeleton className="h-32 w-full rounded-[24px]" />
          <Skeleton className="h-32 w-full rounded-[24px]" />
        </div>
        <Skeleton className="h-64 w-full mb-10 rounded-[32px]" />
      </div>
    );
  }

  return (
    <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50">
      <header className="mb-10 flex justify-between items-end animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Today's Plan
          </h1>
          <p className="text-slate-500 capitalize mt-2 font-medium flex items-center text-lg">
            {workoutData.day}
            <span className="mx-3 text-slate-300">•</span>
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide border ${workoutData.level === 'Beginner'
                ? 'bg-green-50 text-green-700 border-green-100'
                : 'bg-indigo-50 text-indigo-700 border-indigo-100'
              }`}>
              {workoutData.level}
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsWeightModalOpen(true)}
          className="p-3.5 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all active:scale-95 group"
          aria-label="Log Weight"
        >
          <Plus className="w-6 h-6 transition-transform group-active:rotate-90" />
        </button>
      </header>

      {/* Habit Timers */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <FastingTimer />
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-2 gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col items-start justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 mb-3">
            <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse"></div>
          </div>
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{workoutData.fastingWindow}</span>
          <span className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Fasting Window</span>
        </div>
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col items-start justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 mb-3">
            <Flame className="w-5 h-5 fill-orange-500" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{workoutData.streak}</span>
            <span className="text-sm font-bold text-slate-400">Days</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-wider">Current Streak</span>
        </div>
      </div>

      {/* Workout Section */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <WorkoutCard
          currentUserId={currentUserId}
          workoutType={workoutData.workoutType}
          exercises={workoutData.exercises}
          onSave={() => console.log("Workout Saved via Card!")}
        />
      </section>

      {/* Water Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <WaterCounter
          currentUserId={currentUserId}
          waterGoal={workoutData.waterTarget}
        />
      </div>

      {/* Weight Modal */}
      <WeightLogModal
        currentUserId={currentUserId}
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />
    </div>
  );
}
