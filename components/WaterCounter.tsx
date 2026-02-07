"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Droplets } from "lucide-react";

interface WaterCounterProps {
    currentUserId: number | null;
    waterGoal?: number;
}

const WaterCounter: React.FC<WaterCounterProps> = ({ currentUserId, waterGoal = 3 }) => {
    const [waterIntake, setWaterIntake] = useState(0);

    useEffect(() => {
        if (!currentUserId) return;
        const fetchWater = async () => {
            const today = new Date().toISOString().split('T')[0];
            const mealLog = await db.table('meals')
                .where('date').equals(today)
                .and(item => item.user_id === currentUserId)
                .first();

            if (mealLog && mealLog.water_liters) {
                setWaterIntake(mealLog.water_liters);
            } else {
                setWaterIntake(0);
            }
        };
        fetchWater();
    }, [currentUserId]); // Refetch when user changes

    const updateWater = async (amount: number) => {
        if (!currentUserId) return;
        const newAmount = Math.max(0, parseFloat((waterIntake + amount).toFixed(2)));
        setWaterIntake(newAmount);

        const today = new Date().toISOString().split('T')[0];
        try {
            const existing = await db.table('meals')
                .where('date').equals(today)
                .and(item => item.user_id === currentUserId)
                .first();

            if (existing) {
                await db.table('meals').update(existing.id, { water_liters: newAmount });
            } else {
                await db.table('meals').add({
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
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-blue-500" />
                Hydration
            </h2>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-bold text-blue-600">{waterIntake}<span className="text-lg text-gray-400 font-normal">L</span></span>
                    <span className="text-sm text-gray-400 mb-1">Goal: {waterGoal}L</span>
                </div>

                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                    <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${waterProgress}%` }}
                    />
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => updateWater(0.25)}
                        className="py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                        disabled={!currentUserId}
                    >
                        +0.25L
                    </button>
                    <button
                        onClick={() => updateWater(0.5)}
                        className="py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                        disabled={!currentUserId}
                    >
                        +0.5L
                    </button>
                    <button
                        onClick={() => updateWater(1.0)}
                        className="py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
                        disabled={!currentUserId}
                    >
                        +1.0L
                    </button>
                </div>

                <div className="mt-2 text-right">
                    <button
                        onClick={() => updateWater(-0.25)}
                        className="text-xs text-gray-400 underline hover:text-gray-600"
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
