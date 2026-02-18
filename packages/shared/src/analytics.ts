export type EventCategory = 'workout' | 'nutrition' | 'behavior' | 'biometrics' | 'reflection';
export type EventAction =
    | 'log_workout'
    | 'log_meal'
    | 'log_sugar'
    | 'log_reflection'
    | 'log_weight'
    | 'daily_foundation'
    | 'fasting_log';

export interface AnalyticsEvent {
    userId: string;
    category: EventCategory;
    action: EventAction;
    value?: number;
    tags?: string[];
    context?: Record<string, any>;
    occurredAt?: string;
}

// Helper function to normalize Foundation data
export const createFoundationEvent = (userId: string, principles: string[], score: number): AnalyticsEvent => {
    return {
        userId,
        category: 'behavior',
        action: 'daily_foundation',
        value: score,
        tags: principles, // Completed principles become tags
        context: {
            principle_count: principles.length
        }
    };
};

// Helper function to normalize Meal data
export const createMealEvent = (userId: string, description: string, quality: string): AnalyticsEvent => {
    // Map quality strictly to tags
    const tags = [quality];
    // Simple sentiment score from quality
    let value = 0;
    if (quality === 'healthy') value = 1;
    if (quality === 'moderate') value = 0.5;
    if (quality === 'unhealthy') value = -1;

    return {
        userId,
        category: 'nutrition',
        action: 'log_meal',
        value: value,
        tags: tags,
        context: {
            description
        }
    };
};

// Helper function to normalize Reflection data
export const createReflectionEvent = (userId: string, quality: string, score: number, tags: string[]): AnalyticsEvent => {
    return {
        userId,
        category: 'reflection',
        action: 'log_reflection',
        value: score,
        tags: [quality, ...tags],
        context: {
            sentiment_quality: quality
        }
    };
};
