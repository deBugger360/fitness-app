"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import planData from '@/fitness_plan.json';
import { Save, Coffee, Utensils } from 'lucide-react';

interface MealLoggerProps {
    currentUserId: number | null;
}

const MealLogger: React.FC<MealLoggerProps> = ({ currentUserId }) => {
    const [lunch, setLunch] = useState<{ protein: string, carb: string, veg: string }>({ protein: '', carb: '', veg: '' });
    const [dinner, setDinner] = useState<{ protein: string, carb: string, veg: string }>({ protein: '', carb: '', veg: '' });
    const [greenTeaCups, setGreenTeaCups] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    // Load existing data for today
    useEffect(() => {
        if (!currentUserId) return;
        const loadToday = async () => {
            const today = new Date().toISOString().split('T')[0];
            const log = await db.table('meals')
                .where('date').equals(today)
                .and(item => item.user_id === currentUserId)
                .first();

            if (log) {
                setGreenTeaCups(log.green_tea_cups || 0);
                // Simple parsing if saved as string previously, or just empty if new
                // Ideally schema matches, but for now we treat the select boxes as the "builder"
                // and the saved string as the result. 
                // We won't parse back the string into the complex object for this simple demo 
                // unless we stored it structurally. 
                // For this demo, simply letting users log 'new' meals for the day or overwriting works 
                // to show the 'Entry System' capabilities. 
            }
        };
        loadToday();
    }, [currentUserId]);

    const handleSave = async () => {
        if (!currentUserId) return;
        const today = new Date().toISOString().split('T')[0];

        const lunchStr = `${lunch.protein} + ${lunch.carb} + ${lunch.veg}`;
        const dinnerStr = `${dinner.protein} + ${dinner.carb} + ${dinner.veg}`;

        try {
            const existing = await db.table('meals')
                .where('date').equals(today)
                .and(item => item.user_id === currentUserId)
                .first();

            if (existing) {
                await db.table('meals').update(existing.id, {
                    lunch: lunchStr.length > 6 ? lunchStr : existing.lunch, // Only update if actually selected
                    dinner: dinnerStr.length > 6 ? dinnerStr : existing.dinner,
                    green_tea_cups: greenTeaCups
                });
            } else {
                await db.table('meals').add({
                    user_id: currentUserId,
                    date: today,
                    lunch: lunchStr.length > 6 ? lunchStr : '',
                    dinner: dinnerStr.length > 6 ? dinnerStr : '',
                    water_liters: 0, // preserved by specific water logger typically, but initializing here if new row
                    green_tea_cups: greenTeaCups
                });
            }
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save meal:", error);
        }
    };

    const MealSelect = ({ label, value, onChange, options }: any) => (
        <div className="mb-2">
            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="">Select {label}...</option>
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Lunch Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4 text-gray-800">
                    <Utensils className="w-5 h-5 mr-2 text-orange-500" />
                    <h3 className="font-bold">Log Lunch</h3>
                </div>
                <MealSelect
                    label="Protein"
                    options={planData.meal_options.proteins}
                    value={lunch.protein}
                    onChange={(v: string) => setLunch(prev => ({ ...prev, protein: v }))}
                />
                <MealSelect
                    label="Carbs"
                    options={planData.meal_options.carbs}
                    value={lunch.carb}
                    onChange={(v: string) => setLunch(prev => ({ ...prev, carb: v }))}
                />
                <MealSelect
                    label="Vegetables"
                    options={planData.meal_options.vegetables}
                    value={lunch.veg}
                    onChange={(v: string) => setLunch(prev => ({ ...prev, veg: v }))}
                />
            </div>

            {/* Dinner Section */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4 text-gray-800">
                    <h3 className="font-bold">Log Dinner</h3>
                </div>
                <MealSelect
                    label="Protein"
                    options={planData.meal_options.proteins}
                    value={dinner.protein}
                    onChange={(v: string) => setDinner(prev => ({ ...prev, protein: v }))}
                />
                <MealSelect
                    label="Carbs"
                    options={planData.meal_options.carbs}
                    value={dinner.carb}
                    onChange={(v: string) => setDinner(prev => ({ ...prev, carb: v }))}
                />
                <MealSelect
                    label="Vegetables"
                    options={planData.meal_options.vegetables}
                    value={dinner.veg}
                    onChange={(v: string) => setDinner(prev => ({ ...prev, veg: v }))}
                />
            </div>

            {/* Green Tea Section */}
            <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="p-3 bg-white rounded-full text-green-600 shadow-sm mr-4">
                        <Coffee className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-green-900">Green Tea</h3>
                        <p className="text-sm text-green-700">Goal: 2 cups</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 bg-white px-3 py-1 rounded-xl shadow-sm">
                    <button
                        onClick={() => setGreenTeaCups(Math.max(0, greenTeaCups - 1))}
                        className="text-lg font-bold text-gray-400 hover:text-green-600 w-8"
                    >-</button>
                    <span className="font-bold text-xl text-gray-800 w-4 text-center">{greenTeaCups}</span>
                    <button
                        onClick={() => setGreenTeaCups(greenTeaCups + 1)}
                        className="text-lg font-bold text-gray-400 hover:text-green-600 w-8"
                    >+</button>
                </div>
            </div>

            <button
                onClick={handleSave}
                disabled={isSaved}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all ${isSaved
                    ? 'bg-green-500 text-white'
                    : 'bg-black text-white hover:bg-gray-800'
                    }`}
            >
                {isSaved ? (
                    <>Saved Successfully!</>
                ) : (
                    <>
                        <Save className="w-5 h-5 mr-2" />
                        Save Daily Log
                    </>
                )}
            </button>
        </div>
    );
};

export default MealLogger;
