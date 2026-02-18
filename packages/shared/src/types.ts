export * from '@repo/types';

// Keep legacy types if distinct, but favor @repo/types
export interface Recommendation {
    id: string;
    category: 'workout' | 'nutrition' | 'hydration' | 'habit';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
}

export interface Foundation {
    id?: string;
    user_id?: string;
    date: string;
    notes?: Record<string, any> | null;
    [key: string]: any;
}
