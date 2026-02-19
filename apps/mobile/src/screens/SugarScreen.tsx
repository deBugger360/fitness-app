import React, { useState, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Modal, Dimensions, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { getHighRiskHours } from '@repo/analytics';
import { useSugarLogs } from '@repo/hooks';
import { useTheme } from '@repo/ui';
import { HapticButton, Skeleton } from '../components/ui';
import Animated, {
    useSharedValue,
    withRepeat,
    withTiming,
    useAnimatedStyle,
    withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const TRIGGERS = ['Stress', 'Boredom', 'Social', 'Habit', 'Hunger', 'Tired'];
const MOODS = ['Anxious', 'Sad', 'Neutral', 'Happy', 'Excited'];

// ─── Error banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, theme }: { message: string; theme: any }) => (
    <View style={[bannerStyles.wrap, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}>
        <Ionicons name="alert-circle-outline" size={15} color={theme.colors.error} />
        <Text style={[bannerStyles.text, { color: theme.colors.error }]}>{message}</Text>
    </View>
);
const bannerStyles = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, margin: 16, marginBottom: 0 },
    text: { fontSize: 13, flex: 1 },
});

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function SugarScreen() {
    const { user } = useAuth();
    const { theme } = useTheme();

    // ── Shared hook — same as web ──────────────────────────────────────────
    const { sugarLogs, loading, error, refresh, logSugar } = useSugarLogs(
        supabase,
        user?.id
    );

    // Re-fetch on tab focus
    useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

    // ── Streak calculation (days since last intake) ────────────────────────
    const streak = React.useMemo(() => {
        const lastIntake = sugarLogs.find(l => l.type === 'intake');
        if (!lastIntake) return sugarLogs.length > 0
            ? Math.floor((Date.now() - new Date(sugarLogs[sugarLogs.length - 1].created_at!).getTime()) / 86_400_000)
            : 0;
        return Math.floor((Date.now() - new Date(lastIntake.created_at!).getTime()) / 86_400_000);
    }, [sugarLogs]);

    // ── Shield animation ───────────────────────────────────────────────────
    const shieldScale = useSharedValue(1);
    const shieldOpacity = useSharedValue(0.3);

    useFocusEffect(useCallback(() => {
        shieldOpacity.value = withRepeat(withSequence(
            withTiming(0.6, { duration: 1500 }),
            withTiming(0.2, { duration: 1500 })
        ), -1, true);
        shieldScale.value = withRepeat(withSequence(
            withTiming(1.05, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
        ), -1, true);
    }, []));

    const animatedShieldStyle = useAnimatedStyle(() => ({ transform: [{ scale: shieldScale.value }] }));
    const animatedPulseStyle = useAnimatedStyle(() => ({ opacity: shieldOpacity.value, transform: [{ scale: shieldScale.value }] }));

    // ── Logger modal state ─────────────────────────────────────────────────
    const [modalVisible, setModalVisible] = useState(false);
    const [logType, setLogType] = useState<'craving' | 'intake'>('craving');
    const [trigger, setTrigger] = useState('');
    const [mood, setMood] = useState('');
    const [severity, setSeverity] = useState(5);
    const [saving, setSaving] = useState(false);

    const openLogger = (type: 'craving' | 'intake') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLogType(type);
        setTrigger('');
        setMood('');
        setSeverity(5);
        setModalVisible(true);
    };

    // ── Submit — delegates to shared useSugarLogs hook (optimistic) ────────
    const submitLog = async () => {
        setSaving(true);
        try {
            const result = await logSugar({
                type: logType,
                success_resisted: logType === 'craving',
                trigger: trigger || 'Unknown',
                mood_context: mood || 'Unknown',
                severity,
            });
            if (result) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setModalVisible(false);
            }
        } finally {
            setSaving(false);
        }
    };

    const riskData = getHighRiskHours(sugarLogs);
    const topRiskHour = riskData.length > 0 ? riskData[0].hour : null;
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refresh}
                        tintColor={theme.colors.text}
                    />
                }
            >
                {error && <ErrorBanner message={error} theme={theme} />}

                <LinearGradient
                    colors={[theme.colors.background, theme.colors.card]}
                    style={styles.header}
                >
                    <Text style={styles.title}>Sugar Shield</Text>

                    <View style={styles.shieldContainer}>
                        <Animated.View style={[styles.pulseRing, animatedPulseStyle]}>
                            <Ionicons name="shield" size={160} color={theme.colors.primary} />
                        </Animated.View>
                        <Animated.View style={[styles.shieldIcon, animatedShieldStyle]}>
                            <Ionicons name="shield-checkmark" size={140} color={theme.colors.primary} />
                        </Animated.View>

                        <View style={styles.streakBadge}>
                            <Text style={styles.streakNumber}>{streak}</Text>
                            <Text style={styles.streakLabel}>DAYS FREE</Text>
                        </View>
                    </View>

                    {topRiskHour !== null && (
                        <View style={styles.insightBox}>
                            <Ionicons name="stats-chart" size={20} color={theme.colors.warning} />
                            <Text style={styles.insightText}>
                                High risk time:{' '}
                                <Text style={{ fontWeight: '700' }}>
                                    {topRiskHour}:00 – {topRiskHour + 1}:00
                                </Text>
                            </Text>
                        </View>
                    )}
                </LinearGradient>

                {/* Action buttons */}
                <View style={styles.actions}>
                    <HapticButton
                        style={[styles.actionButton, styles.resistButton]}
                        onPress={() => openLogger('craving')}
                        hapticType={Haptics.ImpactFeedbackStyle.Heavy}
                    >
                        <Ionicons name="flash" size={24} color="#fff" />
                        <Text style={styles.actionText}>Log Craving</Text>
                        <Text style={styles.actionSubtext}>I resisted it!</Text>
                    </HapticButton>

                    <HapticButton
                        style={[styles.actionButton, styles.relapseButton]}
                        onPress={() => openLogger('intake')}
                        hapticType={Haptics.ImpactFeedbackStyle.Medium}
                    >
                        <Ionicons name="refresh-circle" size={28} color="#fff" />
                        <Text style={styles.actionText}>Log Slip-up</Text>
                        <Text style={styles.actionSubtext}>Reset Streak</Text>
                    </HapticButton>
                </View>

                {/* Recent History — uses real-time logs from the hook */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {(loading && sugarLogs.length === 0) ? (
                        <View style={{ gap: 8 }}>
                            <Skeleton width="100%" height={64} borderRadius={12} />
                            <Skeleton width="100%" height={64} borderRadius={12} />
                            <Skeleton width="100%" height={64} borderRadius={12} />
                        </View>
                    ) : sugarLogs.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No logs yet. Start tracking to build your shield!
                        </Text>
                    ) : (
                        sugarLogs.slice(0, 20).map(log => (
                            <View key={log.id} style={styles.logItem}>
                                <View style={[
                                    styles.dot,
                                    { backgroundColor: log.type === 'intake' ? theme.colors.error : theme.colors.success }
                                ]} />
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <Text style={styles.logType}>
                                            {log.type === 'intake' ? 'Sugar Intake' : 'Resisted Craving'}
                                        </Text>
                                        <Text style={styles.logTime}>
                                            {new Date(log.created_at || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    {(log.trigger || log.mood_context) && (
                                        <Text style={styles.logContext}>
                                            {log.trigger} · {log.mood_context} · Lvl {log.severity || '–'}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Logger modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {logType === 'craving' ? 'Resisting Craving' : 'Logging Slip-up'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>What triggered it?</Text>
                        <View style={styles.chipContainer}>
                            {TRIGGERS.map(t => (
                                <HapticButton
                                    key={t}
                                    style={[styles.chip, trigger === t && styles.chipActive]}
                                    onPress={() => setTrigger(t)}
                                >
                                    <Text style={[styles.chipText, trigger === t && styles.chipTextActive]}>{t}</Text>
                                </HapticButton>
                            ))}
                        </View>

                        <Text style={styles.label}>Current Mood?</Text>
                        <View style={styles.chipContainer}>
                            {MOODS.map(m => (
                                <HapticButton
                                    key={m}
                                    style={[styles.chip, mood === m && styles.chipActive]}
                                    onPress={() => setMood(m)}
                                >
                                    <Text style={[styles.chipText, mood === m && styles.chipTextActive]}>{m}</Text>
                                </HapticButton>
                            ))}
                        </View>

                        <Text style={styles.label}>Intensity: {severity}/10</Text>
                        <View style={styles.sliderRow}>
                            {[1, 3, 5, 7, 10].map(v => (
                                <HapticButton
                                    key={v}
                                    onPress={() => setSeverity(v)}
                                    style={[
                                        styles.severityBtn,
                                        severity === v && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                                    ]}
                                >
                                    <Text style={[styles.severityText, severity === v && { color: '#fff' }]}>{v}</Text>
                                </HapticButton>
                            ))}
                        </View>

                        <HapticButton
                            onPress={submitLog}
                            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                            hapticType={Haptics.NotificationFeedbackType.Success}
                        >
                            <Text style={styles.saveText}>{saving ? 'Saving…' : 'Save Log'}</Text>
                        </HapticButton>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { padding: 24, paddingTop: 60, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    title: { fontSize: 24, fontWeight: '800', color: theme.colors.text, marginBottom: 20 },
    shieldContainer: { alignItems: 'center', justifyContent: 'center', height: 220, marginBottom: 10, position: 'relative' },
    pulseRing: { position: 'absolute', opacity: 0.2 },
    shieldIcon: { zIndex: 1 },
    streakBadge: { position: 'absolute', alignItems: 'center', zIndex: 2 },
    streakNumber: { fontSize: 40, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 10 },
    streakLabel: { fontSize: 12, fontWeight: '700', color: '#e2e8f0', letterSpacing: 1 },
    insightBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.warningLight, padding: 12, borderRadius: 12, marginTop: 16 },
    insightText: { color: theme.colors.warning, marginLeft: 8, fontSize: 14 },
    actions: { flexDirection: 'row', padding: 20, gap: 12, marginTop: -20 },
    actionButton: { flex: 1, padding: 20, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    resistButton: { backgroundColor: theme.colors.primary },
    relapseButton: { backgroundColor: theme.colors.error },
    actionText: { color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 8 },
    actionSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    historySection: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 12 },
    emptyText: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 20 },
    logItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, padding: 16, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
    logType: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    logTime: { fontSize: 12, color: theme.colors.textSecondary },
    logContext: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, marginBottom: 12, marginTop: 12 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
    chipActive: { backgroundColor: theme.colors.primaryLight, borderWidth: 1, borderColor: theme.colors.primary },
    chipText: { color: theme.colors.textSecondary, fontSize: 14 },
    chipTextActive: { color: theme.colors.primary, fontWeight: '600' },
    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 32 },
    severityBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
    severityText: { fontSize: 16, fontWeight: '600', color: theme.colors.textSecondary },
    saveBtn: { backgroundColor: theme.colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
