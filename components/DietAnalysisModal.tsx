"use client";

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { X, Sparkles, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface DietAnalysisModalProps {
    currentUserId: number | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function DietAnalysisModal({ currentUserId, isOpen, onClose }: DietAnalysisModalProps) {
    const [description, setDescription] = useState("");
    const [analysis, setAnalysis] = useState<{ quality: string; advice: string; correction: string } | null>(null);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const analyzeMeal = (text: string) => {
        const lowerText = text.toLowerCase();

        // 1. Nigerian & General Context Dictionary
        const signals = {
            unhealthy: [
                'soda', 'coke', 'fanta', 'sprite', 'pepsi', 'mineral', 'beer', 'alcohol', 'wine', // Drinks
                'puff puff', 'puff-puff', 'chin chin', 'chin-chin', 'gala', 'meat pie', 'sausage roll', 'buns', 'egg roll', // Snacks
                'cake', 'chocolate', 'candy', 'sugar', 'ice cream', 'cookies', 'donut', 'pastry',
                'agege bread', 'white bread', 'butter', 'margarine', 'jam',
                'indomie', 'instant noodles', 'processed', 'fries', 'burger', 'pizza', 'shawarma' // Fast food
            ],
            denseCarbs: [
                'pounded yam', 'iyan', 'eba', 'garri', 'amala', 'fufu', 'semovita', 'semo', 'tuwo', 'starch', // Swallows
                'white rice', 'jollof', 'fried rice', 'rice and stew', 'spaghetti', 'pasta', 'yam', 'potatoes',
                'fried plantain', 'dodo', 'bread'
            ],
            healthyProteins: [
                'chicken', 'turkey', 'fish', 'titus', 'catfish', 'croaker', 'snail', 'meat', 'beef', 'goat meat',
                'egg', 'eggs', 'moi moi', 'moi-moi', 'akara', 'beans', 'ewa', 'okpa'
            ],
            vegetables: [
                'vegetable soup', 'efo riro', 'edikang ikong', 'afang', 'okro', 'okra', 'ewedu', 'ogbono', 'egusi', 'bitter leaf', 'oha',
                'salad', 'cucumber', 'carrots', 'cabbage', 'ugly', 'spinach', 'greens', 'pepper soup'
            ],
            beneficialCarbs: [
                'oats', 'pap', 'akamu', 'ogi', 'brown rice', 'ofada', 'unripe plantain', 'sweet potato', 'corn', 'maize', 'boiled plantain'
            ]
        };

        let scores = { unhealthy: 0, denseCarbs: 0, healthyProteins: 0, vegetables: 0, beneficialCarbs: 0 };
        const matches: string[] = [];

        // Count occurrences
        Object.entries(signals).forEach(([category, keywords]) => {
            keywords.forEach(word => {
                if (lowerText.includes(word)) {
                    scores[category as keyof typeof scores]++;
                    matches.push(word);
                }
            });
        });

        // 2. Rule-Based Inference Engine (No hallucinations)
        let quality = 'moderate';
        let advice = "";
        let correction = "";
        let forecast = ""; // "Impact Forecast"

        // Scenario A: Junk / High Sugar dominant
        if (scores.unhealthy > 0) {
            quality = 'unhealthy';
            advice = "High sugar/processed content detected. This spikes insulin and triggers fat storage.";
            forecast = "Likely Energy Crash: You might feel tired in 1-2 hours due to blood sugar fluctuation.";
            correction = "Correction: Drink 2 glasses of water now to dilute sugar. NO more carbs today. Zero-carb dinner (e.g., Pepper Soup ONLY).";

            // Scenario B: "Swallow" or Dense Carb Heavy (The "Heavy Naija Lunch")
        } else if (scores.denseCarbs > 0) {
            if (scores.vegetables > 0 || scores.healthyProteins > 0) {
                // E.g., Pounded Yam + Egusi
                quality = 'moderate';
                advice = "Traditional staple meal. Good protein/fiber mix, but calorie-dense.";
                forecast = "Sustained Energy: Good for a workout day, but heavy for a sedentary day.";
                correction = "Optimization: Cut the 'swallow' portion by half next time. Add more soup/meat.";
            } else {
                // E.g., Just Bread, or White Rice + Stew (minimal veg)
                quality = 'unhealthy'; // Leaning unhealthy due to lack of fiber
                advice = "Carb-heavy meal with insufficient fiber/protein to slow digestion.";
                forecast = "Bloating Risk: High carb load without fiber may cause sluggishness.";
                correction = "Correction: Eat a cucumber or salad NOW to slow absorption. Walk for 15 mins.";
            }

            // Scenario C: Healthy Proteins/Veg dominant (e.g., Pepper soup, Moi-Moi, Salad)
        } else if (scores.healthyProteins > 0 || scores.vegetables > 0 || scores.beneficialCarbs > 0) {
            quality = 'healthy';
            advice = "Excellent nutrient density! This supports muscle repair and metabolism.";
            forecast = "Fat Burning Zone: Low insulin spike keeps you in fat-burning mode.";
            correction = "Great job! Keep hydrated to help digestion.";

            // Scenario D: Unknown inputs
        } else {
            quality = 'moderate';
            advice = "Could not identify specific Nigerian food items, assuming moderate calorie intake.";
            forecast = "Unknown Impact: Monitoring hunger levels is recommended.";
            correction = "General Advice: Drink water and ensure your next meal is protein-rich.";
        }

        return { quality, advice, correction: forecast + " " + correction };
    };

    const handleAnalyze = async () => {
        if (!description.trim()) return;
        setSaving(true);

        const result = analyzeMeal(description);
        setAnalysis(result);

        // Save to DB
        if (currentUserId) {
            try {
                await db.table('diet_reflections').add({
                    user_id: currentUserId,
                    date: new Date().toISOString(),
                    description: description,
                    quality: result.quality,
                    synced: 0
                });
            } catch (e) {
                console.error("Error logging reflection", e);
            }
        }
        setSaving(false);
    };

    const reset = () => {
        setAnalysis(null);
        setDescription("");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-scale-in">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                        <Sparkles className="w-6 h-6 mr-2 text-indigo-500 fill-indigo-100" />
                        Diet Analysis
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {!analysis ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">What did you eat?</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none font-medium text-slate-900 placeholder:text-slate-400 resize-none h-32"
                                placeholder="E.g., I had a burger and fries for lunch..."
                                autoFocus
                            />
                            <p className="text-xs text-slate-400 mt-2 font-medium">Be honest! We'll help you adjust.</p>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={!description.trim() || saving}
                            className="w-full bg-indigo-600 active:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center"
                        >
                            {saving ? 'Analyzing...' : 'Analyze My Meal'}
                            {!saving && <ArrowRight className="w-5 h-5 ml-2" />}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                        {/* Result Card */}
                        <div className={`p-6 rounded-2xl border-2 ${analysis.quality === 'healthy' ? 'bg-green-50 border-green-100 text-green-800' :
                            analysis.quality === 'moderate' ? 'bg-yellow-50 border-yellow-100 text-yellow-800' :
                                'bg-red-50 border-red-100 text-red-800'
                            }`}>
                            <div className="flex items-center mb-3">
                                {analysis.quality === 'healthy' && <CheckCircle className="w-6 h-6 mr-2" />}
                                {analysis.quality === 'moderate' && <Sparkles className="w-6 h-6 mr-2" />}
                                {analysis.quality === 'unhealthy' && <AlertTriangle className="w-6 h-6 mr-2" />}
                                <h4 className="text-lg font-bold capitalize">{analysis.quality} Choice</h4>
                            </div>
                            <p className="font-medium opacity-90">{analysis.advice}</p>
                        </div>

                        {/* Correction Plan */}
                        {(analysis.quality === 'unhealthy' || analysis.quality === 'moderate') && (
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <h5 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wider flex items-center">
                                    <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                                    Smart Correction
                                </h5>
                                <p className="text-slate-600 font-medium leading-relaxed">
                                    {analysis.correction}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={reset}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center p-4 hover:shadow-lg hover:shadow-slate-200"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
