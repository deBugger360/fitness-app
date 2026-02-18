import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createMobileClient } from '@repo/lib';
import { ExpoSecureStoreAdapter } from '../lib/storage';

// Initialize Supabase Client
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createMobileClient(SUPABASE_URL, SUPABASE_KEY, ExpoSecureStoreAdapter);

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Error checking session:', error);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
