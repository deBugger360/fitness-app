"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import RealityLogger from '@/features/reality/components/RealityLogger';
import { getRealityLogs } from '@/features/reality/db';
import { AlertTriangle, Clock } from 'lucide-react';

export default function RealityPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const loadLogs = async (uid: string) => {
        const today = new Date().toISOString().split('T')[0];
        // For now just fetch today's logs or recent logs? 
        // Let's fetch recent logs (maybe today and yesterday?)
        // The DB function `getRealityLogs` filter by date. I might want to update it to get *recent* logs.
        // Or just show today's logs for now.
        try {
            const data = await getRealityLogs(uid, today);
            setLogs(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        const init = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                loadLogs(user.id);
            }
            setLoading(false);
        };
        init();
    }, []);

    const handleLogComplete = () => {
        if (userId) loadLogs(userId);
    };

    if (loading) return <div className="p-10 text-center">Loading Reality Check...</div>;

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Reality Check</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Log the hard moments to understand the pattern.</p>
            </header>

            <section className="mb-12">
                <RealityLogger onComplete={handleLogComplete} />
            </section>

            {logs.length > 0 && (
                <section>
                    <div className="flex items-center mb-4">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Today's Logs</h2>
                    </div>

                    <div className="space-y-4">
                        {logs.map(log => (
                            <div key={log.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full">
                                        {log.mood}
                                    </span>
                                    <span className="text-xs text-slate-400">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3 line-clamp-2">
                                    {log.foods}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {log.tags && log.tags.map((tag: string) => (
                                        <span key={tag} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md uppercase">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
