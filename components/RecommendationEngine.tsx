"use client";

import React, { useEffect, useState } from 'react';
import { generateRecommendations, Recommendation } from '@/lib/recommendations';
import { Sparkles, ArrowRight, Activity, Droplets, Zap, Clock } from 'lucide-react';
import { useTheme } from 'next-themes';

interface RecommendationEngineProps {
    currentUserId: number | null;
}

export default function RecommendationEngine({ currentUserId }: RecommendationEngineProps) {
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!currentUserId) return;

        const load = async () => {
            const recs = await generateRecommendations(currentUserId);
            // Just show top priority one for now to keep UI clean
            if (recs.length > 0) {
                setRecommendation(recs[0]);
            }
        };
        load();
    }, [currentUserId]);

    if (!recommendation) return null;

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'workout': return <Activity className="w-5 h-5 text-indigo-500" />;
            case 'hydration': return <Droplets className="w-5 h-5 text-blue-500" />;
            case 'nutrition': return <Zap className="w-5 h-5 text-orange-500" />;
            case 'habit': return <Clock className="w-5 h-5 text-purple-500" />;
            default: return <Sparkles className="w-5 h-5 text-yellow-500" />;
        }
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-100 dark:border-slate-700 p-5 rounded-[24px] shadow-sm mb-8 animate-fade-in-up transition-colors duration-300">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="bg-white dark:bg-slate-700 p-1.5 rounded-lg shadow-sm">
                            {getIcon(recommendation.category)}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                            Smart Insight
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight mb-1">
                        {recommendation.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {recommendation.message}
                    </p>
                </div>
            </div>
        </div>
    );
}
