"use client";

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useRouter } from 'next/navigation';
import { User, Activity, Ruler, Weight, Target, ArrowRight, Camera, Check, Flame, Zap, Dumbbell, Sparkles } from 'lucide-react';

const steps = [
    { id: 1, title: "Welcome!", subtitle: "Let's personalize your experience." },
    { id: 2, title: "About You", subtitle: "Help us tailor your plan." },
    { id: 3, title: "Body Stats", subtitle: "Track your progress." },
    { id: 4, title: "Lifestyle", subtitle: "How active are you?" },
    { id: 5, title: "Focus", subtitle: "What are your top goals?" },
    { id: 6, title: "Profile Photo", subtitle: "Make it yours." }
];

const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
    { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
    { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' }
];

const goalOptions = [
    { value: 'fat_loss', label: 'Fat Loss', icon: Flame },
    { value: 'stamina', label: 'Stamina', icon: Zap },
    { value: 'strength', label: 'Strength', icon: Dumbbell },
    { value: 'flexibility', label: 'Flexibility', icon: Sparkles }
];

export default function OnboardingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        height_cm: '',
        weight_kg: '',
        activity_level: '',
        goals: [] as string[],
        photo: null as string | null
    });
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (step < steps.length) {
            setStep(step + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleGoal = (goal: string) => {
        setFormData(prev => {
            const goals = prev.goals.includes(goal)
                ? prev.goals.filter(g => g !== goal)
                : [...prev.goals, goal];
            return { ...prev, goals };
        });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('photo', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Check if ANY user exists (to update instead of create duplicates if re-running)
            // But usually onboarding is for new users.
            // Let's clear any partial "Default Athlete" if it exists or update it.
            const existing = await db.table('users').limit(1).first();

            const userData = {
                name: formData.name,
                age: parseInt(formData.name) || 25, // Fallback if parsing fails, though unlikely with number type input
                gender: formData.gender,
                height_cm: parseFloat(formData.height_cm),
                weight_kg: parseFloat(formData.weight_kg),
                activity_level: formData.activity_level,
                goals: formData.goals, // Stored as array
                photo: formData.photo,
                onboarded: true // Mark as onboarded
            };

            if (Object.keys(userData).includes('age')) {
                userData.age = parseInt(formData.age) || 0;
            }

            if (existing) {
                await db.table('users').update(existing.id, userData);
            } else {
                await db.table('users').add(userData);
            }

            // Redirect to dashboard
            router.push('/');
        } catch (error) {
            console.error("Onboarding error:", error);
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        switch (step) {
            case 1: return formData.name.length > 0;
            case 2: return formData.age && formData.gender;
            case 3: return formData.height_cm && formData.weight_kg;
            case 4: return formData.activity_level;
            case 5: return formData.goals.length > 0;
            case 6: return true; // Photo optional
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between p-6 pb-12 transition-colors duration-300">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full mb-8 transition-colors duration-300">
                <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${(step / steps.length) * 100}%` }}
                />
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 transition-colors duration-300">
                    {steps[step - 1].title}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">
                    {steps[step - 1].subtitle}
                </p>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto">
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors duration-300">What should we call you?</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 outline-none font-bold text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-300"
                            placeholder="Your Name"
                            autoFocus
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Gender</label>
                            <div className="grid grid-cols-2 gap-4">
                                {['Male', 'Female'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => handleChange('gender', g)}
                                        className={`p-4 rounded-2xl border-2 font-bold transition-all duration-300 ${formData.gender === g
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 dark:border-indigo-500'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => handleChange('age', e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none font-bold text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-300"
                                placeholder="25"
                            />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Height (cm)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.height_cm}
                                    onChange={(e) => handleChange('height_cm', e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none font-bold text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-300"
                                    placeholder="175"
                                />
                                <Ruler className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 transition-colors duration-300" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Current Weight (kg)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.weight_kg}
                                    onChange={(e) => handleChange('weight_kg', e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none font-bold text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors duration-300"
                                    placeholder="75.0"
                                />
                                <Weight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 transition-colors duration-300" />
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        {activityLevels.map(level => (
                            <button
                                key={level.value}
                                onClick={() => handleChange('activity_level', level.value)}
                                className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 ${formData.activity_level === level.value
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 ring-1 ring-indigo-600 dark:ring-indigo-500 dark:border-indigo-500'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <div className="font-bold text-slate-900 dark:text-white transition-colors duration-300">{level.label}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">{level.desc}</div>
                            </button>
                        ))}
                    </div>
                )}

                {step === 5 && (
                    <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                        {goalOptions.map(goal => (
                            <button
                                key={goal.value}
                                onClick={() => toggleGoal(goal.value)}
                                className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-300 aspect-square ${formData.goals.includes(goal.value)
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600 dark:ring-indigo-500 dark:border-indigo-500'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                    }`}
                            >
                                <goal.icon className="w-8 h-8 mb-2" />
                                <span className="font-bold text-sm">{goal.label}</span>
                                {formData.goals.includes(goal.value) && (
                                    <div className="mt-2 bg-indigo-600 text-white rounded-full p-1">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {step === 6 && (
                    <div className="flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-800 mb-6 overflow-hidden relative border-4 border-white dark:border-slate-700 shadow-lg dark:shadow-none transition-colors duration-300">
                            {formData.photo ? (
                                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors duration-300">
                                    <User className="w-12 h-12" />
                                </div>
                            )}
                        </div>

                        <label className="cursor-pointer bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center shadow-sm dark:shadow-none">
                            <Camera className="w-5 h-5 mr-2" />
                            Upload Photo
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </label>

                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-4 text-center px-8 transition-colors duration-300">
                            This creates your personal avatar in the app. You can skip this if you prefer.
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex gap-4">
                {step > 1 && (
                    <button
                        onClick={handleBack}
                        className="px-6 py-4 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors duration-300"
                    >
                        Back
                    </button>
                )}
                <button
                    onClick={handleNext}
                    disabled={!isStepValid() || loading}
                    className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center transition-all duration-300 ${isStepValid() && !loading
                        ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                        : 'bg-indigo-300 dark:bg-indigo-900/50 cursor-not-allowed'
                        }`}
                >
                    {loading ? 'Setting up...' : step === steps.length ? 'Finish Setup' : 'Continue'}
                    {!loading && step < steps.length && <ArrowRight className="w-5 h-5 ml-2" />}
                </button>
            </div>
        </div>
    );
}
