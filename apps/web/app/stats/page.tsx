"use client";

import React, { useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/features/auth/hooks/useUser';
import { useDateRangeData } from '@repo/hooks';
import AnalyticsEngine from '@/features/analytics/components/AnalyticsEngine';
import ConsistencyScoreCard from '@/features/stats/components/ConsistencyScoreCard';
import Skeleton from "@/features/core/components/Skeleton";

// Supabase client is stable across renders (module-level singleton)
const supabase = createClient();

// Last 7 days date range
function getLast7Days() {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
    };
}

export default function StatsPage() {
    const { user } = useUser();
    const { startDate, endDate } = useMemo(getLast7Days, []);

    const { workouts, meals, sugarLogs, foundations, loading } = useDateRangeData(
        supabase,
        user?.id,
        startDate,
        endDate
    );

    if (loading) {
        return (
            <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                <Skeleton className="h-10 w-32 mb-2" />
                <Skeleton className="h-6 w-48 mb-8" />
                <Skeleton className="h-64 w-full rounded-[24px] mb-6" />
                <div className="space-y-6">
                    <Skeleton className="h-64 w-full rounded-[24px]" />
                    <Skeleton className="h-48 w-full rounded-[24px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 animate-fade-in-up transition-colors duration-300">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                    Insights
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">Signals matching your goals</p>
            </header>

            <ConsistencyScoreCard
                workoutData={workouts}
                sugarData={sugarLogs}
                mealData={meals}
                foundationData={foundations}
            />

            <AnalyticsEngine
                workoutData={workouts}
                sugarData={sugarLogs}
                mealData={meals}
            />
        </div>
    );
}
