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
        <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden group hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-100/50 dark:group-hover:bg-indigo-900/20 transition-colors"></div>

            <div className="flex items-center mb-6 relative z-10">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400 mr-4 shadow-sm">
                    <Feather className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Journal</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Capture your thoughts & habits</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10">
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="How did you feel today? Any wins or challenges?"
                        className="w-full h-40 p-5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-base leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none mb-4 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 transition-all font-medium"
                    />
                    <div className="absolute bottom-6 right-4 text-[10px] font-bold text-slate-300 uppercase tracking-wider pointer-events-none">
                        {content.length} chars
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSaving || !content.trim()}
                    className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white py-4 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98]"
                >
                    {isSaving ? 'Saving...' : (
                        <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Save Reflection
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
