"use client";

import React, { useState } from 'react';
import { analyzeRealityLog, Mood, RealityAnalysis } from '@/features/reality/logic';
import { saveRealityLog } from '@/features/reality/db';
import { Trash2, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

const MOODS: { id: Mood, label: string, icon: string }[] = [
    { id: 'stressed', label: 'Stressed', icon: '😫' },
    { id: 'bored', label: 'Bored', icon: '😐' },
    { id: 'celebrating', label: 'Celebrating', icon: '🎉' },
    { id: 'hungry', label: 'Actually Hungry', icon: '🍽️' },
    { id: 'sad', label: 'Sad', icon: '😢' },
    { id: 'tired', label: 'Tired', icon: '😴' },
    { id: 'anxious', label: 'Anxious', icon: '😰' }
];

export default function RealityLogger({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState<'trigger' | 'form' | 'analysis'>('trigger');
    const [foods, setFoods] = useState('');
    const [mood, setMood] = useState<Mood | null>(null);
    const [analysis, setAnalysis] = useState<RealityAnalysis | null>(null);
    const [saving, setSaving] = useState(false);

    const handleAnalyze = async () => {
        if (!foods || !mood) return;
        const result = analyzeRealityLog(foods, mood);
        setAnalysis(result);
        setStep('analysis');

        // Optimistic Save
        setSaving(true);
        try {
            await saveRealityLog(foods, mood, result.calorieDensity, result.tags, result.suggestions.join('\n'));
            setSaving(false);
        } catch (e) {
            console.error(e);
            setSaving(false);
        }
    };

    if (step === 'trigger') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 animate-pulse">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Reality Check</h2>
                <p className="text-slate-500 mb-8 max-w-xs">Honesty is the baseline for change. Log exactly what happened without judgment.</p>
                <button
                    onClick={() => setStep('form')}
                    className="w-full max-w-xs bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl dark:shadow-none transition-transform active:scale-95 flex items-center justify-center"
                >
                    I Ate Something Unhealthy
                    <ArrowRight className="ml-2 w-5 h-5" />
                </button>
            </div>
        );
    }

    if (step === 'form') {
        return (
            <div className="p-6 max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold mb-6">What happened?</h3>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">1. How were you feeling?</label>
                    <div className="grid grid-cols-3 gap-3">
                        {MOODS.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMood(m.id)}
                                className={`p-3 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center h-24 ${mood === m.id
                                    ? 'bg-indigo-600 border-indigo-600 text-white dark:shadow-none scale-105'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <span className="text-3xl mb-2">{m.icon}</span>
                                <span className="text-[9px] font-bold uppercase tracking-wider">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">2. What did you eat?</label>
                    <textarea
                        value={foods}
                        onChange={(e) => setFoods(e.target.value)}
                        placeholder="e.g. 2 slices of pizza, large fries, chocolate bar..."
                        className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl p-4 min-h-[120px] outline-none border focus:border-indigo-500 transition-colors resize-none text-sm font-medium"
                    />
                </div>

                <button
                    disabled={!mood || !foods}
                    onClick={handleAnalyze}
                    className="w-full bg-indigo-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl disabled:shadow-none transition-all flex items-center justify-center"
                >
                    Analyze Impact
                    <ArrowRight className="ml-2 w-5 h-5" />
                </button>
            </div>
        );
    }

    if (step === 'analysis' && analysis) {
        return (
            <div className="p-6 max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 animate-fade-in-up">
                <div className="flex items-center justify-center -mt-12 mb-6">
                    <div className="bg-indigo-600 text-white p-4 rounded-full">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                </div>

                <h3 className="text-center text-xl font-bold mb-2">Logged. No Judgment.</h3>
                <p className="text-center text-xs text-slate-400 uppercase tracking-widest font-bold mb-8">ENTRY SAVED</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800 flex flex-col items-center">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">DENSITY</span>
                        <span className="text-xl font-black text-orange-600 dark:text-orange-400">{analysis.calorieDensity}</span>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
                        {analysis.tags.length > 0 ? (
                            analysis.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full uppercase text-slate-600 dark:text-slate-300">{tag}</span>
                            ))
                        ) : (
                            <span className="text-xs text-slate-400">No Tags</span>
                        )}
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 mb-6">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Suggestion
                    </h4>
                    <ul className="space-y-2">
                        {analysis.suggestions.map((s, i) => (
                            <li key={i} className="text-sm font-medium text-indigo-900 dark:text-indigo-200 leading-relaxed">• {s}</li>
                        ))}
                    </ul>
                </div>

                <button
                    onClick={() => {
                        setStep('trigger');
                        setFoods('');
                        setMood(null);
                        setAnalysis(null);
                        onComplete();
                    }}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl transition-colors"
                >
                    Close & Continue
                </button>
            </div>
        );
    }

    return null;
}
