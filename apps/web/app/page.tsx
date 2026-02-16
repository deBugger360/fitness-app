"use client";

import React, { useState, useEffect } from "react";
import { Check, Droplets, Trophy, Flame, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import WorkoutCard from "@/features/workouts/components/WorkoutCard";
import FastingTimer from "@/features/nutrition/components/FastingTimer";
import WaterCounter from "@/features/nutrition/components/WaterCounter";
import WeightLogModal from "@/features/body/components/WeightLogModal";
import Skeleton from "@/features/core/components/Skeleton";
import { usePersonalizedPlan } from "@/features/plan/hooks/usePersonalizedPlan";
import MilestoneLink from "@/features/gamification/components/MilestoneLink";
import RecommendationEngine from "@/features/analytics/components/RecommendationEngine";

import { createClient } from "@/utils/supabase/client";

export default function Dashboard() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Check if profile exists
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            setCurrentUserId(user.id);
          } else {
            // User exists in auth but no profile? Potentially incomplete onboarding.
            // Or maybe triggered by insert trigger? 
            // If trigger works, profile exists. 
            // If manual onboarding needed and skipped, we redirect.
            router.push('/onboarding');
          }
        } else {
          router.push('/login');
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
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex justify-between items-start"
      >
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
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsWeightModalOpen(true)}
            className="p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all group"
            aria-label="Log Weight"
          >
            <Plus className="w-5 h-5 transition-transform group-active:rotate-90" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/profile')}
            className="p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            aria-label="Profile"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </motion.button>
        </div>
      </motion.header>

      {/* Smart Recommendations - Adaptive: Suggestion first */}
      <AnimatePresence mode="wait">
        {currentUserId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <RecommendationEngine currentUserId={currentUserId} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {/* Reordered for "Glanceability" */}

        {/* Stats Row */}
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start justify-center"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 mb-3">
              <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse"></div>
            </div>
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{workoutData.fastingWindow}</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Fasting Window</span>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start justify-center"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 mb-3">
              <Flame className="w-5 h-5 fill-orange-500 dark:fill-orange-400" />
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{workoutData.streak}</span>
              <span className="text-sm font-bold text-slate-400">Days</span>
            </div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Current Streak</span>
          </motion.div>
        </motion.div>

        {/* Habit Timers & Milestone */}
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="space-y-6">
          <MilestoneLink currentUserId={currentUserId} />
          <FastingTimer />
        </motion.div>
      </motion.div>

      {/* Main Action Sections */}
      <motion.div
        className="mt-8 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {/* Workout first as it is the primary daily action */}
        <WorkoutCard
          currentUserId={currentUserId}
          workoutType={workoutData.workoutType}
          exercises={workoutData.exercises}
          onSave={() => console.log("Workout Saved via Card!")}
        />

        <WaterCounter
          currentUserId={currentUserId}
          waterGoal={workoutData.waterTarget}
        />
      </motion.div>

      {/* Weight Modal */}
      <WeightLogModal
        currentUserId={currentUserId}
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />
    </div>
  );
}
