import { createClient } from "@/utils/supabase/client";

export interface Reflection {
    id: string;
    user_id: string;
    date: string;
    timestamp: string;
    content: string;
    quality: 'positive' | 'neutral' | 'negative';
    tags: string[];
    suggestions: string[];
    sentiment_score: number;
}

export const analyzeReflection = (text: string): { quality: 'positive' | 'neutral' | 'negative', tags: string[], suggestions: string[], score: number } => {
    const lowerText = text.toLowerCase();
    const tags: string[] = [];
    let score = 0;
    const suggestions: string[] = [];

    // Simple keyword analysis
    // Positive Indicators
    if (lowerText.match(/completed|achieved|great|good|happy|energy|strong|focused/)) {
        score += 2;
        tags.push('positive_mood');
    }
    if (lowerText.match(/water|hydrated|drank/)) {
        score += 1;
        tags.push('hydration');
    }
    if (lowerText.match(/workout|exercise|run|gym|walk/)) {
        score += 2;
        tags.push('movement');
    }
    if (lowerText.match(/salad|vegetables|protein|healthy/)) {
        score += 2;
        tags.push('nutrition');
    }

    // Negative Indicators
    if (lowerText.match(/tired|exhausted|stress|bad|sad|lazy/)) {
        score -= 2;
        tags.push('negative_mood');
        suggestions.push("Try a 5-minute meditation to reset.");
    }
    if (lowerText.match(/sugar|candy|soda|cake|sweet/)) {
        score -= 2;
        tags.push('sugar_intake');
        suggestions.push("Drink 2 glasses of water to flush out the sugar.");
    }
    if (lowerText.match(/late|night|snack/)) {
        score -= 1;
        tags.push('late_eating');
        suggestions.push("Try herbal tea instead of late-night snacks.");
    }
    if (lowerText.match(/missed|skip|failed/)) {
        score -= 1;
        tags.push('missed_goal');
        suggestions.push("Don't worry about the slip. Focus on the next immediate win.");
    }

    // Determine Quality
    let quality: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (score >= 2) quality = 'positive';
    if (score <= -2) quality = 'negative';

    return { quality, tags, suggestions, score };
};

import { logAnalyticsEvent } from "@/lib/analyticsService";

export const saveReflection = async (userId: string, content: string) => {
    const supabase = createClient();
    const analysis = analyzeReflection(content);

    const { data, error } = await supabase
        .from('reflections')
        .insert({
            user_id: userId,
            content,
            quality: analysis.quality,
            tags: analysis.tags,
            suggestions: analysis.suggestions,
            sentiment_score: analysis.score,
            date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

    if (error) throw error;

    // Log Normalized Event for ML
    logAnalyticsEvent({
        userId,
        category: 'reflection',
        action: 'log_reflection',
        value: analysis.score,
        tags: [analysis.quality, ...analysis.tags],
        context: {
            sentiment_quality: analysis.quality,
            has_suggestions: analysis.suggestions.length > 0
        }
    });

    return data;
};

export const getReflections = async (userId: string, limit = 5) => {
    const supabase = createClient();
    const { data } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);
    return data || [];
};
