import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { useTheme } from '@repo/ui';
import { useMeals } from '@repo/hooks';
import { HapticButton } from '../components/ui';
import { useFocusEffect } from '@react-navigation/native';
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

// ─── Animated history item ────────────────────────────────────────────────────
const HistoryItem = ({ item, theme, delay, isDark }: any) => {
    const cfg = QUALITY_CONFIG[item.quality as Quality] || QUALITY_CONFIG.moderate;
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(8);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
        translateY.value = withDelay(delay, withSpring(0, { damping: 20 }));
    }, []);

    const anim = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const bgGlass = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)';
    const borderGlass = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';

    return (
        <Animated.View style={[st.historyItem, { backgroundColor: bgGlass, borderColor: borderGlass }, anim]}>
            <View style={[st.qualityDot, { backgroundColor: cfg.color + '20', borderRadius: 10 }]}>
                <Ionicons name={cfg.icon as any} size={16} color={cfg.color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[st.historyText, { color: theme.colors.text }]} numberOfLines={1}>
                    {item.description || 'Meal logged'}
                </Text>
                <Text style={[st.historyMeta, { color: theme.colors.textMuted }]}>
                    {cfg.label} · {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </Animated.View>
    );
};

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function MealsScreen() {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const today = new Date().toISOString().split('T')[0];

    const [description, setDescription] = React.useState('');
    const [quality, setQuality] = React.useState<Quality>('moderate');
    const [saving, setSaving] = React.useState(false);

    // ── Shared hook — same as web ──────────────────────────────────────────
    const { meals, loading, error, refresh, logMeal } = useMeals(
        supabase,
        user?.id,
        { date: today }
    );

    // Re-fetch on tab focus
    useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

    // Header animation
    const headerOpacity = useSharedValue(0);
    const headerY = useSharedValue(-20);
    useEffect(() => {
        headerOpacity.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) });
        headerY.value = withSpring(0, { damping: 20, stiffness: 100 });
    }, []);
    const headerAnim = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerY.value }],
    }));

    // ── Submit ─────────────────────────────────────────────────────────────
    const submitLog = async () => {
        if (!description.trim()) return;
        setSaving(true);
        try {
            const result = await logMeal({
                date: today,
                quality,
                description,
                green_tea_cups: 0,
            });
            if (result) {
                setDescription('');
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else if (error) {
                Alert.alert('Error', error);
            }
        } finally {
            setSaving(false);
        }
    };

    const bgGlass = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)';
    const borderGlass = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';
    const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)';

    // Today's logged meals (non-water entries)
    const todayMeals = meals.filter(m => m.description);

    return (
        <View style={[st.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <Animated.View style={[st.header, headerAnim]}>
                <View>
                    <Text style={[st.title, { color: theme.colors.text }]}>Meals</Text>
                    <Text style={[st.subtitle, { color: theme.colors.textSecondary }]}>Track your nutrition</Text>
                </View>
                {loading && <View style={[st.syncDot, { backgroundColor: theme.colors.primary }]} />}
            </Animated.View>

            <ScrollView
                contentContainerStyle={st.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {/* Error banner */}
                {error && (
                    <View style={[st.errorBanner, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}>
                        <Ionicons name="alert-circle-outline" size={15} color={theme.colors.error} />
                        <Text style={[st.errorText, { color: theme.colors.error }]}>{error}</Text>
                    </View>
                )}

                {/* Input card */}
                <Animated.View style={[st.card, { backgroundColor: bgGlass, borderColor: borderGlass }]}>
                    <Text style={[st.label, { color: theme.colors.textSecondary }]}>What did you eat?</Text>
                    <TextInput
                        style={[st.input, { backgroundColor: inputBg, borderColor: borderGlass, color: theme.colors.text }]}
                        placeholder="e.g. Grilled chicken salad with avocado..."
                        placeholderTextColor={theme.colors.textMuted}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={3}
                    />

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
                                    <Ionicons name={cfg.icon as any} size={16} color={active ? '#fff' : theme.colors.textSecondary} />
                                    <Text style={[st.qualityText, { color: active ? '#fff' : theme.colors.textSecondary }]}>
                                        {cfg.label}
                                    </Text>
                                </HapticButton>
                            );
                        })}
                    </View>

                    <HapticButton
                        style={[st.submitBtn, { backgroundColor: theme.colors.primary, opacity: saving ? 0.7 : 1 }]}
                        onPress={submitLog}
                        hapticType={Haptics.ImpactFeedbackStyle.Medium}
                    >
                        <Text style={st.submitText}>{saving ? 'Saving…' : 'Log Meal'}</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </HapticButton>
                </Animated.View>

                {/* Today's log */}
                {todayMeals.length > 0 && (
                    <>
                        <Text style={[st.sectionTitle, { color: theme.colors.text }]}>Today's Log</Text>
                        {todayMeals.map((item, i) => (
                            <HistoryItem
                                key={item.id || i}
                                item={item}
                                theme={theme}
                                isDark={isDark}
                                delay={i * 60}
                            />
                        ))}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const st = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, fontWeight: '500', marginTop: 4 },
    syncDot: { width: 8, height: 8, borderRadius: 4, marginTop: 10, opacity: 0.7 },
    content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 },

    errorBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16,
    },
    errorText: { fontSize: 13, flex: 1 },

    card: {
        borderRadius: 32, borderWidth: 1, padding: 24, marginBottom: 28,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 3,
    },
    label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
    input: {
        borderRadius: 20, borderWidth: 1, padding: 16,
        fontSize: 16, minHeight: 90, textAlignVertical: 'top', marginBottom: 20,
    },
    qualityRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
    qualityBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 12, borderRadius: 16, borderWidth: 1,
    },
    qualityText: { fontSize: 12, fontWeight: '700' },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, paddingVertical: 16, borderRadius: 20,
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },

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
