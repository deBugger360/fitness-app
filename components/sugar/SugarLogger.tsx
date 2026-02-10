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
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setMode('craving')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors duration-300 ${mode === 'craving' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500 dark:ring-blue-800' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}
                >
                    Start Craving
                </button>
                <button
                    onClick={() => setMode('slip')}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors duration-300 ${mode === 'slip' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 ring-2 ring-red-500 dark:ring-red-800' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400'}`}
                >
                    I Slipped Up
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase transition-colors duration-300">What triggered it?</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {triggers.map(t => (
                            <button
                                key={t}
                                onClick={() => setTrigger(t)}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-300 ${trigger === t ? 'bg-gray-800 dark:bg-slate-700 text-white border-gray-800 dark:border-slate-600' : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800'}`}
                            >
                                {t.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase transition-colors duration-300">Intensity (1-10)</label>
                    <input
                        type="range" min="1" max="10" step="1"
                        value={intensity}
                        onChange={(e) => setIntensity(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2 transition-colors duration-300"
                    />
                    <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500 mt-1 transition-colors duration-300">
                        <span>Mild</span>
                        <span>Unbearable</span>
                    </div>
                </div>

                {mode === 'craving' && (
                    <div>
                        <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase transition-colors duration-300">Replacement Action?</label>
                        <select
                            value={replacement}
                            onChange={(e) => setReplacement(e.target.value)}
                            className="w-full mt-1 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 text-sm text-slate-800 dark:text-white transition-colors duration-300 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800"
                        >
                            <option value="" className="text-gray-400 dark:text-slate-500">What will you do instead?</option>
                            {replacements.map(r => <option key={r} value={r} className="dark:bg-slate-800">{r.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                )}

                {mode === 'slip' && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center transition-colors duration-300">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Don't beat yourself up. Log it and move on.
                    </div>
                )}

                <button
                    onClick={() => handleLog(mode === 'craving')}
                    disabled={mode === 'craving' && !replacement}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl active:shadow-none mt-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${mode === 'craving' ? 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500' : 'bg-red-500 hover:bg-red-600 dark:hover:bg-red-400'}`}
                >
                    {mode === 'craving' ? 'Log Craving & Action' : 'Log Intake'}
                </button>
            </div>
        </div>
    );
};

export default SugarLogger;
