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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <Scale className="w-5 h-5 mr-2 text-indigo-500" />
                        Log Body Stats
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                            placeholder="e.g. 75.5"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Waist (cm)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={waist}
                            onChange={(e) => setWaist(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                            placeholder="e.g. 80"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                            placeholder="How do you feel?"
                            rows={3}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                        {saving ? 'Saving...' : 'Save Log'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WeightLogModal;
