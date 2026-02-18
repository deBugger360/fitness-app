import { SupabaseClient } from '@supabase/supabase-js';
import { AnalyticsEvent } from '@repo/shared';

export const logAnalyticsEvent = async (supabase: SupabaseClient, event: AnalyticsEvent) => {
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
