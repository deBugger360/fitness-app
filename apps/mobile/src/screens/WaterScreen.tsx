import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { useTheme } from '@repo/ui';
import { HapticButton } from '../components/ui';
import { useDailyStats } from '@repo/hooks';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { OfflineManager } from '@repo/lib';

export default function WaterScreen() {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation();

    const today = new Date().toISOString().split('T')[0];
    const { meals, loading, refresh } = useDailyStats(supabase, user?.id, today);

    // Initial state
    const [waterLiters, setWaterLiters] = useState(0);
    const [goal] = useState(3.0); // Simple default 3L

    useEffect(() => {
        if (meals.length > 0) {
            setWaterLiters(meals[0].water_liters || 0);
        }
    }, [meals]);

    const updateWater = async (amount: number) => {
        const newTotal = Math.max(0, parseFloat((waterLiters + amount).toFixed(2)));
        setWaterLiters(newTotal); // Optimistic

        try {
            // Find existing
            const existing = meals.find(m => m.date === today);

            if (existing) {
                await supabase.from('meals').update({ water_liters: newTotal }).eq('id', existing.id);
            } else {
                await supabase.from('meals').insert({
                    user_id: user!.id,
                    date: today,
                    water_liters: newTotal,
                    green_tea_cups: 0,
                    quality: 'healthy',
                });
            }

            await refresh();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
            console.warn("Water update failed, queuing offline");
            const offline = OfflineManager.getInstance();
            offline.queueMutation('meals', 'UPSERT', {
                user_id: user!.id,
                date: today,
                water_liters: newTotal
            });
            await refresh();
        }
    };

    const progress = Math.min((waterLiters / goal) * 100, 100);

    return (
        <View style={[st.container, { backgroundColor: theme.colors.background }]}>
            <View style={[st.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[st.title, { color: theme.colors.text }]}>Hydration</Text>
            </View>

            <View style={st.content}>
                {/* Main Display */}
                <View style={[st.card, {
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    borderColor: isDark ? '#334155' : '#e2e8f0'
                }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                        <Text style={[st.bigValue, { color: '#3b82f6' }]}>
                            {waterLiters.toFixed(2).replace(/\.?0+$/, '')}
                            <Text style={[st.unit, { color: theme.colors.textSecondary }]}>L</Text>
                        </Text>
                        <Text style={[st.goal, { color: theme.colors.textSecondary }]}>Goal: 3L</Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={[st.track, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                        <View style={[st.fill, { width: `${progress}%`, backgroundColor: '#3b82f6' }]} />
                    </View>

                    {/* Controls */}
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                        {[0.25, 0.5, 1.0].map((amt) => (
                            <HapticButton
                                key={amt}
                                style={[st.addBtn, {
                                    backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : '#eff6ff',
                                    borderColor: isDark ? 'rgba(59,130,246,0.3)' : '#dbeafe'
                                }]}
                                onPress={() => updateWater(amt)}
                                hapticType={Haptics.ImpactFeedbackStyle.Heavy}
                            >
                                <Text style={[st.addBtnText, { color: '#3b82f6' }]}>+{amt}L</Text>
                            </HapticButton>
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={() => updateWater(-0.25)}
                        style={{ marginTop: 16, alignSelf: 'flex-end', padding: 8 }}
                    >
                        <Text style={{ color: theme.colors.textSecondary, textDecorationLine: 'underline' }}>Undo</Text>
                    </TouchableOpacity>
                </View>

                {/* Tips */}
                <View style={{ marginTop: 24, padding: 20, backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Ionicons name="information-circle" size={20} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={{ fontWeight: '700', color: theme.colors.text }}>Why it matters</Text>
                    </View>
                    <Text style={{ color: theme.colors.textSecondary, lineHeight: 22 }}>
                        Drinking 3L of water daily boosts metabolism, improves skin health, and aids muscle recovery.
                    </Text>
                </View>
            </View>
        </View>
    );
}

const st = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1
    },
    backBtn: { marginRight: 16, padding: 4 },
    title: { fontSize: 20, fontWeight: '800' },
    content: { padding: 20 },
    card: {
        borderRadius: 32, borderWidth: 1, padding: 32,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4
    },
    bigValue: { fontSize: 48, fontWeight: '800', letterSpacing: -1 },
    unit: { fontSize: 20, fontWeight: '600', marginLeft: 4 },
    goal: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
    track: { height: 16, borderRadius: 8, overflow: 'hidden', width: '100%' },
    fill: { height: '100%', borderRadius: 8 },
    addBtn: {
        flex: 1, paddingVertical: 16, borderRadius: 16, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center'
    },
    addBtnText: { fontSize: 16, fontWeight: '800' }
});
