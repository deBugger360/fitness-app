import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../context/AuthProvider';
import { useTheme } from '@repo/ui';
import { FOUNDATION_PRINCIPLES } from '@repo/shared';
import { useFoundations } from '@repo/hooks';
import Animated, {
    useSharedValue,
    withSpring,
    withDelay,
    withTiming,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';

const LUCIDE_TO_IONICONS: Record<string, string> = {
    Moon: 'moon-outline',
    Droplets: 'water-outline',
    Utensils: 'restaurant-outline',
    Activity: 'walk-outline',
    Sun: 'sunny-outline',
    Brain: 'book-outline',
    ShieldOff: 'shield-outline',
    SmartphoneOff: 'phone-portrait-outline',
    Heart: 'heart-outline',
    Book: 'book-outline',
    Feather: 'pencil-outline',
};

// ─── Animated habit row ───────────────────────────────────────────────────────
const HabitRow = ({ principle, isChecked, onToggle, theme, delay }: any) => {
    const ionicon = LUCIDE_TO_IONICONS[principle.icon] || 'checkmark-circle-outline';
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(-12);
    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
        translateX.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 130 }));
    }, []);
    const anim = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Animated.View style={anim}>
            <TouchableOpacity
                style={[styles.habitRow, {
                    backgroundColor: isChecked
                        ? (theme.dark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.06)')
                        : 'transparent',
                    borderRadius: 20,
                }]}
                onPress={() => onToggle(principle.id)}
                activeOpacity={0.7}
            >
                <View style={styles.habitLeft}>
                    <View style={[styles.iconBox, {
                        backgroundColor: isChecked ? theme.colors.primary : (theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)'),
                        borderColor: isChecked ? theme.colors.primary : theme.colors.border,
                    }]}>
                        <Ionicons name={ionicon as any} size={20} color={isChecked ? '#fff' : theme.colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.habitLabel, {
                            color: isChecked ? theme.colors.text : theme.colors.textSecondary,
                            fontWeight: isChecked ? '600' : '500',
                        }]}>
                            {principle.name}
                        </Text>
                        <Text style={[styles.habitDesc, { color: theme.colors.textMuted }]}>
                            {principle.description}
                        </Text>
                    </View>
                </View>
                <View style={[styles.checkbox, {
                    backgroundColor: isChecked ? theme.colors.success : 'transparent',
                    borderColor: isChecked ? theme.colors.success : theme.colors.border,
                }]}>
                    {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Animated progress bar ────────────────────────────────────────────────────
const ProgressBar = ({ progress, theme }: { progress: number; theme: any }) => {
    const width = useSharedValue(0);
    useEffect(() => {
        width.value = withDelay(200, withSpring(progress, { damping: 20, stiffness: 80 }));
    }, [progress]);
    const anim = useAnimatedStyle(() => ({ width: `${width.value}%` as any }));
    return (
        <View style={[styles.progressTrack, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)' }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: theme.colors.primary }, anim]} />
        </View>
    );
};

// ─── Error banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, theme }: { message: string; theme: any }) => (
    <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}>
        <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{message}</Text>
    </View>
);

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ActivityScreen() {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const today = new Date().toISOString().split('T')[0];

    // ── Shared hook — same as web ──────────────────────────────────────────
    const { foundations, today: todayFoundation, loading, error, saveFoundation } = useFoundations(
        supabase,
        user?.id,
        { date: today }
    );

    // Derive checked habits from the saved `notes` field (keyed by principle ID)
    const habits: Record<string, boolean> = Object.fromEntries(
        FOUNDATION_PRINCIPLES.map(p => [
            p.id,
            todayFoundation?.notes?.[p.id] === true || todayFoundation?.notes?.[p.id] === 'true',
        ])
    );

    // Header entrance animation
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

    // ── Toggle habit — optimistic via saveFoundation ────────────────────────
    const toggleHabit = async (habitId: string) => {
        const currentChecked = !!habits[habitId];
        const newNotes = { ...(todayFoundation?.notes || {}), [habitId]: !currentChecked };
        const completedIds = FOUNDATION_PRINCIPLES
            .map(p => p.id)
            .filter(id => (id === habitId ? !currentChecked : !!newNotes[id]));

        // saveFoundation in @repo/hooks handles optimistic local update + upsert
        await saveFoundation(today, completedIds, newNotes);
    };

    const completedCount = Object.values(habits).filter(Boolean).length;
    const total = FOUNDATION_PRINCIPLES.length;
    const progressPct = total > 0 ? (completedCount / total) * 100 : 0;

    const bgColor = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)';
    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Animated.View style={[styles.header, headerAnim]}>
                <View>
                    <Text style={[styles.title, { color: theme.colors.text }]}>Foundations</Text>
                    <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                </View>
                {/* Sync indicator — shows loading state without blocking UI */}
                {loading && (
                    <View style={[styles.syncDot, { backgroundColor: theme.colors.primary }]} />
                )}
            </Animated.View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {error && <ErrorBanner message={error} theme={theme} />}

                {/* Progress summary card */}
                <Animated.View style={[styles.progressCard, { backgroundColor: bgColor, borderColor }]}>
                    <View style={styles.progressHeader}>
                        <View>
                            <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
                                Daily Non-Negotiables
                            </Text>
                            <Text style={[styles.progressSub, { color: theme.colors.textSecondary }]}>
                                {completedCount} of {total} completed
                            </Text>
                        </View>
                        <View style={[styles.progressBadge, {
                            backgroundColor: progressPct === 100
                                ? theme.colors.successLight
                                : (isDark ? 'rgba(99,102,241,0.15)' : theme.colors.primaryLight),
                        }]}>
                            <Text style={[styles.progressPct, {
                                color: progressPct === 100 ? theme.colors.success : theme.colors.primary,
                            }]}>
                                {Math.round(progressPct)}%
                            </Text>
                        </View>
                    </View>
                    <ProgressBar progress={progressPct} theme={theme} />
                </Animated.View>

                {/* Habits list card */}
                <View style={[styles.habitsCard, { backgroundColor: bgColor, borderColor }]}>
                    {FOUNDATION_PRINCIPLES.map((p, i) => (
                        <HabitRow
                            key={p.id}
                            principle={p}
                            isChecked={!!habits[p.id]}
                            onToggle={toggleHabit}
                            theme={theme}
                            delay={i * 60}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    date: { fontSize: 14, fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    syncDot: { width: 8, height: 8, borderRadius: 4, marginTop: 8, opacity: 0.7 },
    content: { paddingHorizontal: 24, paddingBottom: 48 },

    errorBanner: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16,
    },
    errorText: { fontSize: 13, flex: 1 },

    progressCard: {
        borderRadius: 32, borderWidth: 1, padding: 24, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 3,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    progressTitle: { fontSize: 17, fontWeight: '700' },
    progressSub: { fontSize: 13, marginTop: 3, fontWeight: '500' },
    progressBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
    progressPct: { fontSize: 14, fontWeight: '800' },
    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: 6, borderRadius: 3 },

    habitsCard: {
        borderRadius: 32, borderWidth: 1, padding: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 3,
    },
    habitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, marginVertical: 2 },
    habitLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 14 },
    iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    habitLabel: { fontSize: 15 },
    habitDesc: { fontSize: 12, marginTop: 2 },
    checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
