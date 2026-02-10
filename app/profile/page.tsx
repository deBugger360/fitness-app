"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import planData from "@/fitness_plan.json";
import { User, RefreshCw, Smartphone, Target } from "lucide-react";
import Skeleton from "@/components/Skeleton";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [pendingSyncs, setPendingSyncs] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            // Fetch User
            const storedUser = await db.table('users').limit(1).first();
            if (storedUser) {
                setUser(storedUser);
            }

            // Check Sync Status (Syncd = 0)
            const unsyncedWorkouts = await db.table('workouts').where('synced').equals(0).count();
            setPendingSyncs(unsyncedWorkouts);
            setLoading(false);
        }

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 flex flex-col items-center">
                <Skeleton className="w-28 h-28 rounded-full mb-4" />
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-6" />
                <div className="w-full space-y-4">
                    <Skeleton className="h-32 w-full rounded-[24px]" />
                    <Skeleton className="h-24 w-full rounded-[24px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 animate-fade-in-up">
            <header className="mb-8 flex flex-col items-center justify-center text-center relative">
                <div className="w-28 h-28 rounded-full bg-slate-200 mb-4 shadow-xl shadow-indigo-100 border-4 border-white overflow-hidden relative">
                    {user?.photo ? (
                        <img src={user.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center text-indigo-600">
                            <span className="text-3xl font-bold">{user?.name?.charAt(0) || <User className="w-10 h-10" />}</span>
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.name || "Guest User"}</h1>
                <p className="text-slate-500 font-medium mt-1">
                    {user?.age || '--'} years • {user?.height_cm || '--'}cm • {user?.gender || 'Human'}
                </p>

                <div className="mt-4 flex gap-2 justify-center">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-100">
                        {user?.activity_level || 'Unknown Activity'}
                    </span>
                    <a href="/onboarding" className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors">
                        Edit Profile
                    </a>
                </div>
            </header>

            {/* Goals Section */}
            <section className="mb-6 bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                    <Target className="w-4 h-4 mr-2" />
                    Active Focus
                </h2>
                <div className="flex flex-wrap gap-2">
                    {(user?.goals && user.goals.length > 0 ? user.goals : planData.profile.goals).map((goal: string) => (
                        <span key={goal} className="px-4 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold capitalize border border-slate-100 shadow-sm">
                            {goal.replace(/_/g, ' ')}
                        </span>
                    ))}
                </div>
            </section>

            {/* Sync Status Section */}
            <section className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-12 -mt-12 opacity-50 ${pendingSyncs > 0 ? 'bg-orange-50' : 'bg-green-50'}`}></div>

                <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${pendingSyncs > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                            <RefreshCw className={`w-5 h-5 ${pendingSyncs > 0 ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Cloud Sync</h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                {pendingSyncs > 0 ? 'Syncing...' : 'Last synced just now'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={`mt-2 p-3 rounded-xl text-xs font-medium flex items-center justify-between ${pendingSyncs > 0 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                    <span>{pendingSyncs > 0 ? `${pendingSyncs} items pending` : 'All systems operational'}</span>
                    {pendingSyncs === 0 && <span className="text-lg">✨</span>}
                </div>
            </section>

            {/* Version Info */}
            {/* Version Info & Credits */}
            <div className="mt-12 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2 opacity-50">
                    Fitness Scribe v0.1.0
                </p>
                <a
                    href="https://www.linkedin.com/in/churchill-emmanuel-130725130/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                >
                    <p className="text-xs text-slate-400 font-medium hover:text-indigo-600 transition-colors">
                        Designed & Built by <span className="font-bold text-slate-500 hover:text-indigo-700">Churchill Emmanuel</span>
                    </p>
                </a>
            </div>
        </div>
    );
}
