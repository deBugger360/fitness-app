"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import WaterCounter from "@/features/nutrition/components/WaterCounter";
import MealLogger from "@/features/nutrition/components/MealLogger";
import DietAnalysisModal from "@/features/nutrition/components/DietAnalysisModal";
import { Sparkles, Utensils } from "lucide-react";

import DietScoreCard from "@/features/nutrition/components/DietScoreCard";
import { usePersonalizedPlan } from "@/features/plan/hooks/usePersonalizedPlan";

export default function MealsPage() {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Use the hook to get dynamic goals (water, fasting window)
    const { plan } = usePersonalizedPlan(currentUserId);

    useEffect(() => {
        const initUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user?.id || null);
        };
        initUser();
    }, []);

    const handleModalClose = () => {
        setIsDietModalOpen(false);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Nutrition</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium transition-colors duration-300">Tracking & Analysis</p>
                </div>
                <button
                    onClick={() => setIsDietModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 group"
                >
                    <Sparkles className="w-4 h-4 text-indigo-100 group-hover:text-white transition-colors" />
                    <span className="font-bold text-sm">Analyze Meal</span>
                </button>
            </header>

            <DietScoreCard key={refreshKey} currentUserId={currentUserId} />

            <div className="mb-8">
                <WaterCounter currentUserId={currentUserId} waterGoal={plan?.waterTarget || 3} />
            </div>

            <section className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 mb-8 relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/20 rounded-full blur-3xl -mr-16 -mt-16 opacity-40"></div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center relative z-10 transition-colors duration-300">
                    <Utensils className="w-5 h-5 mr-2 text-orange-500 dark:text-orange-400" />
                    Meal Logger
                </h2>
                <MealLogger currentUserId={currentUserId} />
            </section>

            <DietAnalysisModal
                currentUserId={currentUserId}
                isOpen={isDietModalOpen}
                onClose={handleModalClose}
            />
        </div>
    );
}
