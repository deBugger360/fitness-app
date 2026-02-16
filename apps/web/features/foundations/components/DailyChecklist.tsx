"use client";

import React from 'react';
import { FoundationPrinciple } from "../constants";
import * as Icons from 'lucide-react';

interface DailyChecklistProps {
    principles: FoundationPrinciple[];
    completed: string[];
    notes: Record<string, string>;
    onToggle: (id: string) => void;
    onNoteChange: (id: string, note: string) => void;
}

export default function DailyChecklist({ principles, completed, notes, onToggle, onNoteChange }: DailyChecklistProps) {
    return (
        <div className="space-y-4">
            {principles.map(principle => {
                const isCompleted = completed.includes(principle.id);
                // Dynamically get icon
                const IconComponent = (Icons as any)[principle.icon] || Icons.HelpCircle;

                return (
                    <div key={principle.id} className={`p-4 rounded-2xl border transition-all duration-300 ${isCompleted
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'}`}>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center flex-1 cursor-pointer" onClick={() => onToggle(principle.id)}>
                                <div className={`p-2 rounded-xl mr-3 transition-colors ${isCompleted ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                                    <IconComponent className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className={`font-bold transition-colors ${isCompleted ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>{principle.name}</h3>
                                    <p className={`text-xs font-medium ${isCompleted ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>{principle.description}</p>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={() => onToggle(principle.id)}
                                    className="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 bg-white dark:bg-slate-800 cursor-pointer transition-all"
                                />
                            </div>
                        </div>

                        {/* Note Input / Sleep Hours Input */}
                        <div className={`mt-3 transition-all duration-300 overflow-hidden ${isCompleted || notes[principle.id] || principle.id === 'sleep_quality' ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                            {principle.id === 'sleep_quality' ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        max="24"
                                        step="0.5"
                                        placeholder="Hours slept..."
                                        // Extract number from "Hours: X" format
                                        value={notes[principle.id]?.replace('Hours: ', '') || ''}
                                        onChange={(e) => {
                                            const hours = parseFloat(e.target.value);
                                            // Store in specific format
                                            onNoteChange(principle.id, `Hours: ${e.target.value}`);

                                            // Auto-toggle based on 7h threshold
                                            const shouldBeChecked = hours >= 7;
                                            if (shouldBeChecked !== isCompleted) {
                                                onToggle(principle.id);
                                            }
                                        }}
                                        className="w-32 text-sm bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 dark:focus:border-indigo-700/50 transition-colors text-slate-700 dark:text-slate-300"
                                    />
                                    <span className="text-xs text-slate-500">hours</span>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={notes[principle.id] || ''}
                                    onChange={(e) => onNoteChange(principle.id, e.target.value)}
                                    placeholder="Add a quick note..."
                                    className="w-full text-xs bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-slate-700/50 rounded-lg px-3 py-2 outline-none focus:border-indigo-300 dark:focus:border-indigo-700/50 transition-colors text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
