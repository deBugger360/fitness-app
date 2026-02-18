
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
import { useTheme } from '@repo/ui';

// Animated Circle Component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ConsistencyRing = ({ score, theme }: { score: number, theme: any }) => {
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
        <View style={styles(theme).ringContainer}>
            <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth} viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}>
                <G rotation="-90" origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}>
                    <Circle
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        stroke={theme.colors.border}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    <AnimatedCircle
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        stroke={theme.colors.primary}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </G>
            </Svg>
            <View style={styles(theme).scoreContent}>
                <Text style={styles(theme).scoreText}>{score}%</Text>
                <Text style={styles(theme).scoreLabel}>Consistency</Text>
            </View>
        </View>
    );
};

const QuickAction = ({ label, icon, onPress, color, count = 0, theme }: any) => (
    <HapticButton
        style={styles(theme).actionButton}
        onPress={onPress}
        hapticType={Haptics.ImpactFeedbackStyle.Medium}
    >
        <View style={[styles(theme).iconCircle, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles(theme).actionLabel}>{label}</Text>
            {count > 0 && <Text style={styles(theme).actionCount}>{count} today</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
    </HapticButton>
);

const StatCard = ({ label, value, unit, theme }: any) => (
    <View style={styles(theme).statCard}>
        <Text style={styles(theme).statValue}>{value}</Text>
        <Text style={styles(theme).statUnit}>{unit}</Text>
        <Text style={styles(theme).statLabel}>{label}</Text>
    </View>
);

import { Skeleton } from '../components/ui';

export default function TodayScreen({ navigation }: any) {
    const { user } = useAuth();
    const { theme, isDark } = useTheme();
    const { loading, score, streak, stats, logAction, refresh } = useTodayData(user?.id);

    const userName = user?.email?.split('@')[0] || "Friend";

    if (loading && !stats) { // Initial load only, not refresh
        return (
            <View style={styles(theme).container}>
                <StatusBar style={isDark ? "light" : "dark"} />
                <View style={styles(theme).scrollContent}>
                    {/* Header Skeleton */}
                    <View style={styles(theme).header}>
                        <View>
                            <Skeleton width={120} height={16} style={{ marginBottom: 8 }} />
                            <Skeleton width={200} height={32} />
                        </View>
                        <Skeleton width={48} height={48} borderRadius={24} />
                    </View>

                    {/* Hero Skeleton */}
                    <View style={[styles(theme).heroSection, { height: 250, justifyContent: 'center' }]}>
                        <Skeleton width={160} height={160} borderRadius={80} />
                    </View>

                    {/* Stats Skeleton */}
                    <View style={styles(theme).statsRow}>
                        <Skeleton width="30%" height={80} borderRadius={20} />
                        <Skeleton width="30%" height={80} borderRadius={20} />
                        <Skeleton width="30%" height={80} borderRadius={20} />
                    </View>

                    {/* Actions Skeleton */}
                    <Skeleton width={150} height={24} style={{ marginBottom: 16 }} />
                    <View style={styles(theme).actionGrid}>
                        <Skeleton width="100%" height={80} borderRadius={24} />
                        <Skeleton width="100%" height={80} borderRadius={24} />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles(theme).container}>
            <StatusBar style={isDark ? "light" : "dark"} />
            <ScrollView
                contentContainerStyle={styles(theme).scrollContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.colors.text} />}
            >
                {/* Header */}
                <View style={styles(theme).header}>
                    <View>
                        <Text style={styles(theme).greeting}>Good Morning,</Text>
                        <Text style={styles(theme).name}>{userName.charAt(0).toUpperCase() + userName.slice(1)}</Text>
                    </View>
                    <HapticButton style={styles(theme).profileButton} onPress={() => navigation.navigate('Profile')}>
                        <Ionicons name="person-circle-outline" size={40} color={theme.colors.textSecondary} />
                    </HapticButton>
                </View>

                {/* Hero: Consistency Ring */}
                <View style={styles(theme).heroSection}>
                    <ConsistencyRing score={score} theme={theme} />
                </View>

                {/* Stats Row */}
                <View style={styles(theme).statsRow}>
                    <StatCard label="Streak" value={streak} unit="Days" theme={theme} />
                    <StatCard label="Workouts" value={stats.workouts} unit="Session" theme={theme} />
                    <StatCard label="Water" value={stats.water} unit="Cups" theme={theme} />
                </View>

                {/* Quick Actions */}
                <Text style={styles(theme).sectionTitle}>Quick Logger</Text>
                <View style={styles(theme).actionGrid}>
                    <QuickAction
                        label="Log Workout"
                        icon="barbell"
                        color={theme.colors.warning} // Amber for workouts
                        count={stats.workouts}
                        onPress={() => logAction('workout')}
                        theme={theme}
                    />
                    <QuickAction
                        label="Log Meal"
                        icon="restaurant"
                        color={theme.colors.success} // Emerald for meals
                        count={stats.meals}
                        onPress={() => navigation.navigate('Meals')}
                        theme={theme}
                    />
                    <QuickAction
                        label="Log Water"
                        icon="water"
                        color={theme.colors.primary} // Blue for water
                        count={stats.water}
                        onPress={() => logAction('water')}
                        theme={theme}
                    />
                    <QuickAction
                        label="Log Sugar"
                        icon="alert-circle"
                        color={theme.colors.error} // Red for sugar
                        count={stats.cravings}
                        onPress={() => navigation.navigate('Sugar')}
                        theme={theme}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
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
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    name: {
        fontSize: 28,
        color: theme.colors.text,
        fontWeight: '700',
    },
    profileButton: {
        padding: 4,
    },
    heroSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        backgroundColor: theme.colors.card,
        borderRadius: 32,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        color: theme.colors.text,
    },
    scoreLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
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
        backgroundColor: theme.colors.card,
        width: '30%',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    statUnit: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    statLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        marginTop: 8,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 16,
    },
    actionGrid: {
        gap: 16,
    },
    actionButton: {
        width: '100%',
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 24,
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
        color: theme.colors.text,
    },
    actionCount: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2
    }
});
