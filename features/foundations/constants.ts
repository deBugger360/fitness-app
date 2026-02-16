export interface FoundationPrinciple {
    id: string;
    name: string;
    description: string;
    category: 'mind' | 'body' | 'spirit' | 'nutrition';
    icon: string; // lucide icon name
}

export const FOUNDATION_PRINCIPLES: FoundationPrinciple[] = [
    {
        id: 'sleep_quality',
        name: 'Sleep',
        description: '7+ hours of quality sleep',
        category: 'body',
        icon: 'Moon'
    },
    {
        id: 'hydration',
        name: 'Hydration',
        description: 'Drink 3L of water',
        category: 'nutrition',
        icon: 'Droplets'
    },
    {
        id: 'protein_intake',
        name: 'Protein',
        description: '30g protein at every meal',
        category: 'nutrition',
        icon: 'Utensils'
    },
    {
        id: 'movement',
        name: 'Movement',
        description: '30 mins of daily activity',
        category: 'body',
        icon: 'Activity'
    },
    {
        id: 'sunlight',
        name: 'Sunlight',
        description: 'Morning sunlight exposure',
        category: 'body',
        icon: 'Sun'
    },
    {
        id: 'mindfulness',
        name: 'Mindfulness',
        description: '10 mins meditation/prayer',
        category: 'spirit',
        icon: 'Brain'
    },
    {
        id: 'no_sugar',
        name: 'No Sugar',
        description: 'Avoid added sugar',
        category: 'nutrition',
        icon: 'ShieldOff'
    },
    {
        id: 'digital_detox',
        name: 'Digital Detox',
        description: 'No screens 1h before bed',
        category: 'mind',
        icon: 'SmartphoneOff'
    },
    {
        id: 'connection',
        name: 'Connection',
        description: 'Meaningful conversation',
        category: 'spirit',
        icon: 'Heart'
    },
    {
        id: 'learning',
        name: 'Learning',
        description: 'Read/Learn for 15 mins',
        category: 'mind',
        icon: 'Book'
    },
    {
        id: 'gratitude',
        name: 'Gratitude',
        description: 'Write down 3 things',
        category: 'spirit',
        icon: 'Feather'
    }
];

export interface FoundationLog {
    id?: string;
    user_id: string;
    date: string;
    completed_principles: string[];
    notes: Record<string, string>;
    score: number;
    created_at?: string;
}
