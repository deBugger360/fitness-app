import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth, supabase } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, EmptyState, SectionHeader } from '@repo/ui';
import { useRecommendations } from '@repo/hooks';
import { Recommendation } from '@repo/shared';
import { Ionicons } from '@expo/vector-icons';
import { Skeleton } from '../components/ui';
import Animated, {
    useSharedValue,
    withSpring,
    withDelay,
    withTiming,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';
import { SyncManager } from '@repo/lib';

const { width } = Dimensions.get('window');

const MOCK_CHART_DATA = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [85, 90, 60, 95, 100, 80, 92], strokeWidth: 2 }],
    legend: ['Consistency Score'],
};

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: 'alert-circle', label: 'High Priority' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'time', label: 'Medium' },
    low: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: 'checkmark-circle', label: 'Low' },
};

// ─── Animated recommendation card ────────────────────────────────────────────
const RecCard = ({ rec, theme, delay, isDark }: any) => {
    const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(12);
    const bgGlass = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)';
    const borderGlass = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
        translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 120 }));
    }, []);
    const anim = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[st.recCard, { backgroundColor: bgGlass, borderColor: borderGlass }, anim]}>
            <View style={[st.priorityBadge, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
            </View>
            <View style={st.recBody}>
                <View style={st.recHeader}>
                    <Text style={[st.recTitle, { color: theme.colors.text }]}>{rec.title}</Text>
                    <View style={[st.priorityTag, { backgroundColor: cfg.bg }]}>
                        <Text style={[st.priorityLabel, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                </View>
                <Text style={[st.recMessage, { color: theme.colors.textSecondary }]}>{rec.message}</Text>
            </View>
        </Animated.View>
    );
};

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function InsightsScreen() {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();

    // ── Shared hook — same as web ──────────────────────────────────────────
    const { recommendations, loading, error, refresh } = useRecommendations(supabase, user?.id);

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

    const bgGlass = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)';
    const borderGlass = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';

    return (
        <View style={[st.container, { backgroundColor: theme.colors.background }]}>
            <Animated.View style={[st.header, headerAnim]}>
                <Text style={[st.title, { color: theme.colors.text }]}>Insights</Text>
                <Text style={[st.subtitle, { color: theme.colors.textSecondary }]}>Your progress this week</Text>
            </Animated.View>

            <ScrollView
                contentContainerStyle={st.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.text} />
                }
            >
                {/* Chart card */}
                <Animated.View style={[st.chartCard, { backgroundColor: bgGlass, borderColor: borderGlass }]}>
                    <Text style={[st.chartTitle, { color: theme.colors.text }]}>Consistency Trend</Text>
                    <Text style={[st.chartSub, { color: theme.colors.textSecondary }]}>Last 7 days</Text>
                    <LineChart
                        data={{
                            ...MOCK_CHART_DATA,
                            datasets: [{
                                ...MOCK_CHART_DATA.datasets[0],
                                color: (opacity = 1) => theme.colors.primary,
                            }],
                        }}
                        width={width - 80}
                        height={200}
                        chartConfig={{
                            backgroundColor: 'transparent',
                            backgroundGradientFrom: 'transparent',
                            backgroundGradientTo: 'transparent',
                            decimalPlaces: 0,
                            color: (opacity = 1) => theme.colors.primary,
                            labelColor: () => theme.colors.textSecondary,
                            propsForDots: {
                                r: '5',
                                strokeWidth: '2',
                                stroke: theme.colors.primary,
                                fill: isDark ? '#0f172a' : '#fff',
                            },
                        }}
                        bezier
                        withInnerLines
                        transparent
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                </Animated.View>

                {/* Recommendations */}
                <SectionHeader
                    title="Smart Recommendations"
                    color={theme.colors.text}
                    subtitleColor={theme.colors.textSecondary}
                    style={{ marginBottom: 14 }}
                />

                {loading ? (
                    <>
                        <Skeleton width="100%" height={90} borderRadius={24} style={{ marginBottom: 12 }} />
                        <Skeleton width="100%" height={90} borderRadius={24} style={{ marginBottom: 12 }} />
                        <Skeleton width="100%" height={90} borderRadius={24} />
                    </>
                ) : recommendations.length === 0 ? (
                    <EmptyState
                        icon={<Ionicons name="analytics-outline" size={44} color={theme.colors.textMuted} />}
                        title="Building your insights"
                        description="Keep logging your data. Personalised recommendations appear after a few days."
                        color={theme.colors.text}
                        descriptionColor={theme.colors.textSecondary}
                    />
                ) : (
                    recommendations.map((rec, i) => (
                        <RecCard key={rec.id} rec={rec} theme={theme} isDark={isDark} delay={i * 80} />
                    ))
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
    chartCard: { borderRadius: 32, borderWidth: 1, padding: 24, marginBottom: 28, alignItems: 'center', overflow: 'hidden' },
    chartTitle: { fontSize: 18, fontWeight: '700', alignSelf: 'flex-start' },
    chartSub: { fontSize: 13, fontWeight: '500', alignSelf: 'flex-start', marginTop: 3, marginBottom: 4 },
    recCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderRadius: 24, borderWidth: 1, padding: 18, marginBottom: 12 },
    priorityBadge: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    recBody: { flex: 1 },
    recHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    recTitle: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
    priorityTag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    priorityLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    recMessage: { fontSize: 13, lineHeight: 20 },
});
