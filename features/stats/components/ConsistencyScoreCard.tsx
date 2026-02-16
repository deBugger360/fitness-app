import React, { useMemo } from 'react';
import { calculateDailyScore, DailyScore, WEIGHTS } from '@/features/stats/logic/consistency';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Star, Trophy } from 'lucide-react';

// ...

// In AreaChart:
<Tooltip
    contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
    itemStyle={{ color: '#c7d2fe' }}
    formatter={(val: any) => [`${val}`, 'Score']}
    labelFormatter={() => ''}
/>

interface Props {
    workoutData: any[];
    sugarData: any[];
    mealData: any[];
    foundationData: any[];
}

export default function ConsistencyScoreCard({ workoutData, sugarData, mealData, foundationData }: Props) {
    const scores = useMemo(() => {
        const result: DailyScore[] = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Need to pass relevant data slices
            const dayWorkouts = workoutData.filter(w => w.date === dateStr);
            const daySugar = sugarData.filter(s => s.date === dateStr);
            const dayMeal = mealData.find(m => m.date === dateStr);
            const dayFoundation = foundationData.find(f => f.date === dateStr);

            const score = calculateDailyScore(dateStr, dayWorkouts, daySugar, dayMeal ? [dayMeal] : [], dayFoundation ? [dayFoundation] : []);
            result.push(score);
        }
        return result;
    }, [workoutData, sugarData, mealData, foundationData]);

    const todayScore = scores[scores.length - 1];

    // Streak logic
    const streak = useMemo(() => {
        let count = 0;
        for (let i = scores.length - 1; i >= 0; i--) {
            if (scores[i].totalScore >= 70) count++;
            else break;
        }
        return count;
    }, [scores]);

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-violet-900 to-slate-900 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-500/10 mb-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/20 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                {/* Left: Score Circle */}
                <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                        {/* Circular Progress SVG */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="56"
                                cy="56"
                                r="52"
                                fill="transparent"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="56"
                                cy="56"
                                r="52"
                                fill="transparent"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                strokeDasharray={327}
                                strokeDashoffset={327 - (327 * todayScore.totalScore) / 100}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black tracking-tight">{todayScore.totalScore}</span>
                            <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-widest">Score</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold">Daily Consistency</h2>
                            {streak > 2 && (
                                <span className="bg-orange-500/20 text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-orange-500/30">
                                    <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                                    {streak} Day Streak
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-indigo-200/80 max-w-[200px] leading-relaxed">
                            Based on your Diet, Movement, Sleep, and Sugar control today.
                        </p>
                    </div>
                </div>

                {/* Right: Mini Weekly Trend */}
                <div className="w-full md:w-48 h-24 bg-white/5 rounded-2xl p-2 border border-white/10 backdrop-blur-sm">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={scores}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                itemStyle={{ color: '#c7d2fe' }}
                                formatter={(val: number | string | undefined) => [`${val}`, 'Score']}
                                labelFormatter={() => ''}
                            />
                            <Area
                                type="monotone"
                                dataKey="totalScore"
                                stroke="#818cf8"
                                fillOpacity={1}
                                fill="url(#colorScore)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Breakdown Badges */}
            <div className="mt-6 flex flex-wrap gap-2">
                <Badge label="Diet" score={todayScore.breakdown.diet} max={40} />
                <Badge label="Move" score={todayScore.breakdown.movement} max={25} />
                <Badge label="Sleep" score={todayScore.breakdown.sleep} max={20} />
                <Badge label="Sugar" score={todayScore.breakdown.sugar} max={15} />
            </div>

            {/* Missed Opportunities Message */}
            {todayScore.missedSignals.length > 0 && todayScore.totalScore < 100 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs font-medium text-indigo-200 flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="opacity-80">To improve:</span>
                        <span className="text-white">{todayScore.missedSignals[0]}</span>
                    </p>
                </div>
            )}
        </div>
    );
}

function Badge({ label, score, max }: { label: string, score: number, max: number }) {
    const percentage = score / max;
    let color = 'bg-white/5 text-slate-300';
    if (percentage === 1) color = 'bg-green-500/20 text-green-300 border-green-500/30';
    else if (percentage >= 0.5) color = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';

    return (
        <div className={`px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 transition-colors ${color}`}>
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">{label}</span>
            <span className="text-xs font-bold">{score}/{max}</span>
        </div>
    );
}
