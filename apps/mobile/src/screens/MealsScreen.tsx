
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { useTheme } from '@repo/ui';
import { validateMealInput } from '@repo/shared';
import { HapticButton } from '../components/ui';
import Animated, {
    useSharedValue,
    withSpring,
    withDelay,
    withTiming,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type Quality = 'healthy' | 'moderate' | 'unhealthy';

const QUALITY_CONFIG: Record<Quality, { label: string; icon: string; color: string }> = {
    healthy: { label: 'Healthy', icon: 'leaf', color: '#10b981' },
    moderate: { label: 'Moderate', icon: 'restaurant', color: '#f59e0b' },
    unhealthy: { label: 'Unhealthy', icon: 'fast-food', color: '#ef4444' },
};

export default function MealsScreen() {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const [log, setLog] = useState('');
    const [quality, setQuality] = useState<Quality>('moderate');
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const today = new Date().toISOString().split('T')[0];

    const bgGlass = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)';
    const borderGlass = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)';

    // Header entrance
    const headerOpacity = useSharedValue(0);
    const headerY = useSharedValue(-20);
    useEffect(() => {
        headerOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
        headerY.value = withSpring(0, { damping: 20, stiffness: 100 });
        fetchHistory();
    }, [user?.id]);
    const headerAnim = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerY.value }],
    }));

    const fetchHistory = async () => {
        if (!user?.id) return;
        const { data } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .order('created_at', { ascending: false });
        if (data) setHistory(data);
    };

    const submitLog = async () => {
        if (!log.trim() || !user?.id) return;
        setSaving(true);
        try {
            const mealData = validateMealInput({ date: today, quality, description: log, green_tea_cups: 0 });
            const { error } = await supabase.from('meals').insert({ user_id: user.id, ...mealData });
            if (error) throw error;
            setLog('');
            await fetchHistory();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={[st.container, { backgroundColor: theme.colors.background }]}>
            {/* ── Header ─────────────────────────────────── */}
            <Animated.View style={[st.header, headerAnim]}>
                <Text style={[st.title, { color: theme.colors.text }]}>Meals</Text>
                <Text style={[st.subtitle, { color: theme.colors.textSecondary }]}>Track your nutrition</Text>
            </Animated.View>

            <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

                {/* ── Input card ─────────────────────────── */}
                <Animated.View style={[st.card, { backgroundColor: bgGlass, borderColor: borderGlass }]}>
                    <Text style={[st.label, { color: theme.colors.textSecondary }]}>What did you eat?</Text>
                    <TextInput
                        style={[st.input, {
                            backgroundColor: inputBg,
                            borderColor: borderGlass,
                            color: theme.colors.text,
                        }]}
                        placeholder="e.g. Grilled chicken salad with avocado..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={log}
                        onChangeText={setLog}
                        multiline
                        numberOfLines={3}
                    />

                    {/* Quality selector */}
                    <Text style={[st.label, { color: theme.colors.textSecondary }]}>Meal quality</Text>
                    <View style={st.qualityRow}>
                        {(Object.keys(QUALITY_CONFIG) as Quality[]).map((q) => {
                            const cfg = QUALITY_CONFIG[q];
                            const active = quality === q;
                            return (
                                <HapticButton
                                    key={q}
                                    style={[st.qualityBtn, {
                                        backgroundColor: active ? cfg.color : inputBg,
                                        borderColor: active ? cfg.color : borderGlass,
                                    }]}
                                    onPress={() => setQuality(q)}
                                    hapticType={Haptics.ImpactFeedbackStyle.Light}
                                >
                                    <Ionicons
                                        name={cfg.icon as any}
                                        size={16}
                                        color={active ? '#fff' : theme.colors.textSecondary}
                                    />
                                    <Text style={[st.qualityText, { color: active ? '#fff' : theme.colors.textSecondary }]}>
                                        {cfg.label}
                                    </Text>
                                </HapticButton>
                            );
                        })}
                    </View>

                    {/* Submit */}
                    <HapticButton
                        style={[st.submitBtn, {
                            backgroundColor: theme.colors.primary,
                            opacity: saving ? 0.7 : 1,
                        }]}
                        onPress={submitLog}
                        hapticType={Haptics.ImpactFeedbackStyle.Medium}
                    >
                        <Text style={st.submitText}>{saving ? 'Saving…' : 'Log Meal'}</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </HapticButton>
                </Animated.View>

                {/* ── Today's log ────────────────────────── */}
                {history.length > 0 && (
                    <>
                        <Text style={[st.sectionTitle, { color: theme.colors.text }]}>Today's Log</Text>
                        {history.map((item, i) => {
                            const cfg = QUALITY_CONFIG[item.quality as Quality] || QUALITY_CONFIG.moderate;
                            const itemOpacity = useSharedValue(0);
                            const itemY = useSharedValue(8);
                            useEffect(() => {
                                itemOpacity.value = withDelay(i * 60, withTiming(1, { duration: 350 }));
                                itemY.value = withDelay(i * 60, withSpring(0, { damping: 20 }));
                            }, []);
                            const itemAnim = useAnimatedStyle(() => ({
                                opacity: itemOpacity.value,
                                transform: [{ translateY: itemY.value }],
                            }));
                            return (
                                <Animated.View
                                    key={item.id || i}
                                    style={[st.historyItem, { backgroundColor: bgGlass, borderColor: borderGlass }, itemAnim]}
                                >
                                    <View style={[st.qualityDot, { backgroundColor: cfg.color + '20', borderRadius: 10 }]}>
                                        <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[st.historyText, { color: theme.colors.text }]} numberOfLines={1}>
                                            {item.description}
                                        </Text>
                                        <Text style={[st.historyMeta, { color: theme.colors.textMuted }]}>
                                            {cfg.label} · {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </>
                )}

            </ScrollView>
        </View>
    );
}

const st = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8 },
    title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, fontWeight: '500', marginTop: 4 },
    content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },

    // Card
    card: {
        borderRadius: 32, borderWidth: 1, padding: 24, marginBottom: 28,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 3,
    },
    label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
    input: {
        borderRadius: 20, borderWidth: 1, padding: 16,
        fontSize: 16, minHeight: 90, textAlignVertical: 'top', marginBottom: 20,
    },

    // Quality
    qualityRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    qualityBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 12, borderRadius: 16, borderWidth: 1,
    },
    qualityText: { fontSize: 12, fontWeight: '700' },

    // Submit
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, paddingVertical: 16, borderRadius: 20,
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // History
    sectionTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, marginBottom: 14 },
    historyItem: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        borderRadius: 24, borderWidth: 1, padding: 16, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
    },
    qualityDot: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
    historyText: { fontSize: 15, fontWeight: '600' },
    historyMeta: { fontSize: 12, marginTop: 2 },
});
