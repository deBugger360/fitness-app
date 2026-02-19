
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../context/AuthProvider';
import { useTheme } from '@repo/ui';
import { FOUNDATION_PRINCIPLES } from '@repo/shared';
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
                        <Ionicons
                            name={ionicon as any}
                            size={20}
                            color={isChecked ? '#fff' : theme.colors.textSecondary}
                        />
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

// ─── Progress bar component ───────────────────────────────────────────────────────
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

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ActivityScreen() {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const [habits, setHabits] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

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

    useEffect(() => { fetchHabits(); }, [user?.id]);

    const fetchHabits = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('foundations')
                .select('notes')
                .eq('user_id', user.id)
                .eq('date', today)
                .single();
            setHabits(data?.notes || {});
        } catch { /* first log of the day — no record yet */ }
        finally { setLoading(false); }
    };

    const toggleHabit = async (habitId: string) => {
        if (!user?.id) return;
        const newHabits = { ...habits, [habitId]: !habits[habitId] };
        setHabits(newHabits);
        try {
            const { error } = await supabase
                .from('foundations')
                .upsert({ user_id: user.id, date: today, notes: newHabits }, { onConflict: 'user_id, date' });
            if (error) throw error;
        } catch { setHabits(habits); }
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
            </Animated.View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
    header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    date: { fontSize: 14, fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    content: { paddingHorizontal: 24, paddingBottom: 48 },

    // Progress card
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

    // Habits card
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
