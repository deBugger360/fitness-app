
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@repo/ui';

const { width } = Dimensions.get('window');

// Mock Data for MVP - ideally fetched from Supabase aggregation
const MOCK_DATA = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
        {
            data: [85, 90, 60, 95, 100, 80, 92],
            strokeWidth: 2
        }
    ],
    legend: ["Consistency Score"]
};

export default function InsightsScreen() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const styles = getStyles(theme);

    // In a real app, fetch 7-day history here
    useFocusEffect(
        useCallback(() => {
            // fetchAnalytics();
        }, [])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Insights</Text>
                <Text style={styles.subtitle}>Your progress this week</Text>
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Consistency Trend</Text>
                <LineChart
                    data={{
                        ...MOCK_DATA,
                        datasets: [{ ...MOCK_DATA.datasets[0], color: (opacity = 1) => theme.colors.primary }]
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
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "5",
                            strokeWidth: "2",
                            stroke: theme.colors.primary
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />
            </View>

            <View style={[styles.chartCard, { marginTop: 20 }]}>
                <Text style={styles.chartTitle}>Workout Frequency</Text>
                <Text style={styles.comingSoon}>Coming Soon: Detailed breakdown of workout types and nutrition stats.</Text>
            </View>
        </View>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 60,
        paddingHorizontal: 24,
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
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 12,
        alignSelf: 'flex-start',
        paddingLeft: 8,
    },
    comingSoon: {
        color: theme.colors.textSecondary,
        padding: 20,
        textAlign: 'center',
    }
});
