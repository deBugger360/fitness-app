"use client";

import React, { useState, useEffect } from "react";
import { Timer, XCircle } from "lucide-react";

const CravingTimer = ({ onComplete }: { onComplete: () => void }) => {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval: any = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            onComplete();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, onComplete]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(600);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!isActive && timeLeft === 600) {
        return (
            <button
                onClick={toggleTimer}
                className="w-full bg-indigo-600 active:bg-indigo-700 text-white p-5 rounded-[24px] flex items-center justify-center font-bold text-lg shadow-xl shadow-indigo-100 dark:shadow-none hover:shadow-indigo-200 dark:hover:shadow-none transition-all transform active:scale-[0.98]"
            >
                <Timer className="w-6 h-6 mr-3" />
                Start 10-Min Craving Rule
            </button>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[32px] text-center relative overflow-hidden shadow-xl shadow-slate-50 dark:shadow-none transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800 transition-colors duration-300">
                <div
                    className="h-full bg-indigo-500 transition-all duration-1000 ease-linear rounded-r-full"
                    style={{ width: `${(timeLeft / 600) * 100}%` }}
                />
            </div>

            <h3 className="text-slate-900 dark:text-white font-bold mb-1 text-lg transition-colors duration-300">Wait it out...</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 font-medium transition-colors duration-300">Most cravings pass in 10 minutes.</p>

            <div className="text-6xl font-sans font-black text-slate-800 dark:text-white mb-8 tracking-tighter tabular-nums transition-colors duration-300">
                {formatTime(timeLeft)}
            </div>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={toggleTimer}
                    className={`px-6 py-3 rounded-2xl font-bold text-sm transition-colors duration-300 ${isActive ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'}`}
                >
                    {isActive ? 'Pause Timer' : 'Resume'}
                </button>
                <button
                    onClick={resetTimer}
                    className="px-4 py-3 rounded-2xl font-bold text-sm bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CravingTimer;
