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
import MilestoneLink from "@/components/MilestoneLink";

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
      <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex justify-between items-end mb-10">
          <div>
            <Skeleton className="h-10 w-48 mb-2 dark:bg-slate-800" />
            <Skeleton className="h-6 w-32 dark:bg-slate-800" />
          </div>
          <Skeleton className="w-12 h-12 rounded-2xl dark:bg-slate-800" />
        </div>
        <Skeleton className="h-40 w-full mb-8 rounded-[32px] dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-4 mb-10">
          <Skeleton className="h-32 w-full rounded-[24px] dark:bg-slate-800" />
          <Skeleton className="h-32 w-full rounded-[24px] dark:bg-slate-800" />
        </div>
        <Skeleton className="h-64 w-full mb-10 rounded-[32px] dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="mb-10 flex justify-between items-end animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
            Today's Plan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 capitalize mt-2 font-medium flex items-center text-lg transition-colors duration-300">
            {workoutData.day}
            <span className="mx-3 text-slate-300 dark:text-slate-600">•</span>
            <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wide border ${workoutData.level === 'Beginner'
              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800'
              : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800'
              }`}>
              {workoutData.level}
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsWeightModalOpen(true)}
          className="p-3.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 group"
          aria-label="Log Weight"
        >
          <Plus className="w-6 h-6 transition-transform group-active:rotate-90" />
        </button>
      </header>

      {/* Milestone Progress (Hook Model: Investment) */}
      <div className="animate-fade-in-up hover:scale-[1.01] transition-transform duration-300" style={{ animationDelay: '50ms' }}>
        {currentUserId && <MilestoneLink currentUserId={currentUserId} />}
      </div>

      {/* Habit Timers */}
      <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <FastingTimer />
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-2 gap-4 mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 mb-3">
            <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse"></div>
          </div>
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">{workoutData.fastingWindow}</span>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Fasting Window</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 mb-3">
            <Flame className="w-5 h-5 fill-orange-500 dark:fill-orange-400" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">{workoutData.streak}</span>
            <span className="text-sm font-bold text-slate-400">Days</span>
          </div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Current Streak</span>
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
