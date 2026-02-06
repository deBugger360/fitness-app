"use client";

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, Footprints } from 'lucide-react';

interface DailyStats {
    date: string;
    day: string;
    walk_minutes: number;
    pushups: number;
}

export default function StatsPage() {
    const [data, setData] = useState<DailyStats[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Resolve User
            let userId = 1;
            try {
                const user = await db.table('users').limit(1).first();
                if (user) {
                    userId = user.id;
                }
                setCurrentUserId(userId);

                // 2. Calculate Date Range (Last 7 Days)
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 6);

                const startStr = startDate.toISOString().split('T')[0];
                const endStr = endDate.toISOString().split('T')[0];

                // 3. Fetch Data
                const workouts = await db.table('workouts')
                    .where('date')
                    .between(startStr, endStr, true, true)
                    .and(w => w.user_id === userId)
                    .toArray();

                // 4. Process Data
                const statsMap = new Map<string, DailyStats>();

                // Initialize last 7 days with 0
                for (let i = 0; i < 7; i++) {
                    const d = new Date();
                    d.setDate(endDate.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0];
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                    statsMap.set(dateStr, { date: dateStr, day: dayName, walk_minutes: 0, pushups: 0 });
                }

                // Fill with actual data
                workouts.forEach(w => {
                    if (statsMap.has(w.date)) {
                        const entry = statsMap.get(w.date)!;
                        // Note: Currently the dashboard only tracks 'exercisesCompleted'. 
                        // For this visualization, we'll try to find explicit fields if they exist (future proofing),
                        // OR infer from completion list.

                        // Explicit fields
                        if (w.walk_minutes) entry.walk_minutes += w.walk_minutes;
                        if (w.pushups) entry.pushups += w.pushups;

                        // Inference fallback (just for demo purposes if explicit data missing)
                        // If specific exercises are checked, we assign 'dummy' reasonable values 
                        // so the chart isn't empty during this demo phase.
                        if (!w.walk_minutes && !w.pushups && w.exercisesCompleted) {
                            if (w.exercisesCompleted.some((e: string) => e.includes('walk'))) {
                                entry.walk_minutes = 30; // Assume 30 mins if checked
                            }
                            if (w.exercisesCompleted.some((e: string) => e.includes('pushups'))) {
                                entry.pushups = 20; // Assume 20 reps if checked
                            }
                        }
                    }
                });

                // Convert Map to Array and Sort by Date
                const sortedData = Array.from(statsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
                setData(sortedData);

            } catch (err) {
                console.error("Error loading stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex h-screen items-center justify-center text-gray-400">Loading stats...</div>;
    }

    // Check if totally empty (sum of all values is 0)
    const isEmpty = data.every(d => d.walk_minutes === 0 && d.pushups === 0);

    return (
        <div className="pb-24 px-6 pt-10 min-h-screen bg-gray-50">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Your Progress
                </h1>
                <p className="text-gray-500 mt-1">Last 7 Days Activity</p>
            </header>

            {isEmpty ? (
                <div className="flex flex-col items-center justify-center p-10 bg-white rounded-3xl shadow-sm border border-gray-100 text-center mt-10">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No data yet</h3>
                    <p className="text-gray-500 mb-6 max-w-[200px]">
                        No data for today—get moving and log your first workout!
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Walk Minutes Chart */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <Footprints className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Walking</h3>
                                <p className="text-xs text-gray-400">Duration (minutes)</p>
                            </div>
                        </div>

                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="walk_minutes" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Pushups Chart */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-orange-100 rounded-lg mr-3">
                                <Activity className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Pushups</h3>
                                <p className="text-xs text-gray-400">Repetitions</p>
                            </div>
                        </div>

                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="pushups" fill="#ea580c" radius={[6, 6, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
