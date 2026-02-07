"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { ShieldAlert, Trophy, TrendingDown } from "lucide-react";
import CravingTimer from "@/components/sugar/CravingTimer";
import SugarLogger from "@/components/sugar/SugarLogger";

export default function SugarPage() {
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [streak, setStreak] = useState(0);
    const [phase, setPhase] = useState("Reduction");

    useEffect(() => {
        const initUser = async () => {
            let userId = 1;
            const user = await db.table('users').limit(1).first();
            if (user) userId = user.id;
            setCurrentUserId(userId);
        };
        initUser();
    }, []);

    const fetchLogs = async () => {
        if (!currentUserId) return;
        const history = await db.table('sugar_logs')
            .where('user_id').equals(currentUserId)
            .reverse()
            .limit(10)
            .toArray();
        setLogs(history);

        // Calc Streak (Consecutive days without 'intake' type logs)
        // Simplified logic: Count days since last 'intake'
        const lastSlip = await db.table('sugar_logs')
            .where('user_id').equals(currentUserId)
            .and(l => l.type === 'intake')
            .reverse()
            .first();

        if (lastSlip) {
            const lastDate = new Date(lastSlip.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1; // -1 to not count today if slipped today
            setStreak(Math.max(0, diffDays));
        } else {
            // No slips ever? Or just started.
            // If data exists, calc days since start. If empty, 0.
            setStreak(0); // improving this requires fetching first log date, keeping simple for now.
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [currentUserId]);

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50">
            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Sugar Guard</h1>
                    <p className="text-slate-500 mt-2 flex items-center text-lg font-medium">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mr-3 ${phase === 'Reduction' ? 'bg-blue-100/80 text-blue-700' : 'bg-red-100/80 text-red-700'}`}>
                            {phase}
                        </span>
                        <span className="text-slate-900 font-bold">{streak}</span>
                        <span className="text-slate-400 ml-1">day streak</span>
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
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Recent Activity</h3>
                    <span className="text-xs text-slate-400 font-medium cursor-pointer hover:text-slate-600">View All</span>
                </div>

                <div className="space-y-4">
                    {logs.length === 0 && (
                        <div className="text-center py-10 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm italic">No logs yet. Stay strong!</p>
                        </div>
                    )}
                    {logs.map(log => (
                        <div key={log.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-xl mr-4 transition-transform group-hover:scale-110 ${log.type === 'intake' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                    {log.type === 'intake' ? <ShieldAlert className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800 capitalize tracking-tight">{log.trigger} {log.type === 'intake' ? 'Slip' : 'Resisted'}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.type === 'intake' ? 'Consumed sugar' : `Used: ${log.replacement_action.replace('_', ' ')}`}</p>
                                </div>
                            </div>
                            {log.is_late_night && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded-lg border border-indigo-100 uppercase tracking-wide">Late Night</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
