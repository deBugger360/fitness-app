import { createClient } from "@/utils/supabase/client";

export type EventCategory = 'workout' | 'nutrition' | 'behavior' | 'biometrics' | 'reflection';
export type EventAction =
    | 'log_workout'
    | 'log_meal'
    | 'log_sugar'
    | 'log_reflection'
    | 'log_weight'
    | 'daily_foundation'
    | 'fasting_log';

interface AnalyticsEvent {
    userId: string;
    category: EventCategory;
    action: EventAction;
    value?: number;
    tags?: string[];
    context?: Record<string, any>;
    occurredAt?: string;
}

export const logAnalyticsEvent = async (event: AnalyticsEvent) => {
    const supabase = createClient();

    try {
        const { error } = await supabase.from('analytics_events').insert({
            user_id: event.userId,
            event_category: event.category,
            event_action: event.action,
            value: event.value || 0,
            tags: event.tags || [],
            context: event.context || {},
            occurred_at: event.occurredAt || new Date().toISOString()
        });

        if (error) {
            console.error("Error logging analytics event:", error);
            // Don't throw, let app continue. It's just analytics.
        }
    } catch (e) {
        console.error("Exception logging analytics event:", e);
    }
};

// Helper function to normalize Foundation data
export const normalizeFoundationLog = (userId: string, principles: string[], score: number) => {
    logAnalyticsEvent({
        userId,
        category: 'behavior',
        action: 'daily_foundation',
        value: score,
        tags: principles, // Completed principles become tags
        context: {
            principle_count: principles.length
        }
    });
};

// Helper function to normalize Meal data
export const normalizeMealLog = (userId: string, description: string, quality: string) => {
    // Map quality strictly to tags
    const tags = [quality];
    // Simple sentiment score from quality
    let value = 0;
    if (quality === 'healthy') value = 1;
    if (quality === 'moderate') value = 0.5;
    if (quality === 'unhealthy') value = -1;

    logAnalyticsEvent({
        userId,
        category: 'nutrition',
        action: 'log_meal',
        value: value,
        tags: tags,
        context: {
            description
        }
    });
};

// Helper function to normalize Reflection data
export const normalizeReflectionLog = (userId: string, quality: string, score: number, tags: string[]) => {
    logAnalyticsEvent({
        userId,
        category: 'reflection',
        action: 'log_reflection',
        value: score,
        tags: [quality, ...tags],
        context: {
            sentiment_quality: quality
        }
    });
};
