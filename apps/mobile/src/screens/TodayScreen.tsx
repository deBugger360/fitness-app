
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthProvider';
import { StatusBar } from 'expo-status-bar';
import Svg, { Circle, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTodayData } from '../hooks/useTodayData';
import { HapticButton } from '../components/ui/HapticButton';
import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Animated Circle Component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ConsistencyRing = ({ score }: { score: number }) => {
    const radius = 80;
    const strokeWidth = 15;
    const circumference = 2 * Math.PI * radius;
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(score / 100, { duration: 1500 });
    }, [score]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - progress.value * circumference;
        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={styles.ringContainer}>
            <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth} viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}>
                <G rotation="-90" origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}>
                    <Circle
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        stroke="#e2e8f0" // Slate-200
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <AnimatedCircle
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        stroke="#4F46E5" // Indigo-600
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </G>
            </Svg>
            <View style={styles.scoreContent}>
                <Text style={styles.scoreText}>{score}%</Text>
                <Text style={styles.scoreLabel}>Consistency</Text>
            </View>
        </View>
    );
};

const QuickAction = ({ label, icon, onPress, color = "#4F46E5", count = 0 }: any) => (
    <HapticButton
        style={styles.actionButton}
        onPress={onPress}
        hapticType={Haptics.ImpactFeedbackStyle.Medium}
    >
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.actionLabel}>{label}</Text>
            {count > 0 && <Text style={styles.actionCount}>{count} today</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </HapticButton>
);

const StatCard = ({ label, value, unit }: any) => (
    <View style={styles.statCard}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statUnit}>{unit}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

export default function TodayScreen({ navigation }: any) {
    const { user } = useAuth();
    const { loading, score, streak, stats, logAction, refresh } = useTodayData(user?.id);

    const userName = user?.email?.split('@')[0] || "Friend";

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good Morning,</Text>
                        <Text style={styles.name}>{userName.charAt(0).toUpperCase() + userName.slice(1)}</Text>
                    </View>
                    <HapticButton style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
                        <Ionicons name="person-circle-outline" size={40} color="#64748b" />
                    </HapticButton>
                </View>

                {/* Hero: Consistency Ring */}
                <View style={styles.heroSection}>
                    <ConsistencyRing score={score} />
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <StatCard label="Streak" value={streak} unit="Days" />
                    <StatCard label="Workouts" value={stats.workouts} unit="Session" />
                    <StatCard label="Water" value={stats.water} unit="Cups" />
                </View>

                {/* Quick Actions */}
                <Text style={styles.sectionTitle}>Quick Logger</Text>
                <View style={styles.actionGrid}>
                    <QuickAction
                        label="Log Workout"
                        icon="barbell"
                        color="#F59E0B" // Amber
                        count={stats.workouts}
                        onPress={() => logAction('workout')}
                    />
                    <QuickAction
                        label="Log Meal"
                        icon="restaurant"
                        color="#10B981" // Emerald
                        count={stats.meals}
                        onPress={() => navigation.navigate('Meals')}
                    />
                    <QuickAction
                        label="Log Water"
                        icon="water"
                        color="#3B82F6" // Blue
                        count={stats.water}
                        onPress={() => logAction('water')}
                    />
                    <QuickAction
                        label="Log Sugar"
                        icon="alert-circle"
                        color="#EF4444" // Red
                        count={stats.cravings}
                        onPress={() => navigation.navigate('Sugar')}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc', // Slate-50
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontSize: 16,
        color: '#64748b', // Slate-500
        fontWeight: '500',
    },
    name: {
        fontSize: 28,
        color: '#0f172a', // Slate-900
        fontWeight: '700',
    },
    profileButton: {
        padding: 4,
    },
    heroSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        backgroundColor: '#fff',
        borderRadius: 32,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    ringContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreContent: {
        position: 'absolute',
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#0f172a',
    },
    scoreLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    statCard: {
        backgroundColor: '#fff',
        width: '30%',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
    },
    statUnit: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    statLabel: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 8,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 16,
    },
    actionGrid: {
        gap: 16,
    },
    actionButton: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    actionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
    actionCount: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2
    }
});
