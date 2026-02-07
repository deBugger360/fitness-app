"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { AlertTriangle, ThumbsUp, Moon } from "lucide-react";

interface SugarLoggerProps {
    currentUserId: number | null;
    onLogAdded: () => void;
}

const SugarLogger: React.FC<SugarLoggerProps> = ({ currentUserId, onLogAdded }) => {
    const [mode, setMode] = useState<'craving' | 'slip'>('craving');
    const [item, setItem] = useState("");
    const [trigger, setTrigger] = useState("boredom");
    const [intensity, setIntensity] = useState(5);
    const [replacement, setReplacement] = useState("");

    const triggers = ["boredom", "stress", "hunger", "social", "late_night"];
    const replacements = ["drank_water", "ate_fruit", "ginger_chew", "distracted_self", "none"];

    const handleLog = async (success: boolean) => {
        if (!currentUserId) return;

        const now = new Date();
        const isLateNight = now.getHours() >= 21 || now.getHours() < 5;

        const logData = {
            user_id: currentUserId,
            date: now.toISOString().split('T')[0],
            timestamp: now.toISOString(),
            type: mode === 'slip' ? 'intake' : 'craving',
            item: item || (mode === 'slip' ? 'Unknown Sugar' : 'Generic Craving'),
            intensity,
            trigger,
            replacement_action: replacement,
            success_resisted: success, // True if craving resisted, False if slip
            is_late_night: isLateNight
        };

        try {
            await db.table('sugar_logs').add(logData);
            onLogAdded();
            // Reset
            setItem("");
            setIntensity(5);
        } catch (e) {
            console.error("Log failed", e);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setMode('craving')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${mode === 'craving' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-gray-50 text-gray-500'}`}
                >
                    Start Craving
                </button>
                <button
                    onClick={() => setMode('slip')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${mode === 'slip' ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-gray-50 text-gray-500'}`}
                >
                    I Slipped Up
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">What triggered it?</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {triggers.map(t => (
                            <button
                                key={t}
                                onClick={() => setTrigger(t)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${trigger === t ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                {t.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Intensity (1-10)</label>
                    <input
                        type="range" min="1" max="10" step="1"
                        value={intensity}
                        onChange={(e) => setIntensity(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Mild</span>
                        <span>Unbearable</span>
                    </div>
                </div>

                {mode === 'craving' && (
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Replacement Action?</label>
                        <select
                            value={replacement}
                            onChange={(e) => setReplacement(e.target.value)}
                            className="w-full mt-1 p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                        >
                            <option value="">What will you do instead?</option>
                            {replacements.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                )}

                {mode === 'slip' && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Don't beat yourself up. Log it and move on.
                    </div>
                )}

                <button
                    onClick={() => handleLog(mode === 'craving')}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg mt-2 ${mode === 'craving' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-500 hover:bg-red-600'}`}
                >
                    {mode === 'craving' ? 'Log Craving & Action' : 'Log Intake'}
                </button>
            </div>
        </div>
    );
};

export default SugarLogger;
