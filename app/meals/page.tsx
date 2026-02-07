"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import WaterCounter from "@/components/WaterCounter";
import MealLogger from "@/components/MealLogger";

export default function MealsPage() {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    useEffect(() => {
        const initUser = async () => {
            let userId = 1;
            const user = await db.table('users').limit(1).first();
            if (user) userId = user.id;
            setCurrentUserId(userId);
        };
        initUser();
    }, []);

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-gray-50">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Nutrition</h1>
                <p className="text-gray-500 mt-1">Fat Loss Tracking • Fasting • Meals</p>
            </header>

            <div className="mb-8">
                <WaterCounter currentUserId={currentUserId} waterGoal={3} />
            </div>

            <MealLogger currentUserId={currentUserId} />
        </div>
    );
}
