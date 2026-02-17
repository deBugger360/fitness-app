"use client";

import React, { useState, useEffect } from "react";
import { Plus, Flame, Droplets, Dumbbell, Clock } from "lucide-react";
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
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const initUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profile) {
            setCurrentUserId(user.id);
          } else {
            router.push('/onboarding');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error("Error initializing user:", err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    initUser();
  }, [router, supabase]);

  const { plan: workoutData, loading } = usePersonalizedPlan(currentUserId);

  // Show skeleton if:
  // 1. Auth is still checking
  // 2. Data hook is loading
  // 3. User is logged in but data isn't ready yet
  if (isAuthChecking || loading || (currentUserId && !workoutData)) {
    return (
      <div className="pb-32 px-6 pt-12 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-3">
            <Skeleton className="h-10 w-48 rounded-xl dark:bg-slate-800/50" />
            <Skeleton className="h-6 w-32 rounded-lg dark:bg-slate-800/50" />
          </div>
          <Skeleton className="w-12 h-12 rounded-2xl dark:bg-slate-800/50" />
        </div>

        {/* Smart Insight Skeleton */}
        <Skeleton className="h-48 w-full mb-8 rounded-[32px] dark:bg-slate-800/50" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full rounded-[24px] dark:bg-slate-800/50" />
            <Skeleton className="h-40 w-full rounded-[24px] dark:bg-slate-800/50" />
          </div>
          <Skeleton className="h-40 w-full rounded-[24px] dark:bg-slate-800/50" />
        </div>

        {/* Workout Card Skeleton */}
        <Skeleton className="h-64 w-full mb-8 rounded-[32px] dark:bg-slate-800/50" />
      </div>
    );
  }

  if (!workoutData) return null; // Should not happen after loading handles

  return (
    <div className="pb-32 px-6 pt-12 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 selection:bg-indigo-500/30">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-10 flex justify-between items-start"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">
            Today's Plan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 capitalize mt-2 font-medium flex items-center text-lg transition-colors duration-300">
            {workoutData.day}
            <span className="mx-3 text-slate-300 dark:text-slate-600">•</span>
            <span className={`text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wide border shadow-sm backdrop-blur-md ${workoutData.level === 'Beginner'
              ? 'bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800/50'
              : 'bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800/50'
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
            className="p-3.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group"
            aria-label="Log Weight"
          >
            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90 text-indigo-500" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/profile')}
            className="p-3.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all"
            aria-label="Profile"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </div>
          </motion.button>
        </div>
      </motion.header>

      {/* Smart Recommendations */}
      <AnimatePresence mode="wait">
        {currentUserId && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
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
              staggerChildren: 0.15
            }
          }
        }}
      >
        {/* Left Column: Stats */}
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="grid grid-cols-2 gap-4 h-full">
          {/* Fasting Window Stat */}
          <motion.div
            whileHover={{ scale: 1.02, translateY: -2 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[32px] shadow-sm border border-white/20 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/5 flex flex-col items-start justify-between h-full min-h-[160px]"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{workoutData.fastingWindow}</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-2">Window</p>
            </div>
          </motion.div>

          {/* Streak Stat */}
          <motion.div
            whileHover={{ scale: 1.02, translateY: -2 }}
            className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-[32px] shadow-sm border border-white/20 dark:border-slate-800 ring-1 ring-slate-900/5 dark:ring-white/5 flex flex-col items-start justify-between h-full min-h-[160px]"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/20 text-orange-500 dark:text-orange-400 mb-4">
              <Flame className="w-6 h-6 fill-orange-500 dark:fill-orange-400" />
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">{workoutData.streak}</span>
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500">Day</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-2">Streak</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Goal + Fasting Timer */}
        <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} className="space-y-6 flex flex-col">
          <MilestoneLink currentUserId={currentUserId} />
          <FastingTimer window={workoutData.fastingWindow} />
        </motion.div>
      </motion.div>

      {/* Main Action Sections */}
      <motion.div
        className="mt-8 space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
      >
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

      <WeightLogModal
        currentUserId={currentUserId}
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
      />
    </div>
  );
}

