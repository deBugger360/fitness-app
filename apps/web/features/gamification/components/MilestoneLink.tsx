"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Trophy, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface MilestoneLinkProps {
    currentUserId: string | null;
}

export default function MilestoneLink({ currentUserId }: MilestoneLinkProps) {
    const [nextMilestone, setNextMilestone] = useState<any>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!currentUserId) return;

        const findNextMilestone = async () => {
            const supabase = createClient();
            const { count } = await supabase
                .from('workouts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUserId);

            const workouts = count || 0;

            // Simple logic: determine next major milestone based on count
            // 1 -> 5 -> 20 -> 100
            let target = 1;
            let title = "First Step";
            if (workouts >= 1) { target = 5; title = "Work Week Warrior"; }
            if (workouts >= 5) { target = 20; title = "Monthly Master"; }
            if (workouts >= 20) { target = 100; title = "Century Club"; }

            setNextMilestone({
                title,
                current: workouts,
                target,
                remaining: target - workouts
            });
        };

        findNextMilestone();
    }, [currentUserId]);

    if (!nextMilestone) return null;

    const progress = Math.min((nextMilestone.current / nextMilestone.target) * 100, 100);

    return (
        <Link href="/profile">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 p-4 rounded-3xl text-white shadow-lg shadow-indigo-200 dark:shadow-none mb-6 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-500"></div>

                <div className="relative z-10 flex-1">
                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-indigo-100 mb-1">
                        <Trophy className="w-3 h-3 mr-1.5" />
                        Next Milestone
                    </div>
                    <h3 className="text-xl font-bold">{nextMilestone.title}</h3>
                    <div className="mt-2 w-full max-w-[140px] h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-[10px] font-medium mt-1 text-indigo-100">
                        {nextMilestone.remaining} workouts to go
                    </p>
                </div>

                <div className="relative z-10 bg-white/20 p-2 rounded-full backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    <ChevronRight className="w-5 h-5 text-white" />
                </div>
            </div>
        </Link>
    );
}
