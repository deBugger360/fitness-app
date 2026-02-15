"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Droplets } from "lucide-react";

interface WaterCounterProps {
    currentUserId: string | null;
    waterGoal?: number;
}

const WaterCounter: React.FC<WaterCounterProps> = ({ currentUserId, waterGoal = 3 }) => {
    const [waterIntake, setWaterIntake] = useState(0);

    useEffect(() => {
        if (!currentUserId) return;
        const fetchWater = async () => {
            const supabase = createClient();
            const today = new Date().toISOString().split('T')[0];
            const { data: mealLog } = await supabase
                .from('meals')
                .select('*')
                .eq('date', today)
                .eq('user_id', currentUserId)
                .single();

            if (mealLog && mealLog.water_liters) {
                setWaterIntake(mealLog.water_liters);
            } else {
                setWaterIntake(0);
            }
        };
        fetchWater();
    }, [currentUserId]);

    const updateWater = async (amount: number) => {
        if (!currentUserId) return;
        const newAmount = Math.max(0, parseFloat((waterIntake + amount).toFixed(2)));
        setWaterIntake(newAmount);

        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];
        try {
            const { data: existing } = await supabase
                .from('meals')
                .select('*')
                .eq('date', today)
                .eq('user_id', currentUserId)
                .single();

            if (existing) {
                await supabase.from('meals').update({ water_liters: newAmount }).eq('id', existing.id);
            } else {
                await supabase.from('meals').insert({
                    user_id: currentUserId,
                    date: today,
                    water_liters: newAmount,
                    lunch: '',
                    dinner: '',
                    green_tea_cups: 0
                });
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
                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">{waterIntake}<span className="text-lg text-gray-400 dark:text-slate-500 font-normal">L</span></span>
                    <span className="text-sm text-gray-400 dark:text-slate-500 mb-1 transition-colors duration-300">Goal: {waterGoal}L</span>
                </div>

                <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6 transition-colors duration-300">
                    <div
                        className="h-full bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${waterProgress}%` }}
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
