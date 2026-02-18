
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { useTheme } from '@repo/ui';
import { validateMealInput } from '@repo/shared';

export default function MealsScreen() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [log, setLog] = useState('');
    const [quality, setQuality] = useState<'healthy' | 'moderate' | 'unhealthy'>('moderate');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const styles = getStyles(theme);
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
            // Use shared validation to enforce defaults
            const mealData = validateMealInput({
                date: today,
                quality,
                description: log,
                green_tea_cups: 0
            });

            const { error } = await supabase.from('meals').insert({
                user_id: user.id,
                ...mealData
            });

            if (error) throw error;

            setLog('');
            fetchHistory();
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
                        placeholderTextColor={theme.colors.textSecondary}
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
                            backgroundColor: item.quality === 'healthy' ? theme.colors.success : item.quality === 'moderate' ? theme.colors.warning : theme.colors.error
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

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text,
    },
    date: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    inputCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 12,
        marginTop: 4,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: theme.colors.text,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    qualityBtn_healthy: { backgroundColor: theme.colors.success, borderColor: theme.colors.success },
    qualityBtn_moderate: { backgroundColor: theme.colors.warning, borderColor: theme.colors.warning },
    qualityBtn_unhealthy: { backgroundColor: theme.colors.error, borderColor: theme.colors.error },
    qualityText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    qualityTextActive: {
        color: '#fff',
    },
    submitBtn: {
        backgroundColor: theme.colors.text, // Invert (dark bg on light mode, light bg on dark mode)? No, usually Primary or solid dark.
        // Let's use Primary for consistency or Text (black/white)
        // If we use 'text', in dark mode it's white (good), in light mode it's black (good).
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
        color: theme.colors.background, // Text on submit button should contrast
        fontWeight: '700',
        fontSize: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 16,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        color: theme.colors.text,
        fontWeight: '500',
    },
    historyTime: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
});
