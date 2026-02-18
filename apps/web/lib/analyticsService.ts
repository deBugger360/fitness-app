import { createClient } from "@/utils/supabase/client";
import {
    AnalyticsEvent,
    createFoundationEvent,
    createMealEvent,
    createReflectionEvent,
    EventCategory,
    EventAction
} from "@repo/shared";

export type { EventCategory, EventAction };

// Re-export types for backward compatibility if needed, 
// but better to import from @repo/shared in other files.
// For now, let's keep the logging function here.

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
    const event = createFoundationEvent(userId, principles, score);
    logAnalyticsEvent(event);
};

// Helper function to normalize Meal data
export const normalizeMealLog = (userId: string, description: string, quality: string) => {
    const event = createMealEvent(userId, description, quality);
    logAnalyticsEvent(event);
};

// Helper function to normalize Reflection data
export const normalizeReflectionLog = (userId: string, quality: string, score: number, tags: string[]) => {
    const event = createReflectionEvent(userId, quality, score, tags);
    logAnalyticsEvent(event);
};
