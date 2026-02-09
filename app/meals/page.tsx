"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import WaterCounter from "@/components/WaterCounter";
import MealLogger from "@/components/MealLogger";
import DietAnalysisModal from "@/components/DietAnalysisModal";
import { Sparkles, Utensils } from "lucide-react";

import DietScoreCard from "@/components/DietScoreCard";

export default function MealsPage() {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const initUser = async () => {
            let userId = 1;
            const user = await db.table('users').limit(1).first();
            if (user) userId = user.id;
            setCurrentUserId(userId);
        };
        initUser();
    }, []);

    const handleModalClose = () => {
        setIsDietModalOpen(false);
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nutrition</h1>
                    <p className="text-slate-500 mt-1 font-medium">Tracking & Analysis</p>
                </div>
                <button
                    onClick={() => setIsDietModalOpen(true)}
                    className="p-3 bg-white rounded-full shadow-sm hover:shadow-md border border-slate-200 text-indigo-600 transition-all"
                >
                    <Sparkles className="w-6 h-6" />
                </button>
            </header>

            <DietScoreCard key={refreshKey} currentUserId={currentUserId} />

            <div className="mb-8">
                <WaterCounter currentUserId={currentUserId} waterGoal={3} />
            </div>

            <section className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-40"></div>
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center relative z-10">
                    <Utensils className="w-5 h-5 mr-2 text-orange-500" />
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
