import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { generateRecommendations } from '@repo/lib';
import { saveWorkout } from '@repo/lib';
import { useTheme } from '@repo/ui';
import { useAuth, supabase } from '../context/AuthProvider';
import * as Haptics from 'expo-haptics';

export default function RecommendationEngine() {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const [rec, setRec] = useState<any | null>(null);

    useEffect(() => {
        if (!user) return;

        const load = async () => {
            try {
                // generateRecommendations expects supabase client if shared lib requires it
                // Assuming signature: (supabaseClient, userId)
                const recs = await generateRecommendations(supabase, user.id);
                if (recs && recs.length > 0) {
                    setRec(recs[0]);
                }
            } catch (e) {
                console.warn("Failed to load recommendations", e);
            }
        };

        load();
    }, [user]);

    if (!rec) return null;

    const handleAction = async () => {
        if (rec.id === 'walk_instead') {
            try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                await saveWorkout(supabase, user!.id, {
                    date: new Date().toISOString().split('T')[0],
                    evening_walk_minutes: 10,
                    notes: 'Emergency Walk Instead',
                });
                Alert.alert('Logged', '10-minute walk logged successfully!');
                setRec(null); // Hide after action
            } catch (e) {
                Alert.alert('Error', 'Failed to log walk');
            }
        }
    };

    const getIcon = (cat: string) => {
        switch (cat) {
            case 'workout': return { name: 'barbell', color: '#6366f1' };
            case 'hydration': return { name: 'water', color: '#3b82f6' };
            case 'nutrition': return { name: 'flash', color: '#f97316' };
            case 'habit': return { name: 'time', color: '#a855f7' };
            default: return { name: 'sparkles', color: '#eab308' };
        }
    };

    const iconData = getIcon(rec.category);

    return (
        <LinearGradient
            colors={isDark ? ['#1e293b', '#0f172a'] : ['#f8fafc', '#ffffff']}
            style={[st.card, { borderColor: theme.colors.border }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={[st.iconBox, { backgroundColor: isDark ? '#334155' : '#fff' }]}>
                    <Ionicons name={iconData.name as any} size={20} color={iconData.color} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[st.eyebrow, { color: theme.colors.textMuted }]}>Smart Insight</Text>
                    <Text style={[st.title, { color: theme.colors.text }]}>{rec.title}</Text>
                    <Text style={[st.message, { color: theme.colors.textSecondary }]}>{rec.message}</Text>

                    {rec.id === 'walk_instead' && (
                        <TouchableOpacity
                            style={[st.actionBtn, { backgroundColor: theme.colors.primary }]}
                            onPress={handleAction}
                        >
                            <Text style={st.actionText}>Log 10m Walk Now</Text>
                            <Ionicons name="arrow-forward" size={16} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </LinearGradient>
    );
}

const st = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
    },
    iconBox: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
    },
    eyebrow: {
        fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4
    },
    title: {
        fontSize: 16, fontWeight: '700', marginBottom: 4, lineHeight: 22
    },
    message: {
        fontSize: 13, lineHeight: 20, marginBottom: 12
    },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, gap: 6
    },
    actionText: {
        color: '#fff', fontSize: 12, fontWeight: '700'
    }
});
