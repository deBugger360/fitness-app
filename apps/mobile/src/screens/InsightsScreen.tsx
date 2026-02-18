
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Mock Data for MVP - ideally fetched from Supabase aggregation
const MOCK_DATA = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
        {
            data: [85, 90, 60, 95, 100, 80, 92],
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Indigo
            strokeWidth: 2
        }
    ],
    legend: ["Consistency Score"]
};

export default function InsightsScreen() {
    const { user } = useAuth();

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
                    data={MOCK_DATA}
                    width={width - 48}
                    height={220}
                    chartConfig={{
                        backgroundColor: "#fff",
                        backgroundGradientFrom: "#fff",
                        backgroundGradientTo: "#fff",
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "5",
                            strokeWidth: "2",
                            stroke: "#4F46E5"
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingTop: 60,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 12,
        alignSelf: 'flex-start',
        paddingLeft: 8,
    },
    comingSoon: {
        color: '#94a3b8',
        padding: 20,
        textAlign: 'center',
    }
});
