"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import AnalyticsEngine from '@/features/analytics/components/AnalyticsEngine';
import ConsistencyScoreCard from '@/features/stats/components/ConsistencyScoreCard';
import Skeleton from "@/features/core/components/Skeleton";

export default function StatsPage() {
    const [data, setData] = useState<{ workouts: any[], sugar: any[], meals: any[], foundations: any[] }>({
        workouts: [], sugar: [], meals: [], foundations: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Resolve User
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const userId = user.id;

                    // 2. Calculate Date Range (Last 7 Days)
                    const endDate = new Date();
                    const startDate = new Date();
                    startDate.setDate(endDate.getDate() - 6);
                    const startStr = startDate.toISOString().split('T')[0];
                    const endStr = endDate.toISOString().split('T')[0];

                    // 3. Fetch All Signals (Parallel)
                    const [workoutsResult, sugarResult, mealsResult, foundationsResult] = await Promise.all([
                        supabase.from('workouts')
                            .select('*')
                            .gte('date', startStr)
                            .lte('date', endStr)
                            .eq('user_id', userId),
                        supabase.from('sugar_logs')
                            .select('*')
                            .gte('date', startStr)
                            .lte('date', endStr)
                            .eq('user_id', userId),
                        supabase.from('meals')
                            .select('*')
                            .gte('date', startStr)
                            .lte('date', endStr)
                            .eq('user_id', userId),
                        supabase.from('foundations')
                            .select('*')
                            .gte('date', startStr)
                            .lte('date', endStr)
                            .eq('user_id', userId)
                    ]);

                    setData({
                        workouts: workoutsResult.data || [],
                        sugar: sugarResult.data || [],
                        meals: mealsResult.data || [],
                        foundations: foundationsResult.data || []
                    });
                }
            } catch (err) {
                console.error("Error loading analytics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                workoutData={data.workouts}
                sugarData={data.sugar}
                mealData={data.meals}
                foundationData={data.foundations}
            />

            <AnalyticsEngine
                workoutData={data.workouts}
                sugarData={data.sugar}
                mealData={data.meals}
            />
        </div>
    );
}
