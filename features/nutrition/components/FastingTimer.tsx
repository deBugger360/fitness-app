"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const FastingTimer: React.FC = () => {
    const [status, setStatus] = useState<"waiting" | "eating" | "closed">("waiting");
    const [timeLeft, setTimeLeft] = useState("");
    const [progress, setProgress] = useState(0);

    const START_HOUR = 12;
    const END_HOUR = 18;

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const start = new Date(now);
            start.setHours(START_HOUR, 0, 0, 0);

            const end = new Date(now);
            end.setHours(END_HOUR, 0, 0, 0);

            const currentTime = now.getTime();
            const startTime = start.getTime();
            const endTime = end.getTime();

            if (currentTime < startTime) {
                // Before window
                setStatus("waiting");
                const diff = startTime - currentTime;
                const hrs = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${hrs}h ${mins}m until window opens`);
                setProgress(0);
            } else if (currentTime >= startTime && currentTime < endTime) {
                // During window
                setStatus("eating");
                const totalDuration = endTime - startTime;
                const elapsed = currentTime - startTime;
                const remaining = endTime - currentTime;

                const hrs = Math.floor(remaining / (1000 * 60 * 60));
                const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

                setTimeLeft(`${hrs}h ${mins}m remaining`);
                setProgress((elapsed / totalDuration) * 100);
            } else {
                // After window
                setStatus("closed");
                setTimeLeft("Fasting window closed");
                setProgress(100);
            }
        }, 1000); // Update every second

        return () => clearInterval(timer);
    }, []);

    const getStatusColor = () => {
        if (status === "eating") return "text-orange-600 dark:text-orange-400"; // Active eating
        if (status === "waiting") return "text-blue-600 dark:text-blue-400";
        return "text-gray-500 dark:text-slate-500";
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center justify-between mb-4 transition-colors duration-300">
            <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 bg-gray-50 dark:bg-slate-800 shadow-inner group transition-colors duration-300`}>
                    <Clock className={`w-5 h-5 ${getStatusColor()}`} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-400 uppercase tracking-wide transition-colors duration-300">
                        {status === "eating" ? "Eating Window" : "Fasting Status"}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">{timeLeft}</p>
                </div>
            </div>

            {status === "eating" && (
                <div className="relative w-12 h-12 flex items-center justify-center">
                    {/* Simple SVG Circular Progress */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="24" cy="24" r="20" className="stroke-gray-100 dark:stroke-slate-800 transition-colors duration-300" strokeWidth="4" fill="none" />
                        <circle
                            cx="24" cy="24" r="20"
                            className="stroke-orange-600 dark:stroke-orange-500 transition-colors duration-300"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray="125.6"
                            strokeDashoffset={125.6 - (125.6 * progress) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
            )}
        </div>
    );
};

export default FastingTimer;
