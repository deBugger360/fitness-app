"use client";

import React, { useEffect, useState } from 'react';
import { getReflections, Reflection } from '@/features/reflections/ReflectionsLogic';
import { BadgeCheck, BadgeAlert, BadgeInfo, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function RecentReflections({ userId }: { userId: string }) {
    const [reflections, setReflections] = useState<Reflection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReflections = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('reflections')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) setReflections(data as Reflection[]);
            setLoading(false);
        };
        fetchReflections();
    }, [userId]);

    if (loading) return <div className="animate-pulse h-32 bg-slate-100 dark:bg-slate-900 rounded-xl w-full"></div>;

    if (reflections.length === 0) return (
        <div className="text-center p-10 text-slate-400 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 border-dashed flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <BadgeInfo className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-medium text-slate-500">No reflections logged yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Your insights will appear here once you start journaling.</p>
        </div>
    );

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Insights</h3>
            <div className="space-y-4">
                {reflections.map((entry) => (
                    <div key={entry.id} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-slate-400 font-medium">
                                {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${entry.quality === 'positive' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                entry.quality === 'negative' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                {entry.quality}
                            </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">{entry.content}</p>

                        {entry.suggestions.length > 0 && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg mt-2">
                                <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium flex items-start">
                                    <Sparkles className="w-3 h-3 mr-2" />
                                    {entry.suggestions[0]}
                                </p>
                            </div>
                        )}

                        {entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {entry.tags.map(tag => (
                                    <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md px-2 py-0.5">
                                        #{tag.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
