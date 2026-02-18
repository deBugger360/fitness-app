import { createClient } from "@/utils/supabase/client";
import { generateRecommendations as generateServiceRecommendations } from "@repo/lib";
import { Recommendation } from "@repo/shared"; // Or @repo/types?

export type { Recommendation };

export const generateRecommendations = async (userId: string): Promise<Recommendation[]> => {
    const supabase = createClient();
    return generateServiceRecommendations(supabase, userId);
};
