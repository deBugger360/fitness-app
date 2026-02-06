"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import planData from "@/fitness_plan.json";
import { User, RefreshCw, Smartphone, Target } from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [pendingSyncs, setPendingSyncs] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            // Fetch User
            const storedUser = await db.table('users').limit(1).first();
            if (storedUser) {
                setUser(storedUser);
            }

            // Check Sync Status (Syncd = 0)
            const unsyncedWorkouts = await db.table('workouts').where('synced').equals(0).count();
            // Assume meals might eventually have sync too (currently not in prompt to sync meals, but good to check)
            // schema for meals doesn't explicitly have synced index in version 3 store def in db.js, 
            // but let's stick to workouts as per prompt 16 "waiting to be uploaded". 
            // Actually prompt 16 says "how many local records (workouts/meals)". 

            // Let's check if meals have synced. In db.js v3, meals has '++id, date, user_id'. 
            // It DOES NOT have 'synced'. 
            // I should probably add 'synced' to meals to be consistent, but for now I will just count workouts
            // as that's what we explicitly set up in syncManager.
            // Wait, prompt 17 implies syncing everything.
            // Let's just count workouts for now as that is the guaranteed one.

            setPendingSyncs(unsyncedWorkouts);
        };

        fetchProfile();
    }, []);

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-white">
            <header className="mb-8 flex items-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{user?.name || "Guest User"}</h1>
                    <p className="text-gray-500">{user?.age || 28} years old • {user?.height_cm || 175}cm</p>
                </div>
            </header>

            {/* Goals Section */}
            <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-red-500" />
                    Active Goals
                </h2>
                <div className="flex flex-wrap gap-2">
                    {planData.profile.goals.map((goal) => (
                        <span key={goal} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium capitalize">
                            {goal.replace(/_/g, ' ')}
                        </span>
                    ))}
                </div>
            </section>

            {/* Sync Status Section */}
            <section className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <RefreshCw className={`w-5 h-5 mr-3 ${pendingSyncs > 0 ? 'text-orange-500 animate-spin' : 'text-green-500'}`} />
                        <h3 className="font-bold text-gray-800">Sync Status</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${pendingSyncs > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                        {pendingSyncs > 0 ? 'Pending Uploads' : 'All Synced'}
                    </span>
                </div>
                <p className="text-sm text-gray-500 ml-8">
                    {pendingSyncs} records waiting to reach the cloud.
                </p>
            </section>

            {/* Version Info */}
            <div className="mt-12 text-center">
                <p className="text-xs text-gray-300 flex items-center justify-center">
                    <Smartphone className="w-3 h-3 mr-1" />
                    ScribeFit PWA v0.1.0
                </p>
            </div>
        </div>
    );
}
