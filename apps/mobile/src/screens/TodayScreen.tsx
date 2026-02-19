
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTodayData } from '../hooks/useTodayData';
import { HapticButton, Skeleton } from '../components/ui';
import { useTheme, Card, ProgressRing, SectionHeader } from '@repo/ui';
import Animated, {
    useSharedValue,
    withTiming,
    withSpring,
    withDelay,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';



// ─── Stat Card (mini token card, not the shared glass Card — smaller) ─────────
const StatCard = ({ label, value, unit, icon, iconColor, theme, delay }: any) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(16);
    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
        translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 120 }));
    }, []);
    const anim = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));

    const bgColor = theme.dark
        ? 'rgba(15, 23, 42, 0.85)'
        : 'rgba(255, 255, 255, 0.75)';
    const borderColor = theme.dark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(15, 23, 42, 0.06)';

    return (
        <Animated.View style={[st.statCard, { backgroundColor: bgColor, borderColor }, anim]}>
            <View style={[st.statIconBox, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>
            <Text style={[st.statValue, { color: theme.colors.text }]}>{value}</Text>
            <Text style={[st.statUnit, { color: theme.colors.textSecondary }]}>{unit}</Text>
            <Text style={[st.statLabel, { color: theme.colors.textMuted }]}>{label}</Text>
        </Animated.View>
    );
};

// ─── Quick Action Row ─────────────────────────────────────────────────────────
const QuickAction = ({ label, icon, onPress, color, count = 0, theme, delay }: any) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(12);
    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
        translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 130 }));
    }, []);
    const anim = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));

    return (
        <Animated.View style={anim}>
            <HapticButton
                style={[st.actionBtn, {
                    backgroundColor: theme.dark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)',
                    borderColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
                }]}
                onPress={onPress}
                hapticType={Haptics.ImpactFeedbackStyle.Medium}
            >
                <View style={[st.actionIconBox, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={26} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[st.actionLabel, { color: theme.colors.text }]}>{label}</Text>
                    {count > 0 && (
                        <Text style={[st.actionCount, { color: theme.colors.textSecondary }]}>
                            {count} logged today
                        </Text>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </HapticButton>
        </Animated.View>
    );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function TodayScreen({ navigation }: any) {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const { loading, score, streak, stats, logAction, refresh } = useTodayData(user?.id);
    const userName = user?.email?.split('@')[0] || 'Friend';
    const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

    // Header entrance
    const headerOpacity = useSharedValue(0);
    const headerY = useSharedValue(-20);
    useEffect(() => {
        headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
        headerY.value = withSpring(0, { damping: 20, stiffness: 100 });
    }, []);
    const headerAnim = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerY.value }],
    }));

    if (loading && !stats) {
        return (
            <View style={[st.container, { backgroundColor: theme.colors.background }]}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <View style={st.scroll}>
                    <View style={st.header}>
                        <View>
                            <Skeleton width={100} height={14} style={{ marginBottom: 8 }} />
                            <Skeleton width={180} height={30} />
                        </View>
                        <Skeleton width={44} height={44} borderRadius={22} />
                    </View>
                    <Skeleton width="100%" height={260} borderRadius={32} style={{ marginBottom: 24 }} />
                    <View style={st.statsRow}>
                        <Skeleton width="30%" height={110} borderRadius={28} />
                        <Skeleton width="30%" height={110} borderRadius={28} />
                        <Skeleton width="30%" height={110} borderRadius={28} />
                    </View>
                    <Skeleton width={140} height={22} style={{ marginBottom: 16, marginTop: 8 }} />
                    <Skeleton width="100%" height={76} borderRadius={24} style={{ marginBottom: 12 }} />
                    <Skeleton width="100%" height={76} borderRadius={24} style={{ marginBottom: 12 }} />
                    <Skeleton width="100%" height={76} borderRadius={24} style={{ marginBottom: 12 }} />
                </View>
            </View>
        );
    }

    return (
        <View style={[st.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ScrollView
                contentContainerStyle={st.scroll}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.primary} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ─────────────────────────────────────────── */}
                <Animated.View style={[st.header, headerAnim]}>
                    <View>
                        <Text style={[st.greeting, { color: theme.colors.textSecondary }]}>
                            Good morning,
                        </Text>
                        <Text style={[st.name, { color: theme.colors.text }]}>{displayName}</Text>
                    </View>
                    <HapticButton
                        style={[st.profileBtn, {
                            backgroundColor: theme.dark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.8)',
                            borderColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
                        }]}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View>
                            <Ionicons name="person-outline" size={22} color={theme.colors.text} />
                            <View style={[st.profileDot, { backgroundColor: theme.colors.primary }]} />
                        </View>
                    </HapticButton>
                </Animated.View>

                {/* Hero card: ProgressRing */}
                <Card delay={100} style={st.heroCard}>
                    <ProgressRing
                        score={score}
                        color={theme.colors.primary}
                        trackColor={theme.colors.border}
                        delay={300}
                        radius={80}
                        strokeWidth={14}
                    >
                        <Text style={[st.ringScore, { color: theme.colors.text }]}>{score}%</Text>
                        <Text style={[st.ringLabel, { color: theme.colors.textSecondary }]}>CONSISTENCY</Text>
                    </ProgressRing>
                    <Text style={[st.heroSubtitle, { color: theme.colors.textSecondary }]}>
                        Today's Performance Score
                    </Text>
                </Card>

                {/* ── Stats row ───────────────────────────────────────── */}
                <View style={st.statsRow}>
                    <StatCard
                        label="Streak" value={streak} unit="Days"
                        icon="flame" iconColor="#f97316"
                        theme={theme} delay={200}
                    />
                    <StatCard
                        label="Workouts" value={stats.workouts} unit="Done"
                        icon="barbell" iconColor={theme.colors.warning}
                        theme={theme} delay={280}
                    />
                    <StatCard
                        label="Water" value={stats.water} unit="Cups"
                        icon="water" iconColor={theme.colors.primary}
                        theme={theme} delay={360}
                    />
                </View>

                {/* Quick Logger */}
                <SectionHeader
                    title="Quick Logger"
                    color={theme.colors.text}
                    subtitleColor={theme.colors.textSecondary}
                    style={{ marginBottom: 14 }}
                />
                <View style={st.actionGrid}>
                    <QuickAction
                        label="Log Workout" icon="barbell"
                        color={theme.colors.warning}
                        count={stats.workouts}
                        onPress={() => logAction('workout')}
                        theme={theme} delay={440}
                    />
                    <QuickAction
                        label="Log Meal" icon="restaurant"
                        color={theme.colors.success}
                        count={stats.meals}
                        onPress={() => navigation.navigate('Meals')}
                        theme={theme} delay={510}
                    />
                    <QuickAction
                        label="Log Water" icon="water"
                        color={theme.colors.primary}
                        count={stats.water}
                        onPress={() => logAction('water')}
                        theme={theme} delay={580}
                    />
                    <QuickAction
                        label="Log Sugar" icon="alert-circle"
                        color={theme.colors.error}
                        count={stats.cravings}
                        onPress={() => navigation.navigate('Sugar')}
                        theme={theme} delay={650}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

// ─── Static styles (theme-independent layout) ──────────────────────────────
const st = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
    greeting: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
    name: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 }, // tracking-tight extrabold
    profileBtn: {
        width: 44, height: 44, borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    },
    profileDot: {
        position: 'absolute', top: 0, right: 0,
        width: 10, height: 10, borderRadius: 5,
        borderWidth: 2, borderColor: 'transparent',
    },

    // Hero
    heroCard: { marginBottom: 20, alignItems: 'center' },
    heroSubtitle: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 12 },

    // Ring
    ringWrap: { alignItems: 'center', justifyContent: 'center' },
    ringCenter: { position: 'absolute', alignItems: 'center' },
    ringScore: { fontSize: 40, fontWeight: '800', letterSpacing: -1 },
    ringLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 },

    // Stat cards
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28, gap: 10 },
    statCard: {
        flex: 1, padding: 16, borderRadius: 28,
        borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07, shadowRadius: 16, elevation: 2,
        alignItems: 'center',
    },
    statIconBox: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    statValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    statUnit: { fontSize: 11, fontWeight: '600', marginTop: 1 },
    statLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 },

    // Actions
    sectionTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, marginBottom: 14 },
    actionGrid: { gap: 12 },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', padding: 18,
        borderRadius: 24, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
    },
    actionIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    actionLabel: { fontSize: 16, fontWeight: '600' },
    actionCount: { fontSize: 12, marginTop: 2 },
});
