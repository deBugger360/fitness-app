"use client";

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from 'next-themes';

interface ProgressGraphProps {
    data: any[]; // { date: string, score: number }
}

export default function ProgressGraph({ data }: ProgressGraphProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Calculate score %
    const formattedData = data.map(d => ({
        ...d,
        scorePct: (d.score / 11) * 100
    }));

    return (
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f0f0f0"} />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#aaa' }}
                        dy={10}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            color: isDark ? '#fff' : '#000'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="scorePct"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
