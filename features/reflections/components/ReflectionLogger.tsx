"use client";

import React, { useState } from 'react';
import { getReflections, saveReflection } from '@/features/reflections/ReflectionsLogic';
import { Feather, Edit3, MessageSquare, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface ReflectionLoggerProps {
    userId: string;
    onEntrySaved?: () => void;
}

export default function ReflectionLogger({ userId, onEntrySaved }: ReflectionLoggerProps) {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSaving(true);
        try {
            await saveReflection(userId, content);
            toast({
                title: "Reflection Saved",
                description: "Your entry helps build a stronger mindset.",
            });
            setContent('');
            if (onEntrySaved) onEntrySaved();
        } catch (error) {
            console.error("Failed to save reflection:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center mb-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-xl text-indigo-600 dark:text-indigo-400 mr-3">
                    <Feather className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Reflection</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">What went well? What challenged you?</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="I felt really energetic after my morning run, but struggled with sugar cravings around 3pm..."
                    className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none mb-4 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                />
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving || !content.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSaving ? 'Saving...' : (
                            <>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Save Entry
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
