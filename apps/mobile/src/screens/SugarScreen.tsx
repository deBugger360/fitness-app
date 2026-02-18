
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Modal, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { SugarLog } from '@repo/types';
import { getHighRiskHours } from '@repo/lib';

const { width } = Dimensions.get('window');

export default function SugarScreen() {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [shieldOpacity] = useState(new Animated.Value(0.3));
    const [logs, setLogs] = useState<SugarLog[]>([]);

    // Logger Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [logType, setLogType] = useState<'craving' | 'intake'>('craving');
    const [trigger, setTrigger] = useState('');
    const [mood, setMood] = useState('');
    const [severity, setSeverity] = useState(5);

    const TRIGGERS = ["Stress", "Boredom", "Social", "Habit", "Hunger", "Tired"];
    const MOODS = ["Anxious", "Sad", "Neutral", "Happy", "Excited"];

    const refreshData = useCallback(async () => {
        if (!user) return;

        // 1. Fetch recent logs for history & analytics
        const { data: recentLogs } = await supabase
            .from('sugar_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (recentLogs) setLogs(recentLogs as SugarLog[]);

        // 2. Calculate Streak (Days since last Intake)
        const { data: lastIntake } = await supabase
            .from('sugar_logs')
            .select('created_at')
            .eq('user_id', user.id)
            .eq('type', 'intake')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (lastIntake) {
            const lastDate = new Date(lastIntake.created_at);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastDate.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            setStreak(diffDays);
        } else {
            // If no intakes found, calculate from account creation or start of logs?
            // For MVP: assume 0 if no history, or maybe check first log date if exist.
            // Let's assume 0 strictly to encourage logging.
            setStreak(recentLogs && recentLogs.length > 0 ?
                Math.floor((new Date().getTime() - new Date(recentLogs[recentLogs.length - 1].created_at!).getTime()) / (1000 * 3600 * 24))
                : 0
            );
        }

    }, [user]);

    useFocusEffect(
        useCallback(() => {
            refreshData();
            startPulse();
        }, [refreshData])
    );

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shieldOpacity, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(shieldOpacity, { toValue: 0.3, duration: 2000, useNativeDriver: true })
            ])
        ).start();
    };

    const openLogger = (type: 'craving' | 'intake') => {
        setLogType(type);
        setTrigger('');
        setMood('');
        setSeverity(5);
        setModalVisible(true);
    };

    const submitLog = async () => {
        if (!user) return;

        const isResisted = logType === 'craving';

        const newLog: Partial<SugarLog> = {
            user_id: user.id,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            created_at: new Date().toISOString(),         // Full timestamp
            type: logType,
            success_resisted: isResisted,
            trigger: trigger || 'Unknown',
            mood_context: mood || 'Unknown',
            severity: severity,
        };

        const { error } = await supabase.from('sugar_logs').insert(newLog);

        if (!error) {
            setModalVisible(false);
            refreshData(); // Refresh list and streak
        } else {
            alert('Failed to save log');
        }
    };

    // Analytics Insight
    const riskData = getHighRiskHours(logs);
    const topRiskHour = riskData.length > 0 ? riskData[0].hour : null;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.header}>
                    <Text style={styles.title}>Sugar Shield</Text>

                    <View style={styles.shieldContainer}>
                        <Animated.View style={[styles.pulseRing, { opacity: shieldOpacity }]}>
                            <Ionicons name="shield-checkmark" size={140} color="#4F46E5" />
                        </Animated.View>
                        <View style={styles.streakBadge}>
                            <Text style={styles.streakNumber}>{streak}</Text>
                            <Text style={styles.streakLabel}>DAYS FREE</Text>
                        </View>
                    </View>

                    {/* Risk Insight */}
                    {topRiskHour !== null && (
                        <View style={styles.insightBox}>
                            <Ionicons name="alert-circle-outline" size={20} color="#ea580c" />
                            <Text style={styles.insightText}>
                                High risk time: <Text style={{ fontWeight: '700' }}>{topRiskHour}:00 - {topRiskHour + 1}:00</Text>
                            </Text>
                        </View>
                    )}
                </LinearGradient>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.resistButton]}
                        onPress={() => openLogger('craving')}>
                        <Ionicons name="flash" size={24} color="#fff" />
                        <Text style={styles.actionText}>Log Craving</Text>
                        <Text style={styles.actionSubtext}>I resisted it!</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.relapseButton]}
                        onPress={() => openLogger('intake')}>
                        <Ionicons name="refresh-circle" size={28} color="#fff" />
                        <Text style={styles.actionText}>Log Slip-up</Text>
                        <Text style={styles.actionSubtext}>Reset Streak</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent History */}
                <View style={styles.historySection}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    {logs.length === 0 ? (
                        <Text style={styles.emptyText}>No logs yet. Start tracking to build your shield!</Text>
                    ) : (
                        logs.map(log => (
                            <View key={log.id} style={styles.logItem}>
                                <View style={[
                                    styles.dot,
                                    { backgroundColor: log.type === 'intake' ? '#ef4444' : '#22c55e' }
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
                                            {log.trigger} • {log.mood_context} • Lvl {log.severity || '-'}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Modal Logger */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {logType === 'craving' ? 'Resisting Craving' : 'Logging Slip-up'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>What triggered it?</Text>
                        <View style={styles.chipContainer}>
                            {TRIGGERS.map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[styles.chip, trigger === t && styles.chipActive]}
                                    onPress={() => setTrigger(t)}
                                >
                                    <Text style={[styles.chipText, trigger === t && styles.chipTextActive]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Current Mood?</Text>
                        <View style={styles.chipContainer}>
                            {MOODS.map(m => (
                                <TouchableOpacity
                                    key={m}
                                    style={[styles.chip, mood === m && styles.chipActive]}
                                    onPress={() => setMood(m)}
                                >
                                    <Text style={[styles.chipText, mood === m && styles.chipTextActive]}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Intensity: {severity}/10</Text>
                        <View style={styles.sliderRow}>
                            {[1, 3, 5, 7, 10].map(v => (
                                <TouchableOpacity key={v} onPress={() => setSeverity(v)} style={[
                                    styles.severityBtn,
                                    severity === v && { backgroundColor: '#4F46E5', borderColor: '#4F46E5' }
                                ]}>
                                    <Text style={[styles.severityText, severity === v && { color: '#fff' }]}>{v}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity onPress={submitLog} style={styles.saveBtn}>
                            <Text style={styles.saveText}>Save Log</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { padding: 24, paddingTop: 60, alignItems: 'center' },
    title: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 20 },
    shieldContainer: { alignItems: 'center', justifyContent: 'center', height: 200, marginBottom: 20 },
    pulseRing: { position: 'absolute' },
    streakBadge: { position: 'absolute', alignItems: 'center' },
    streakNumber: { fontSize: 40, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 10 },
    streakLabel: { fontSize: 12, fontWeight: '700', color: '#e2e8f0', letterSpacing: 1 },

    insightBox: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed',
        padding: 12, borderRadius: 12, marginTop: 16
    },
    insightText: { color: '#9a3412', marginLeft: 8, fontSize: 14 },

    actions: { flexDirection: 'row', padding: 20, gap: 12 },
    actionButton: {
        flex: 1, padding: 20, borderRadius: 20, alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3
    },
    resistButton: { backgroundColor: '#4F46E5' }, // Indigo
    relapseButton: { backgroundColor: '#ef4444' }, // Red
    actionText: { color: '#fff', fontWeight: '700', fontSize: 16, marginTop: 8 },
    actionSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },

    historySection: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 12 },
    emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 20 },
    logItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        padding: 16, borderRadius: 12, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
    },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
    logType: { fontSize: 16, fontWeight: '600', color: '#334155' },
    logTime: { fontSize: 12, color: '#94a3b8' },
    logContext: { fontSize: 13, color: '#64748b', marginTop: 2 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
    label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 12, marginTop: 12 },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9' },
    chipActive: { backgroundColor: '#e0e7ff', borderWidth: 1, borderColor: '#c7d2fe' },
    chipText: { color: '#64748b', fontSize: 14 },
    chipTextActive: { color: '#4338ca', fontWeight: '600' },

    sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 32 },
    severityBtn: {
        width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#e2e8f0',
        alignItems: 'center', justifyContent: 'center'
    },
    severityText: { fontSize: 16, fontWeight: '600', color: '#64748b' },

    saveBtn: { backgroundColor: '#4F46E5', borderRadius: 12, padding: 16, alignItems: 'center' },
    saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
