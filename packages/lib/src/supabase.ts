
import { createBrowserClient as createSsrClient } from '@supabase/ssr';
import { createClient as createJsClient, SupabaseClient } from '@supabase/supabase-js';

// Define expected environment variable types for clarity, though we pass them in or read them
export const createBrowserClient = (
    supabaseUrl: string,
    supabaseKey: string
): SupabaseClient => {
    return createSsrClient(supabaseUrl, supabaseKey);
};

export const createMobileClient = (
    supabaseUrl: string,
    supabaseKey: string,
    storage: any // Passed from mobile app to avoid react-native dependency here
): SupabaseClient => {
    return createJsClient(supabaseUrl, supabaseKey, {
        auth: {
            storage: storage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });
};
