
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function SugarScreen() {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [lastRelapse, setLastRelapse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Animation for "Shield" pulse
    const [pulseAnim] = useState(new Animated.Value(1));

    useFocusEffect(
        useCallback(() => {
            fetchSugarStatus();
            startPulse();
        }, [])
    );

    const startPulse = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const fetchSugarStatus = async () => {
        if (!user?.id) return;

        // Simple logic: count days since last 'intake' log
        const { data } = await supabase
            .from('sugar_logs')
            .select('date')
            .eq('user_id', user.id)
            .eq('type', 'intake')
            .order('date', { ascending: false })
            .limit(1);

        if (data && data.length > 0) {
            const lastDate = new Date(data[0].date);
            const today = new Date();
            const diffTime = Math.abs(today.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1; // -1 because simple diff includes today
            setStreak(Math.max(0, diffDays));
            setLastRelapse(data[0].date);
        } else {
            // No relapse ever logged? Assume 0 or start date. Let's say 0 for now or fetch profile start date.
            setStreak(0);
        }
    };

    const logRelapse = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            await supabase.from('sugar_logs').insert({
                user_id: user.id,
                date: today,
                type: 'intake',
                success_resisted: false
            });
            setStreak(0);
            setLastRelapse(today);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const logResisted = async () => {
        if (!user?.id) return;
        // Just log a craving that was resisted
        const today = new Date().toISOString().split('T')[0];
        try {
            await supabase.from('sugar_logs').insert({
                user_id: user.id,
                date: today,
                type: 'craving',
                success_resisted: true
            });
            alert("Craving Crushed! Stay Strong.");
        } catch (e) {
            console.error(e);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Sugar Shield</Text>
                <Text style={styles.subtitle}>Protect your progress</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Hero Status */}
                <View style={styles.heroContainer}>
                    <Animated.View style={[styles.shieldWrapper, { transform: [{ scale: pulseAnim }] }]}>
                        <Ionicons name="shield-checkmark" size={120} color="#4F46E5" />
                    </Animated.View>
                    <Text style={styles.streakCount}>{streak}</Text>
                    <Text style={styles.streakLabel}>DAYS SUGAR FREE</Text>
                </View>

                {/* Motivational Quote */}
                <View style={styles.quoteCard}>
                    <Text style={styles.quoteText}>
                        "Every craving you resist builds the neurological pathway of a new, healthier you."
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.resistBtn} onPress={logResisted}>
                        <Ionicons name="flash" size={24} color="#fff" />
                        <Text style={styles.resistBtnText}>I Resisted a Craving</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.relapseBtn} onPress={logRelapse}>
                        <Ionicons name="refresh" size={20} color="#ef4444" />
                        <Text style={styles.relapseBtnText}>I Slipped Up (Reset)</Text>
                    </TouchableOpacity>
                </View>

                {lastRelapse && (
                    <Text style={styles.historyText}>Last reset: {lastRelapse}</Text>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    content: {
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    heroContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
        position: 'relative',
    },
    shieldWrapper: {
        marginBottom: 20,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    streakCount: {
        fontSize: 80,
        fontWeight: '900',
        color: '#0f172a',
        lineHeight: 80,
    },
    streakLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: 2,
        marginTop: 8,
    },
    quoteCard: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 20,
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        width: '100%',
    },
    quoteText: {
        fontSize: 16,
        color: '#334155',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 24,
    },
    actionContainer: {
        width: '100%',
        gap: 16,
    },
    resistBtn: {
        backgroundColor: '#4F46E5', // Indigo-600
        paddingVertical: 18,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    resistBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    relapseBtn: {
        backgroundColor: '#fee2e2', // Red-100
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    relapseBtnText: {
        color: '#ef4444', // Red-500
        fontSize: 16,
        fontWeight: '600',
    },
    historyText: {
        marginTop: 24,
        color: '#94a3b8',
        fontSize: 12,
    }
});
