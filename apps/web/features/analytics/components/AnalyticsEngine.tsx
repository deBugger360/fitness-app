"use client";

import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ComposedChart } from 'recharts'; // Added ComposedChart/Line
import { Activity, ShieldAlert, Droplets, Zap, TrendingUp, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface AnalyticsProps {
    workoutData: any[];
    sugarData: any[]; // { date, type, is_late_night }
    mealData: any[];  // { date, water_liters, if_compliant }
}

const AnalyticsEngine: React.FC<AnalyticsProps> = ({ workoutData, sugarData, mealData }) => {

    const processedData = useMemo(() => {
        const last7Days = [];
        const today = new Date();
        const stats = {
            sugarFreeDays: 0,
            lateNightSlips: 0,
            workoutConsistency: 0,
            waterVsCravings: [] as any[]
        };

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

            const dayWorkouts = workoutData.filter(w => w.date === dateStr);
            const daySugar = sugarData.filter(s => s.date === dateStr);
            const dayMeals = mealData.find(m => m.date === dateStr);

            const hasWorkout = dayWorkouts.length > 0 && dayWorkouts.some(w => w.morning_hiit_completed || w.exercisesCompleted?.length > 0);
            const sugarIntakeCount = daySugar.filter(s => s.type === 'intake').length;
            const sugarCravingResisted = daySugar.filter(s => s.type === 'craving' && s.success_resisted).length;
            const water = dayMeals?.water_liters || 0;

            if (sugarIntakeCount === 0) stats.sugarFreeDays++;

            // Late night slips
            const lateSlips = daySugar.filter(s => s.type === 'intake' && s.is_late_night).length;
            stats.lateNightSlips += lateSlips;

            last7Days.push({
                day: dayName,
                date: dateStr,
                workout: hasWorkout ? 100 : 0, // 100% or 0% for simple bar
                sugar: sugarIntakeCount, // count of slips
                resisted: sugarCravingResisted,
                water: water,
                lateSlip: lateSlips
            });
        }

        stats.workoutConsistency = Math.round((last7Days.filter(d => d.workout > 0).length / 7) * 100);

        return { chartData: last7Days, summary: stats };
    }, [workoutData, sugarData, mealData]);

    const { chartData, summary } = processedData;

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="space-y-6">

            {/* 1. Signals Summary */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col justify-between transition-colors duration-300">
                    <span className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold mb-2 transition-colors duration-300">Consistency</span>
                    <div className="flex items-end">
                        <span className="text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{summary.workoutConsistency}%</span>
                        {summary.workoutConsistency >= 70 ? (
                            <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400 mb-1 ml-2 transition-colors duration-300" />
                        ) : (
                            <div className="text-xs text-orange-500 dark:text-orange-400 mb-1 ml-2 font-medium transition-colors duration-300">Needs Work</div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-none flex flex-col justify-between transition-colors duration-300">
                    <span className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold mb-2 transition-colors duration-300">Sugar Free</span>
                    <div className="flex items-end">
                        <span className="text-3xl font-bold text-gray-800 dark:text-white transition-colors duration-300">{summary.sugarFreeDays}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 mb-1 ml-1 transition-colors duration-300">/ 7 Days</span>
                    </div>
                </div>
            </div>

            {/* 2. Sugar vs Performance Correlation */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <div className="flex items-center mb-6 justify-between">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3 transition-colors duration-300">
                            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white transition-colors duration-300">Sugar vs. Workout</h3>
                            <p className="text-xs text-gray-400 dark:text-slate-500 transition-colors duration-300">Does sugar kill your streak?</p>
                        </div>
                    </div>
                </div>

                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f0f0f0"} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#aaa' }} dy={10} />
                            <YAxis yAxisId="left" hide />
                            <YAxis yAxisId="right" orientation="right" hide />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                    backgroundColor: isDark ? '#1e293b' : '#fff',
                                    color: isDark ? '#fff' : '#000'
                                }}
                            />
                            {/* Consistency Bar */}
                            <Bar yAxisId="left" dataKey="workout" fill={isDark ? "#3730a3" : "#e0e7ff"} radius={[4, 4, 0, 0]} barSize={20} name="Workout Done %" />
                            {/* Sugar Slips Line */}
                            <Line yAxisId="right" type="monotone" dataKey="sugar" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} name="Sugar Slips" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300">
                    <div className="flex items-center"><div className={`w-3 h-3 rounded mr-2 transition-colors ${isDark ? 'bg-indigo-900' : 'bg-indigo-100'}`}></div>Workout</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>Sugar Slips</div>
                </div>
            </div>

            {/* 3. Late Night Vulnerability */}
            <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-900/30 transition-colors duration-300">
                <div className="flex items-start">
                    <div className="p-2 bg-white dark:bg-orange-900/30 rounded-full text-orange-500 dark:text-orange-400 shadow-sm dark:shadow-none mr-3 transition-colors duration-300">
                        <Moon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-orange-900 dark:text-orange-200 transition-colors duration-300">Late Night Danger Zone</h3>
                        <p className="text-sm text-orange-800 dark:text-orange-300 mt-1 opacity-80 transition-colors duration-300">
                            {summary.lateNightSlips > 0
                                ? `You had ${summary.lateNightSlips} cravings/slips after 9PM this week. Try drinking herbal tea instead.`
                                : "Great job! No late night snacking detected this week."}
                        </p>
                    </div>
                </div>
            </div>

            {/* 4. Water vs Cravings */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm dark:shadow-none border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <div className="flex items-center mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3 transition-colors duration-300">
                        <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400 transition-colors duration-300" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 dark:text-white transition-colors duration-300">Hydration Impact</h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500 transition-colors duration-300">Water (L) vs. Cravings Resisted</p>
                    </div>
                </div>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f0f0f0"} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#aaa' }} dy={10} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                    backgroundColor: isDark ? '#1e293b' : '#fff',
                                    color: isDark ? '#fff' : '#000'
                                }}
                            />
                            <Bar dataKey="water" fill="#3b82f6" stackId="a" radius={[0, 0, 4, 4]} barSize={20} name="Water (L)" />
                            <Bar dataKey="resisted" fill="#22c55e" stackId="b" radius={[4, 4, 0, 0]} barSize={20} name="Cravings Resisted" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};

export default AnalyticsEngine;
