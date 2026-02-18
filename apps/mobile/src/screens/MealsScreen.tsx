
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { MealLog } from '@repo/types';

export default function MealsScreen() {
    const { user } = useAuth();
    const [log, setLog] = useState('');
    const [quality, setQuality] = useState<'healthy' | 'moderate' | 'unhealthy'>('moderate');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchHistory();
    }, [user?.id]);

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

        setLoading(true);
        try {
            const { error } = await supabase.from('meals').insert({
                user_id: user.id,
                date: today,
                quality,
                description: log,
                green_tea_cups: 0 // Placeholder or separate input
            });

            if (error) throw error;

            setLog('');
            fetchHistory(); // Refresh list
            Alert.alert("Logged", "Meal tracked successfully!");
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Meals</Text>
                <Text style={styles.date}>Track your nutrition</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Input Card */}
                <View style={styles.inputCard}>
                    <Text style={styles.label}>What did you eat?</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Grilled Chicken Salad..."
                        value={log}
                        onChangeText={setLog}
                        multiline
                    />

                    <Text style={styles.label}>Quality</Text>
                    <View style={styles.qualityRow}>
                        <TouchableOpacity
                            style={[
                                styles.qualityBtn,
                                quality === 'healthy' && styles.qualityBtn_healthy
                            ]}
                            onPress={() => setQuality('healthy')}
                        >
                            <Text style={[styles.qualityText, quality === 'healthy' && styles.qualityTextActive]}>Healthy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.qualityBtn,
                                quality === 'moderate' && styles.qualityBtn_moderate
                            ]}
                            onPress={() => setQuality('moderate')}
                        >
                            <Text style={[styles.qualityText, quality === 'moderate' && styles.qualityTextActive]}>Moderate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.qualityBtn,
                                quality === 'unhealthy' && styles.qualityBtn_unhealthy
                            ]}
                            onPress={() => setQuality('unhealthy')}
                        >
                            <Text style={[styles.qualityText, quality === 'unhealthy' && styles.qualityTextActive]}>Unhealthy</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, loading && styles.disabledBtn]}
                        onPress={submitLog}
                        disabled={loading}
                    >
                        <Text style={styles.submitText}>{loading ? "Saving..." : "Log Meal"}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* History List */}
                <Text style={styles.sectionTitle}>Today's Log</Text>
                {history.map((item, index) => (
                    <View key={item.id || index} style={styles.historyItem}>
                        <View style={[styles.dot, {
                            backgroundColor: item.quality === 'healthy' ? '#10B981' : item.quality === 'moderate' ? '#F59E0B' : '#EF4444'
                        }]} />
                        <Text style={styles.historyText}>{item.description}</Text>
                        <Text style={styles.historyTime}>
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                ))}

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
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
    },
    date: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    inputCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 12,
        marginTop: 4,
    },
    input: {
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#0f172a',
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    qualityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 8,
    },
    qualityBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    qualityBtn_healthy: { backgroundColor: '#10B981', },
    qualityBtn_moderate: { backgroundColor: '#F59E0B', },
    qualityBtn_unhealthy: { backgroundColor: '#EF4444', },
    qualityText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    qualityTextActive: {
        color: '#fff',
    },
    submitBtn: {
        backgroundColor: '#0f172a', // Slate-900
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    submitText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 12,
    },
    historyText: {
        flex: 1,
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
    },
    historyTime: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
