"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ShieldAlert, Trophy, TrendingDown } from "lucide-react";
import CravingTimer from "@/features/sugar/components/CravingTimer";
import SugarLogger from "@/features/sugar/components/SugarLogger";

export default function SugarPage() {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [streak, setStreak] = useState(0);
    const [phase, setPhase] = useState("Reduction");

    useEffect(() => {
        const initUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        initUser();
    }, []);

    const fetchLogs = async () => {
        if (!currentUserId) return;
        const supabase = createClient();

        // Fetch last 10 logs
        const { data: history } = await supabase
            .from('sugar_logs')
            .select('*')
            .eq('user_id', currentUserId)
            .order('timestamp', { ascending: false })
            .limit(10);

        if (history) setLogs(history);

        // Calc Streak (Consecutive days without 'intake' type logs)
        // Simplified logic: Count days since last 'intake'
        const { data: lastSlip } = await supabase
            .from('sugar_logs')
            .select('*')
            .eq('user_id', currentUserId)
            .eq('type', 'intake')
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (lastSlip) {
            const lastDate = new Date(lastSlip.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1; // -1 to not count today if slipped today
            setStreak(Math.max(0, diffDays));
        } else {
            // No slips ever? Or just started.
            // If data exists, calc days since start? Or just 0 if no data?
            // For now, let's leave it simple.
            setStreak(0);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [currentUserId]);

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Sugar Guard</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 flex items-center text-lg font-medium transition-colors duration-300">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mr-3 transition-colors duration-300 ${phase === 'Reduction' ? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                            {phase}
                        </span>
                        <span className="text-slate-900 dark:text-white font-bold transition-colors duration-300">{streak}</span>
                        <span className="text-slate-400 dark:text-slate-500 ml-1 transition-colors duration-300">day streak</span>
                    </p>
                </div>
            </header>

            <div className="mb-8">
                <CravingTimer onComplete={() => alert("Great job! Now log your victory.")} />
            </div>

            <div className="mb-10">
                <SugarLogger currentUserId={currentUserId} onLogAdded={fetchLogs} />
            </div>

            {/* Recent History */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider transition-colors duration-300">Recent Activity</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-300">View All</span>
                </div>

                <div className="space-y-4">
                    {logs.length === 0 && (
                        <div className="text-center py-10 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors duration-300">
                            <p className="text-slate-400 dark:text-slate-600 text-sm italic transition-colors duration-300">No logs yet. Stay strong!</p>
                        </div>
                    )}
                    {logs.map(log => (
                        <div key={log.id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-2xl border border-white dark:border-slate-800 shadow-sm hover:shadow-md dark:shadow-none transition-all flex justify-between items-center group">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-xl mr-4 transition-transform group-hover:scale-110 ${log.type === 'intake' ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-500 dark:text-green-400'}`}>
                                    {log.type === 'intake' ? <ShieldAlert className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white capitalize tracking-tight transition-colors duration-300">{log.trigger} {log.type === 'intake' ? 'Slip' : 'Resisted'}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 transition-colors duration-300">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.type === 'intake' ? 'Consumed sugar' : `Used: ${log.replacement_action.replace('_', ' ')}`}</p>
                                </div>
                            </div>
                            {log.is_late_night && (
                                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-bold px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-wide transition-colors duration-300">Late Night</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
