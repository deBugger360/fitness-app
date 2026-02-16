export type Mood = 'stressed' | 'bored' | 'celebrating' | 'hungry' | 'sad' | 'tired' | 'anxious';

export interface RealityAnalysis {
    calorieDensity: 'High' | 'Medium' | 'Low';
    tags: string[];
    suggestions: string[];
}

const HIGH_CALORIE_KEYWORDS = [
    'burger', 'pizza', 'fries', 'cake', 'ice cream', 'candy', 'soda', 'chips', 'chocolate', 'donut', 'cookie',
    'fried', 'bacon', 'cheese', 'pasta', 'bread', 'alcohol', 'beer', 'wine', 'cocktail', 'fast food',
    // Nigerian / Ekiti Specific
    'pounded yam', 'iyan', 'fufu', 'eba', 'garri', 'amala', 'akpu', 'starch', 'tuwo',
    'puff puff', 'chin chin', 'buns', 'meat pie', 'egg roll', 'gala', 'plantain chips', 'dodo', 'fried plantain',
    'suya', 'kilishi', 'indomie', 'noodles', 'spaghetti', 'rice and beans', 'jollof', 'fried rice',
    'soft drink', 'malt', 'coke', 'fanta', 'sprite', 'pepsi', 'chapman', 'zobo (sugared)'
];

const MEDIUM_CALORIE_KEYWORDS = [
    'chicken', 'rice', 'sandwich', 'eggs', 'yogurt', 'milk', 'wrap', 'soup', 'nuts', 'avocado',
    // Nigerian / Ekiti Specific
    'moi moi', 'akara', 'beans', 'porridge', 'yam', 'boiled yam', 'boiled plantain', 'pap', 'ogi', 'custard',
    'okpa', 'groundnut', 'cashew', 'garden egg', 'corn', 'maize', 'pear', 'ube',
    'egusi', 'ewedu', 'okra', 'ogbono', 'vegetable soup', 'efo riro', 'banga', 'pepper soup'
];

const SUGAR_KEYWORDS = [
    'cake', 'candy', 'soda', 'cookie', 'donut', 'chocolate', 'sweet', 'ice cream', 'dessert', 'sugar',
    // Nigerian
    'puff puff', 'chin chin', 'buns', 'soft drink', 'malt', 'coke', 'fanta', 'pepsi', 'ice cream', 'biscuit', 'sweet'
];
const PROCESSED_KEYWORDS = [
    'chips', 'fries', 'burger', 'pizza', 'hot dog', 'sausage', 'nuggets', 'fast food', 'instant',
    // Nigerian
    'gala', 'indomie', 'noodles', 'spaghetti', 'plantain chips', 'sausage roll', 'meat pie', 'egg roll', 'buns', 'bread'
];
const ALCOHOL_KEYWORDS = [
    'beer', 'wine', 'cocktail', 'vodka', 'whiskey', 'gin', 'rum', 'drink', 'alcohol',
    // Nigerian
    'palm wine', 'ogogoro', 'stout', 'guinness', 'star', 'heineken', 'trophy', '33', 'gordon', 'bitters', 'fayrouz (mixer)'
];

export function analyzeRealityLog(foods: string, mood: Mood): RealityAnalysis {
    const text = foods.toLowerCase();
    const tags: string[] = [];
    let calorieScore = 0; // Simple score

    // Check tags
    if (SUGAR_KEYWORDS.some(k => text.includes(k))) tags.push('Sugar');
    if (PROCESSED_KEYWORDS.some(k => text.includes(k))) tags.push('Processed');
    if (ALCOHOL_KEYWORDS.some(k => text.includes(k))) tags.push('Alcohol');

    // Calculate score
    HIGH_CALORIE_KEYWORDS.forEach(k => {
        if (text.includes(k)) calorieScore += 3;
    });
    MEDIUM_CALORIE_KEYWORDS.forEach(k => {
        if (text.includes(k)) calorieScore += 2;
    });

    let calorieDensity: 'High' | 'Medium' | 'Low' = 'Low';
    if (calorieScore >= 5) calorieDensity = 'High';
    else if (calorieScore >= 2) calorieDensity = 'Medium';

    // Generate Suggestions based on context
    const suggestions: string[] = [];

    if (mood === 'stressed' || mood === 'anxious') {
        suggestions.push("Next time you feel stressed, try deep breathing or a walk before eating.");
    }
    if (mood === 'bored') {
        suggestions.push("Boredom hunger passes in 15 minutes. Try drinking water or doing a quick task.");
    }
    if (mood === 'tired') {
        suggestions.push("Fatigue often masquerades as hunger. Consider a short nap or hydration.");
    }

    if (tags.includes('Sugar')) {
        suggestions.push("Sugar crashes affect mood. Pair sweets with protein next time to stabilize blood sugar.");
    }
    if (tags.includes('Alcohol')) {
        suggestions.push("Alcohol disrupts sleep and increases cravings. Hydrate aggressively now.");
    }
    if (tags.includes('Processed')) {
        suggestions.push("Processed foods are designed to be addictive. Don't beat yourself up, just return to whole foods next meal.");
    }

    if (suggestions.length === 0) {
        suggestions.push("Acknowledging your choices is the first step. Good job logging this.");
    }

    return {
        calorieDensity,
        tags,
        suggestions
    };
}
