"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { Scale, Check, X } from "lucide-react";

interface WeightLogModalProps {
    currentUserId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

const WeightLogModal: React.FC<WeightLogModalProps> = ({ currentUserId, isOpen, onClose }) => {
    const [weight, setWeight] = useState("");
    const [waist, setWaist] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserId) return;
        setSaving(true);

        try {
            await db.table('body_stats').add({
                user_id: currentUserId,
                date: new Date().toISOString(), // Full ISO timestamp for logs
                weight_kg: parseFloat(weight) || 0,
                waist_cm: parseFloat(waist) || 0,
                notes: notes
            });

            // Also update user profile if weight changed
            if (weight) {
                await db.table('users').update(currentUserId, { weight_kg: parseFloat(weight) });
            }

            setSaving(false);
            onClose();
            // Reset form
            setWeight("");
            setWaist("");
            setNotes("");
        } catch (error) {
            console.error("Failed to log weight:", error);
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] w-full max-w-sm p-8 shadow-2xl dark:shadow-none shadow-indigo-100 animate-scale-in ring-1 ring-slate-100 dark:ring-slate-800 transition-colors duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center tracking-tight transition-colors duration-300">
                        <Scale className="w-6 h-6 mr-3 text-indigo-500 fill-indigo-500" />
                        Log Stats
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Weight</label>
                        <div className="relative group">
                            <input
                                type="number"
                                step="0.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-full pl-5 pr-16 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 group-hover:border-slate-200 dark:group-hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 outline-none transition-all font-bold text-xl text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                placeholder="0.0"
                                required
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                <span className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-3 transition-colors duration-300"></span>
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-sm transition-colors duration-300">KG</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Waist Circumference</label>
                        <div className="relative group">
                            <input
                                type="number"
                                step="0.1"
                                value={waist}
                                onChange={(e) => setWaist(e.target.value)}
                                className="w-full pl-5 pr-16 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 group-hover:border-slate-200 dark:group-hover:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 outline-none transition-all font-bold text-xl text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                placeholder="0.0"
                            />
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                                <span className="h-6 w-px bg-slate-300 dark:bg-slate-600 mx-3 transition-colors duration-300"></span>
                                <span className="text-slate-500 dark:text-slate-400 font-bold text-sm transition-colors duration-300">CM</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 outline-none transition-all font-medium text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                            placeholder="How do you feel today?"
                            rows={3}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!weight || saving}
                        className="w-full bg-indigo-600 active:bg-indigo-700 text-white py-4 rounded-[20px] font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </span>
                        ) : 'Save Log'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WeightLogModal;
