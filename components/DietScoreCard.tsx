"use client";

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface DietScoreCardProps {
    currentUserId: number | null;
}

export default function DietScoreCard({ currentUserId }: DietScoreCardProps) {
    const [stats, setStats] = useState({ healthy: 0, moderate: 0, unhealthy: 0, total: 0 });
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUserId) return;

        const fetchStats = async () => {
            try {
                // Fetch all reflections (or limit to last 7/30 days)
                // For simplicity, let's just get all for now to show accumulated data
                const reflections = await db.table('diet_reflections')
                    .where('user_id').equals(currentUserId)
                    .toArray();

                let h = 0, m = 0, u = 0;
                reflections.forEach(r => {
                    if (r.quality === 'healthy') h++;
                    else if (r.quality === 'moderate') m++;
                    else u++;
                });

                const total = h + m + u;
                // Simple score: (Healthy * 1 + Moderate * 0.5) / Total * 100
                const calculatedScore = total > 0
                    ? Math.round(((h * 1 + m * 0.5) / total) * 100)
                    : 0;

                setStats({ healthy: h, moderate: m, unhealthy: u, total });
                setScore(calculatedScore);
            } catch (e) {
                console.error("Error fetching diet stats", e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Listen for changes? Real-time updates would be nice.
        // Dexie liveQuery could be used, but let's just use polling or props trigger if needed.
        // For now, simple fetch on mount.
    }, [currentUserId]);

    if (loading) return <div className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>;
    if (stats.total === 0) return null; // Don't show if no data

    return (
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-slate-900 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                        Diet Quality Score
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Based on your meal reflections</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold border ${score >= 80 ? 'bg-green-50 text-green-700 border-green-100' :
                        score >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            'bg-red-50 text-red-700 border-red-100'
                    }`}>
                    {score}/100
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4">
                <div style={{ width: `${(stats.healthy / stats.total) * 100}%` }} className="h-full bg-green-500 transition-all duration-500" />
                <div style={{ width: `${(stats.moderate / stats.total) * 100}%` }} className="h-full bg-yellow-400 transition-all duration-500" />
                <div style={{ width: `${(stats.unhealthy / stats.total) * 100}%` }} className="h-full bg-red-400 transition-all duration-500" />
            </div>

            {/* Legend */}
            <div className="flex justify-between text-xs font-semibold text-slate-500">
                <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    Healthy ({stats.healthy})
                </div>
                <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-400 mr-2" />
                    Moderate ({stats.moderate})
                </div>
                <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-400 mr-2" />
                    Unhealthy ({stats.unhealthy})
                </div>
            </div>
        </div>
    );
}
