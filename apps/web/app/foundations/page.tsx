"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import DailyChecklist from '@/features/foundations/components/DailyChecklist';
import WeeklyScore from '@/features/foundations/components/WeeklyScore';
import ProgressGraph from '@/features/foundations/components/ProgressGraph';
import TodayFocus from '@/features/foundations/components/TodayFocus';
import { FOUNDATION_PRINCIPLES } from '@/features/foundations/constants';
import { getFoundations, getWeeklyFoundations, saveFoundationLog } from '@/features/foundations/db';
import { BarChart, CheckCircle2, Trophy, ArrowRight, Edit3 } from 'lucide-react';
import ReflectionLogger from '@/features/reflections/components/ReflectionLogger';
import RecentReflections from '@/features/reflections/components/RecentReflections';

export default function FoundationsPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [todayCompleted, setTodayCompleted] = useState<string[]>([]);
    const [todayNotes, setTodayNotes] = useState<Record<string, string>>({});
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const todayDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);

                // Fetch today's log
                const todayLog = await getFoundations(user.id, todayDate);
                if (todayLog) {
                    setTodayCompleted(todayLog.completed_principles || []);
                    setTodayNotes(todayLog.notes || {});
                }

                // Fetch weekly history
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);
                const startStr = startDate.toISOString().split('T')[0];
                const endStr = endDate.toISOString().split('T')[0];

                const history = await getWeeklyFoundations(user.id, startStr, endStr);

                // Format history ensuring all days are present (fill gaps with 0)
                const formattedHistory = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(endDate.getDate() - i);
                    const dStr = d.toISOString().split('T')[0];
                    const found = history.find((h: any) => h.date === dStr);
                    formattedHistory.push({
                        date: dStr,
                        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                        score: found ? found.score : 0
                    });
                }
                setWeeklyData(formattedHistory);
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleToggle = async (id: string) => {
        if (!userId) return;

        let newCompleted;
        if (todayCompleted.includes(id)) {
            newCompleted = todayCompleted.filter(c => c !== id);
        } else {
            newCompleted = [...todayCompleted, id];
        }

        setTodayCompleted(newCompleted);
        // Optimistic update
        await saveFoundationLog(userId, todayDate, newCompleted, todayNotes);
    };

    const handleNoteChange = (id: string, note: string) => {
        const newNotes = { ...todayNotes, [id]: note };
        setTodayNotes(newNotes);
        // Debounce save in production, for now simplistic save on blur or separate effect?
        // Let's just update local state and maybe save on unmount or with a save button?
        // Actually, for better UX let's save immediately but maybe debounce the DB call if it was heavy.
        // For this demo, explicit save or update via effect is fine. 
        if (userId) {
            saveFoundationLog(userId, todayDate, todayCompleted, newNotes);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Foundations...</div>;

    const todayScore = Math.round((todayCompleted.length / FOUNDATION_PRINCIPLES.length) * 100);

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Foundations</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Daily Behavioral Protocol</p>
            </header>

            {/* Weekly Score & Graph */}
            <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <WeeklyScore data={weeklyData} />
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">7-Day Trend</h3>
                    <ProgressGraph data={weeklyData} />
                </div>
            </section>

            {/* Today's Focus */}
            <section className="mb-8">
                <div className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                        <Trophy className="w-4 h-4 mr-2" />
                        Today's Focus
                    </h2>
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Morning Sunlight</h3>
                            <p className="text-indigo-100 font-medium mb-4 leading-relaxed">
                                Get 10-20 minutes of direct sunlight within 1 hour of waking up to set your circadian rhythm.
                            </p>
                            <button
                                onClick={() => handleToggle('sunlight')}
                                disabled={todayCompleted.includes('sunlight')}
                                className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-transform hover:scale-105"
                            >
                                {todayCompleted.includes('sunlight') ? 'Completed' : 'Mark as Done'}
                                {!todayCompleted.includes('sunlight') && <ArrowRight className="w-4 h-4 ml-1" />}
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </section>

            {/* Daily Checklist */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Daily Protocol
                    </h2>
                    <span className={`text-sm font-bold ${todayScore >= 80 ? 'text-green-500' : 'text-indigo-500'}`}>
                        {todayScore}% Complete
                    </span>
                </div>

                <DailyChecklist
                    principles={FOUNDATION_PRINCIPLES}
                    completed={todayCompleted}
                    notes={todayNotes}
                    onToggle={handleToggle}
                    onNoteChange={handleNoteChange}
                />
            </section>

            {/* Reflections */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <Edit3 className="w-4 h-4 mr-2" />
                        Reflection
                    </h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {userId && <ReflectionLogger userId={userId} onEntrySaved={() => {
                        // Ideally trigger a refresh of the recent list
                        // For now we'll just rely on the user refreshing or navigating back
                        // Or we could move the RecentReflections key
                    }} />}
                    {userId && <RecentReflections userId={userId} />}
                </div>
            </section>
        </div>
    );
}
