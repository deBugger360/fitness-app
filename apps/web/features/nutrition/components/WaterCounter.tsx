"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Droplets } from "lucide-react";
import { motion } from "framer-motion";

interface WaterCounterProps {
    currentUserId: string | null;
    waterGoal?: number;
}

const WaterCounter: React.FC<WaterCounterProps> = ({ currentUserId, waterGoal = 3 }) => {
    const [waterIntake, setWaterIntake] = useState(0);

    useEffect(() => {
        if (!currentUserId) return;

        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `water_${currentUserId}_${today}`;

        // 1. Initial Fetch with Cache Fallback
        const fetchWater = async () => {
            // Check cache first for immediate render
            const cached = localStorage.getItem(storageKey);
            if (cached) setWaterIntake(parseFloat(cached));

            try {
                const { data: mealLog, error } = await supabase
                    .from('meals')
                    .select('*')
                    .eq('date', today)
                    .eq('user_id', currentUserId)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (mealLog && mealLog.water_liters !== undefined) {
                    setWaterIntake(mealLog.water_liters);
                    localStorage.setItem(storageKey, mealLog.water_liters.toString());
                } else if (!cached) {
                    setWaterIntake(0);
                }
            } catch (err) {
                console.log("Offline or error fetching water, using cache if available");
            }
        };
        fetchWater();

        // 2. Realtime Subscription
        const channel = supabase
            .channel(`meals:water:${currentUserId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'meals',
                filter: `user_id=eq.${currentUserId}`
            }, (payload: any) => {
                if (payload.new && payload.new.date === today && payload.new.water_liters !== undefined) {
                    setWaterIntake(payload.new.water_liters);
                    localStorage.setItem(storageKey, payload.new.water_liters.toString());
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);

    const updateWater = async (amount: number) => {
        if (!currentUserId) return;
        const newAmount = Math.max(0, parseFloat((waterIntake + amount).toFixed(2)));
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `water_${currentUserId}_${today}`;

        // Optimistic UI update & Local Persistence
        setWaterIntake(newAmount);
        localStorage.setItem(storageKey, newAmount.toString());

        const supabase = createClient();

        try {
            // Check if entry exists first to avoid UPSERT constraint issues
            const { data: existing, error: fetchError } = await supabase
                .from('meals')
                .select('id')
                .eq('user_id', currentUserId)
                .eq('date', today)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError;
            }

            let error;
            if (existing) {
                const { error: updateError } = await supabase
                    .from('meals')
                    .update({ water_liters: newAmount })
                    .eq('id', existing.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('meals')
                    .insert({
                        user_id: currentUserId,
                        date: today,
                        water_liters: newAmount
                    });
                error = insertError;
            }

            if (error) {
                console.error("Sync failed, saved locally:", JSON.stringify(error, null, 2));
            }
        } catch (error) {
            console.error("Failed to update water:", error);
        }
    };

    const waterProgress = Math.min((waterIntake / waterGoal) * 100, 100);

    return (
        <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center transition-colors duration-300">
                <Droplets className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
                Hydration
            </h2>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">
                        {Number(waterIntake).toFixed(2).replace(/\.?0+$/, '')}
                        <span className="text-lg text-gray-400 dark:text-slate-500 font-normal">L</span>
                    </span>
                    <span className="text-sm text-gray-400 dark:text-slate-500 mb-1 transition-colors duration-300">
                        Goal: {Number(waterGoal).toFixed(2).replace(/\.?0+$/, '')}L
                    </span>
                </div>

                <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6 transition-colors duration-300">
                    <motion.div
                        className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${waterProgress}%` }}
                        transition={{ type: "spring", stiffness: 50, damping: 10 }}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => updateWater(0.25)}
                        className="py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95 active:bg-blue-200 dark:active:bg-blue-900/60 shadow-sm border border-blue-100 dark:border-blue-900/30"
                        disabled={!currentUserId}
                    >
                        +0.25L
                    </button>
                    <button
                        onClick={() => updateWater(0.5)}
                        className="py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95 active:bg-blue-200 dark:active:bg-blue-900/60 shadow-sm border border-blue-100 dark:border-blue-900/30"
                        disabled={!currentUserId}
                    >
                        +0.5L
                    </button>
                    <button
                        onClick={() => updateWater(1.0)}
                        className="py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95 active:bg-blue-200 dark:active:bg-blue-900/60 shadow-sm border border-blue-100 dark:border-blue-900/30"
                        disabled={!currentUserId}
                    >
                        +1.0L
                    </button>
                </div>

                <div className="mt-2 text-right">
                    <button
                        onClick={() => updateWater(-0.25)}
                        className="text-xs text-gray-400 dark:text-slate-500 underline hover:text-gray-600 dark:hover:text-slate-400 transition-colors duration-300"
                        disabled={!currentUserId}
                    >
                        Undo
                    </button>
                </div>
            </div>
        </section>
    );
};

export default WaterCounter;
