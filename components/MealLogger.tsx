"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import planData from '@/fitness_plan.json';
import { Save, Coffee, Utensils, Zap, Clock, ChevronDown } from 'lucide-react';

interface MealLoggerProps {
    currentUserId: number | null;
}

const MealLogger: React.FC<MealLoggerProps> = ({ currentUserId }) => {
    const [lunch, setLunch] = useState<{ protein: string, carb: string, veg: string }>({ protein: '', carb: '', veg: '' });
    const [dinner, setDinner] = useState<{ protein: string, carb: string, veg: string }>({ protein: '', carb: '', veg: '' });
    const [greenTeaCups, setGreenTeaCups] = useState(0);
    const [ifCompliant, setIfCompliant] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Quick Combos for common Nigerian meals
    const quickCombos = [
        { name: "Beans & Plantain", p: "beans", c: "plantain", v: "vegetables" },
        { name: "Yam & Eggs", p: "eggs", c: "yam", v: "vegetables" },
        { name: "Potato & Fish Stew", p: "fish", c: "potatoes", v: "spinach" },
        { name: "Chicken & Salad", p: "chicken", c: "", v: "cabbage" }
    ];

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
                setIfCompliant(log.if_compliant || false);
                // Parsing logic could go here if we wanted to restore dropdowns from string
                // But for "Speed" we prioritize new entry unless complex logic added. 
            }
        };
        loadToday();
    }, [currentUserId]);

    const handleQuickAdd = (type: 'lunch' | 'dinner', combo: any) => {
        if (type === 'lunch') {
            setLunch({ protein: combo.p, carb: combo.c, veg: combo.v });
        } else {
            setDinner({ protein: combo.p, carb: combo.c, veg: combo.v });
        }
    };

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

            const payload: any = {
                user_id: currentUserId,
                date: today,
                green_tea_cups: greenTeaCups,
                if_compliant: ifCompliant
            };

            // Only overwrite meal strings if user actually selected something
            if (lunchStr.length > 6) payload.lunch = lunchStr;
            if (dinnerStr.length > 6) payload.dinner = dinnerStr;

            if (existing) {
                await db.table('meals').update(existing.id, payload);
            } else {
                await db.table('meals').add({
                    ...payload,
                    lunch: payload.lunch || '',
                    dinner: payload.dinner || '',
                    water_liters: 0 // handled by WaterCounter
                });
            }
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save meal:", error);
        }
    };

    const MealSelect = ({ label, value, onChange, options }: any) => (
        <div className="mb-3 w-full relative group">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none p-3 pr-10 bg-slate-50 rounded-2xl border-2 border-slate-100 text-slate-900 font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer group-hover:border-slate-200"
                >
                    <option value="" className="text-slate-400">Select...</option>
                    {options.map((opt: string) => (
                        <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-5 h-5" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* IF Compliance - High Priority */}
            <div className={`p-4 rounded-3xl border flex items-center justify-between cursor-pointer transition-colors ${ifCompliant ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100'}`}
                onClick={() => setIfCompliant(!ifCompliant)}
            >
                <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${ifCompliant ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={`font-bold ${ifCompliant ? 'text-purple-900' : 'text-gray-700'}`}>Fasting Goal</h3>
                        <p className="text-xs text-gray-500">12:00 PM - 6:00 PM Window</p>
                    </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${ifCompliant ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                    {ifCompliant && <Save className="w-3 h-3 text-white" />}
                </div>
            </div>

            {/* Quick Logging Section */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4 text-gray-800">
                    <Utensils className="w-5 h-5 mr-2 text-orange-500" />
                    <h3 className="font-bold">Meal Log</h3>
                </div>

                {/* Lunch Tab */}
                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Lunch</label>
                    <div className="flex overflow-x-auto space-x-2 pb-2 mb-2 no-scrollbar">
                        {quickCombos.map((combo) => (
                            <button
                                key={combo.name}
                                onClick={() => handleQuickAdd('lunch', combo)}
                                className="whitespace-nowrap px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-100 hover:bg-orange-100"
                            >
                                + {combo.name}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <MealSelect label="Protein" options={planData.meal_options.proteins} value={lunch.protein} onChange={(v: string) => setLunch({ ...lunch, protein: v })} />
                        <MealSelect label="Carb" options={planData.meal_options.carbs} value={lunch.carb} onChange={(v: string) => setLunch({ ...lunch, carb: v })} />
                        <MealSelect label="Veg" options={planData.meal_options.vegetables} value={lunch.veg} onChange={(v: string) => setLunch({ ...lunch, veg: v })} />
                    </div>
                </div>

                {/* Dinner Tab */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Dinner</label>
                    <div className="flex overflow-x-auto space-x-2 pb-2 mb-2 no-scrollbar">
                        {quickCombos.map((combo) => (
                            <button
                                key={combo.name}
                                onClick={() => handleQuickAdd('dinner', combo)}
                                className="whitespace-nowrap px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-100 hover:bg-orange-100"
                            >
                                + {combo.name}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <MealSelect label="Protein" options={planData.meal_options.proteins} value={dinner.protein} onChange={(v: string) => setDinner({ ...dinner, protein: v })} />
                        <MealSelect label="Carb" options={planData.meal_options.carbs} value={dinner.carb} onChange={(v: string) => setDinner({ ...dinner, carb: v })} />
                        <MealSelect label="Veg" options={planData.meal_options.vegetables} value={dinner.veg} onChange={(v: string) => setDinner({ ...dinner, veg: v })} />
                    </div>
                </div>
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
                        Save Nutrition Log
                    </>
                )}
            </button>
        </div>
    );
};

export default MealLogger;
