import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { useTheme } from '@repo/ui';
import { HapticButton } from '../components/ui';
import { usePersonalizedPlan, useDailyStats } from '@repo/hooks';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { saveWorkout } from '@repo/lib';

export default function WorkoutScreen() {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation();

    // 1. Get Plan
    const { plan, loading: planLoading } = usePersonalizedPlan(supabase, user?.id);

    // 2. Get Today's Logs (to sync state)
    const today = new Date().toISOString().split('T')[0];
    const { workouts, loading: statsLoading, refresh } = useDailyStats(supabase, user?.id, today);

    // Local State
    const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
    const [eveningWalkMinutes, setEveningWalkMinutes] = useState(0);
    const [morningSaved, setMorningSaved] = useState(false);
    const [eveningSaved, setEveningSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync from server on load
    useEffect(() => {
        if (workouts.length > 0) {
            const w = workouts[0];
            if (w.morning_hiit_completed) setMorningSaved(true);

            // Check evening walk
            if (w.evening_walk_minutes && w.evening_walk_minutes > 0) {
                setEveningWalkMinutes(w.evening_walk_minutes);
                setEveningSaved(true);
            }

            // Check exercises
            if (w.exercises_completed && Array.isArray(w.exercises_completed)) {
                setCompletedExercises(new Set(w.exercises_completed));
            }
        }
    }, [workouts]);

    const toggleExercise = (name: string) => {
        const next = new Set(completedExercises);
        if (next.has(name)) next.delete(name);
        else next.add(name);

        setCompletedExercises(next);
        setMorningSaved(false); // Enable save
        Haptics.selectionAsync();
    };

    const handleSaveMorning = async () => {
        setIsSaving(true);
        try {
            const exercisesList = Array.from(completedExercises);
            const isHiitDone = exercisesList.length > 0; // Or validation? Web logic: > 0

            await saveWorkout(supabase, user!.id, {
                date: today,
                morning_hiit_completed: isHiitDone ? 1 : 0,
                exercises_completed: exercisesList,
            });

            setMorningSaved(true);
            await refresh();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Saved', 'Morning HIIT logged successfully!');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveEvening = async () => {
        setIsSaving(true);
        try {
            await saveWorkout(supabase, user!.id, {
                date: today,
                evening_walk_minutes: eveningWalkMinutes,
            });

            setEveningSaved(true);
            await refresh();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Saved', 'Evening walk logged successfully!');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (planLoading || statsLoading) {
        return (
            <View style={[st.container, { backgroundColor: theme.colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator color={theme.colors.primary} />
            </View>
        );
    }

    if (!plan) return null;

    const bgCard = isDark ? '#1e293b' : '#fff';
    const borderCard = isDark ? '#334155' : '#e2e8f0';

    return (
        <View style={[st.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[st.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[st.title, { color: theme.colors.text }]}>Today's Workout</Text>
                    <Text style={[st.subtitle, { color: theme.colors.textSecondary }]}>
                        {plan.workoutType} • {plan.level}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={st.content}>

                {/* Morning HIIT Card */}
                <View style={[st.card, { backgroundColor: bgCard, borderColor: borderCard }]}>
                    <View style={st.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="flame" size={24} color="#f59e0b" style={{ marginRight: 8 }} />
                            <Text style={[st.cardTitle, { color: theme.colors.text }]}>Morning HIIT</Text>
                        </View>
                        {morningSaved && (
                            <View style={[st.badge, { backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : '#dcfce7' }]}>
                                <Text style={[st.badgeText, { color: isDark ? '#4ade80' : '#15803d' }]}>DONE</Text>
                            </View>
                        )}
                    </View>

                    {plan.exercises.length === 0 ? (
                        <Text style={{ textAlign: 'center', marginVertical: 20, color: theme.colors.textSecondary }}>Rest Day!</Text>
                    ) : (
                        <View style={{ gap: 12, marginBottom: 20 }}>
                            {plan.exercises.map((ex, i) => {
                                const checked = completedExercises.has(ex.name);
                                return (
                                    <TouchableOpacity
                                        key={i}
                                        style={[st.exerciseRow, {
                                            backgroundColor: checked
                                                ? (isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff')
                                                : 'transparent',
                                            borderColor: checked ? theme.colors.primary : theme.colors.border
                                        }]}
                                        onPress={() => toggleExercise(ex.name)}
                                    >
                                        <View style={[st.checkbox, {
                                            borderColor: checked ? theme.colors.primary : theme.colors.textSecondary,
                                            backgroundColor: checked ? theme.colors.primary : 'transparent'
                                        }]}>
                                            {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[st.exName, {
                                                color: checked ? theme.colors.textMuted : theme.colors.text,
                                                textDecorationLine: checked ? 'line-through' : 'none'
                                            }]}>
                                                {ex.name.replace(/_/g, ' ')}
                                            </Text>
                                            <Text style={[st.exDetail, { color: theme.colors.textSecondary }]}>
                                                {ex.targetReps} {ex.unit}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    <HapticButton
                        style={[st.saveBtn, {
                            backgroundColor: morningSaved ? (isDark ? '#334155' : '#f1f5f9') : theme.colors.primary,
                            opacity: (morningSaved || completedExercises.size === 0) ? 0.8 : 1
                        }]}
                        onPress={handleSaveMorning}
                        disabled={morningSaved || completedExercises.size === 0 || isSaving}
                    >
                        {isSaving ? <ActivityIndicator color="#fff" /> : (
                            <Text style={[st.saveBtnText, { color: morningSaved ? theme.colors.textSecondary : '#fff' }]}>
                                {morningSaved ? 'Saved' : 'Save HIIT'}
                            </Text>
                        )}
                    </HapticButton>
                </View>

                {/* Evening Cardio Card */}
                <View style={[st.card, { backgroundColor: bgCard, borderColor: borderCard }]}>
                    <View style={st.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="walk" size={24} color="#a855f7" style={{ marginRight: 8 }} />
                            <Text style={[st.cardTitle, { color: theme.colors.text }]}>Evening Walk</Text>
                        </View>
                        {eveningSaved && (
                            <View style={[st.badge, { backgroundColor: isDark ? 'rgba(34,197,94,0.2)' : '#dcfce7' }]}>
                                <Text style={[st.badgeText, { color: isDark ? '#4ade80' : '#15803d' }]}>DONE</Text>
                            </View>
                        )}
                    </View>

                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <Text style={[st.durationBig, { color: theme.colors.text }]}>{eveningWalkMinutes}<Text style={st.minLabel}>min</Text></Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
                        <TouchableOpacity
                            onPress={() => { setEveningWalkMinutes(Math.max(0, eveningWalkMinutes - 5)); setEveningSaved(false); Haptics.selectionAsync(); }}
                            style={[st.adjustBtn, { borderColor: theme.colors.border }]}
                        >
                            <Ionicons name="remove" size={24} color={theme.colors.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => { setEveningWalkMinutes(eveningWalkMinutes + 5); setEveningSaved(false); Haptics.selectionAsync(); }}
                            style={[st.adjustBtn, { borderColor: theme.colors.border }]}
                        >
                            <Ionicons name="add" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                        {[30, 45, 60].map(m => (
                            <TouchableOpacity
                                key={m}
                                onPress={() => { setEveningWalkMinutes(m); setEveningSaved(false); Haptics.selectionAsync(); }}
                                style={[st.presetBtn, {
                                    backgroundColor: eveningWalkMinutes === m ? theme.colors.primary : 'transparent',
                                    borderColor: eveningWalkMinutes === m ? theme.colors.primary : theme.colors.border
                                }]}
                            >
                                <Text style={{ color: eveningWalkMinutes === m ? '#fff' : theme.colors.text, fontWeight: '600' }}>{m}m</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <HapticButton
                        style={[st.saveBtn, {
                            backgroundColor: eveningSaved ? (isDark ? '#334155' : '#f1f5f9') : theme.colors.primary,
                        }]}
                        onPress={handleSaveEvening}
                        disabled={eveningSaved || eveningWalkMinutes === 0 || isSaving}
                    >
                        {isSaving ? <ActivityIndicator color="#fff" /> : (
                            <Text style={[st.saveBtnText, { color: eveningSaved ? theme.colors.textSecondary : '#fff' }]}>
                                {eveningSaved ? 'Saved' : 'Save Walk'}
                            </Text>
                        )}
                    </HapticButton>
                </View>

            </ScrollView>
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
    subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2, textTransform: 'capitalize' },
    content: { padding: 20, paddingBottom: 40 },
    card: {
        borderRadius: 24, borderWidth: 1, padding: 20, marginBottom: 24,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: '700' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: '800' },
    exerciseRow: {
        flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1
    },
    checkbox: {
        width: 24, height: 24, borderRadius: 6, borderWidth: 2,
        alignItems: 'center', justifyContent: 'center', marginRight: 12
    },
    exName: { fontSize: 15, fontWeight: '600', textTransform: 'capitalize', marginBottom: 2 },
    exDetail: { fontSize: 12 },
    saveBtn: {
        borderRadius: 16, paddingVertical: 14, alignItems: 'center', marginTop: 8
    },
    saveBtnText: { fontSize: 14, fontWeight: '700' },
    durationBig: { fontSize: 48, fontWeight: '800' },
    minLabel: { fontSize: 16, fontWeight: '600', marginLeft: 4 },
    adjustBtn: {
        width: 56, height: 56, borderRadius: 28, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center'
    },
    presetBtn: {
        flex: 1, marginHorizontal: 4, paddingVertical: 10, borderRadius: 12, borderWidth: 1,
        alignItems: 'center'
    }
});
