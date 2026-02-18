
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@repo/ui';
import { generateRecommendations } from '@repo/lib';
import { Recommendation } from '@repo/shared';

const { width } = Dimensions.get('window');

// Mock chart data for MVP — replace with real aggregation when analytics table is populated
const MOCK_CHART_DATA = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
        {
            data: [85, 90, 60, 95, 100, 80, 92],
            strokeWidth: 2
        }
    ],
    legend: ["Consistency Score"]
};

const PRIORITY_COLORS: Record<string, string> = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981',
};

export default function InsightsScreen() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [loadingRecs, setLoadingRecs] = useState(false);

    const fetchRecommendations = useCallback(async () => {
        if (!user?.id) return;
        setLoadingRecs(true);
        try {
            const recs = await generateRecommendations(supabase, user.id);
            setRecommendations(recs);
        } catch (e) {
            console.error('Failed to fetch recommendations:', e);
        } finally {
            setLoadingRecs(false);
        }
    }, [user?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchRecommendations();
        }, [fetchRecommendations])
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Insights</Text>
                <Text style={styles.subtitle}>Your progress this week</Text>
            </View>

            {/* Consistency Chart */}
            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Consistency Trend</Text>
                <LineChart
                    data={{
                        ...MOCK_CHART_DATA,
                        datasets: [{ ...MOCK_CHART_DATA.datasets[0], color: (opacity = 1) => theme.colors.primary }]
                    }}
                    width={width - 48}
                    height={220}
                    chartConfig={{
                        backgroundColor: theme.colors.card,
                        backgroundGradientFrom: theme.colors.card,
                        backgroundGradientTo: theme.colors.card,
                        decimalPlaces: 0,
                        color: (opacity = 1) => theme.colors.primary,
                        labelColor: (opacity = 1) => theme.colors.textSecondary,
                        style: { borderRadius: 16 },
                        propsForDots: {
                            r: "5",
                            strokeWidth: "2",
                            stroke: theme.colors.primary
                        }
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 16 }}
                />
            </View>

            {/* Recommendations */}
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {loadingRecs ? (
                <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 16 }} />
            ) : recommendations.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No recommendations yet. Keep logging your data!</Text>
                </View>
            ) : (
                recommendations.map((rec) => (
                    <View key={rec.id} style={styles.recCard}>
                        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[rec.priority] || '#6b7280' }]} />
                        <View style={styles.recContent}>
                            <Text style={styles.recTitle}>{rec.title}</Text>
                            <Text style={styles.recMessage}>{rec.message}</Text>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    chartCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 32,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 12,
        alignSelf: 'flex-start',
        paddingLeft: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 16,
    },
    recCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    priorityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 5,
        marginRight: 14,
        flexShrink: 0,
    },
    recContent: {
        flex: 1,
    },
    recTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 4,
    },
    recMessage: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    emptyCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontSize: 14,
    },
});
