import { createClient } from "@/utils/supabase/client";
import {
    AnalyticsEvent,
    createFoundationEvent,
    createMealEvent,
    createReflectionEvent,
    EventCategory,
    EventAction
} from "@repo/shared";
import { logAnalyticsEvent as logSharedEvent } from "@repo/lib";

export type { EventCategory, EventAction };

// Wrapper for shared analytics logging
export const logAnalyticsEvent = async (event: AnalyticsEvent) => {
    const supabase = createClient();
    await logSharedEvent(supabase, event);
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
