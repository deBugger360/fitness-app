import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Switch, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, supabase } from '../context/AuthProvider';
import { NotificationService } from '../services/NotificationService';
import { useTheme } from '@repo/ui';
import { HapticButton } from '../components/ui';
import { useUserProfile, useDateRangeData } from '@repo/hooks';
import Animated, {
    useSharedValue,
    withSpring,
    withDelay,
    withTiming,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const NOTIFICATION_PREFS_DEFAULT = {
    workout: true,
    craving: true,
    walk: true,
    streak: true,
};

type PrefKey = keyof typeof NOTIFICATION_PREFS_DEFAULT;

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Week Progress Component ─────────────────────────────────────────────────
const WeekProgress = ({ workouts, theme, isDark }: any) => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - 6 + i);
        return d.toISOString().split('T')[0];
    });

    const completedCount = last7Days.filter(date =>
        workouts.some((w: any) => w.date === date)
    ).length;

    return (
        <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
                <Text style={[st.sectionLabel, { marginBottom: 0, color: theme.colors.textSecondary }]}>LAST 7 DAYS</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}>
                    {completedCount}/7 Workouts
                </Text>
            </View>
            <View style={[st.card, {
                backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : '#fff',
                flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 20
            }]}>
                {last7Days.map((date, i) => {
                    const isCompleted = workouts.some((w: any) => w.date === date);
                    const dayLabel = WEEK_DAYS[new Date(date).getDay()];
                    const isToday = date === today.toISOString().split('T')[0];

                    return (
                        <View key={date} style={{ alignItems: 'center', gap: 8 }}>
                            <View style={{
                                width: 32, height: 32, borderRadius: 16,
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: isCompleted
                                    ? theme.colors.primary
                                    : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                                borderWidth: isToday ? 2 : 0,
                                borderColor: theme.colors.primaryLight,
                            }}>
                                {isCompleted ? (
                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                ) : (
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.border }} />
                                )}
                            </View>
                            <Text style={{
                                fontSize: 10, fontWeight: '700',
                                color: isCompleted ? theme.colors.primary : theme.colors.textMuted
                            }}>
                                {dayLabel.charAt(0)}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

// ─── Goals Component ─────────────────────────────────────────────────────────
const GoalsSection = ({ goals, theme, isDark }: any) => (
    <View style={{ marginBottom: 24 }}>
        <Text style={[st.sectionLabel, { color: theme.colors.textSecondary }]}>ACTIVE FOCUS</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(goals && goals.length > 0 ? goals : ['Stay Fit', 'Health']).map((goal: string) => (
                <View key={goal} style={{
                    paddingHorizontal: 12, paddingVertical: 6,
                    borderRadius: 12,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                    borderWidth: 1, borderColor: theme.colors.border,
                }}>
                    <Text style={{
                        fontSize: 12, fontWeight: '600',
                        color: theme.colors.text, textTransform: 'capitalize'
                    }}>
                        {goal.replace(/_/g, ' ')}
                    </Text>
                </View>
            ))}
        </View>
    </View>
);

// ─── Credits Component ───────────────────────────────────────────────────────
const Credits = ({ theme }: any) => (
    <View style={{ marginTop: 20, alignItems: 'center', opacity: 0.6, paddingBottom: 20 }}>
        <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4, color: theme.colors.textMuted }}>
            FITNESS SCRIBE v1.0.0
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.linkedin.com/in/churchill-emmanuel-130725130/')} activeOpacity={0.7}>
            <Text style={{ fontSize: 11, color: theme.colors.textSecondary }}>
                Designed & Built by <Text style={{ fontWeight: '700', color: theme.colors.text }}>Churchill Emmanuel</Text>
            </Text>
        </TouchableOpacity>
    </View>
);

// ─── Setting row ──────────────────────────────────────────────────────────────
const SettingRow = ({ icon, label, onPress, iconBg, iconColor, sublabel, danger = false, theme }: any) => (
    <HapticButton style={st.settingRow} onPress={onPress} hapticType={Haptics.ImpactFeedbackStyle.Light}>
        <View style={st.settingLeft}>
            <View style={[st.settingIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View>
                <Text style={[st.settingLabel, { color: danger ? theme.colors.error : theme.colors.text }]}>
                    {label}
                </Text>
                {sublabel && (
                    <Text style={[st.settingSubLabel, { color: theme.colors.textMuted }]}>{sublabel}</Text>
                )}
            </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
    </HapticButton>
);

// ─── Toggle row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ label, sublabel, value, onToggle, theme, divider = true }: any) => (
    <>
        <View style={st.settingRow}>
            <View style={{ flex: 1 }}>
                <Text style={[st.settingLabel, { color: theme.colors.text }]}>{label}</Text>
                {sublabel && <Text style={[st.settingSubLabel, { color: theme.colors.textMuted }]}>{sublabel}</Text>}
            </View>
            <Switch
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={value ? theme.colors.primary : '#f4f3f4'}
                onValueChange={onToggle}
                value={value}
            />
        </View>
        {divider && <View style={[st.divider, { backgroundColor: theme.colors.border }]} />}
    </>
);

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { theme, isDark, mode, setMode } = useTheme();
    const [prefs, setPrefs] = useState(NOTIFICATION_PREFS_DEFAULT);

    // Fetch Profile
    const { profile, loading: profileLoading } = useUserProfile(supabase, user?.id);

    // Fetch Last 7 Days Workouts for Stats
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6);
    const { workouts, loading: statsLoading } = useDateRangeData(
        supabase,
        user?.id,
        start.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
    );

    const bgGlass = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)';
    const borderGlass = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';

    useEffect(() => {
        const init = async () => {
            const granted = await NotificationService.registerForPushNotificationsAsync();
            if (granted) NotificationService.setupDefaultNotifications(prefs);
        };
        init();
    }, []);

    // Header entrance
    const headerY = useSharedValue(20);
    const headerOpacity = useSharedValue(0);
    useEffect(() => {
        headerY.value = withSpring(0, { damping: 18, stiffness: 100 });
        headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    }, []);
    const headerAnim = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerY.value }],
    }));

    const toggleNotification = (key: PrefKey) => {
        const next = { ...prefs, [key]: !prefs[key] };
        setPrefs(next);
        NotificationService.setupDefaultNotifications(next);
    };

    const handleSignOut = async () => {
        try { await signOut(); }
        catch { Alert.alert('Error', 'Failed to sign out'); }
    };

    const userName = user?.email?.split('@')[0] || 'User';
    const displayName = profile?.name || userName.charAt(0).toUpperCase() + userName.slice(1);
    const initial = displayName.charAt(0).toUpperCase();

    const THEME_OPTIONS: { label: string; value: 'system' | 'light' | 'dark'; icon: string }[] = [
        { label: 'System', value: 'system', icon: 'phone-portrait-outline' },
        { label: 'Light', value: 'light', icon: 'sunny-outline' },
        { label: 'Dark', value: 'dark', icon: 'moon-outline' },
    ];

    return (
        <View style={[st.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

                {/* ── Avatar header ─────────────────────── */}
                <Animated.View style={[st.avatarSection, headerAnim]}>
                    <View style={[st.avatar, {
                        backgroundColor: theme.colors.primary,
                        shadowColor: theme.colors.primary,
                    }]}>
                        <Text style={st.avatarLetter}>{initial}</Text>
                    </View>
                    <Text style={[st.name, { color: theme.colors.text }]}>{displayName}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <Text style={[st.email, { color: theme.colors.textSecondary, marginTop: 0 }]}>
                            {profile?.age || '--'} yrs • {profile?.height_cm || '--'}cm
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                        <View style={[st.badge, { backgroundColor: theme.colors.primaryLight }]}>
                            <Text style={[st.badgeText, { color: theme.colors.primary }]}>
                                {profile?.activity_level || 'Active'}
                            </Text>
                        </View>
                        <View style={[st.badge, { backgroundColor: 'rgba(249,115,22,0.1)' }]}>
                            <Ionicons name="flame" size={10} color="#f97316" style={{ marginRight: 4 }} />
                            <Text style={[st.badgeText, { color: '#f97316' }]}>
                                {workouts.length} Workouts / Wk
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ── Weekly Progress ───────────────────── */}
                <WeekProgress workouts={workouts} theme={theme} isDark={isDark} />

                {/* ── Goals ─────────────────────────────── */}
                <GoalsSection goals={profile?.goals} theme={theme} isDark={isDark} />

                {/* ── Appearance ────────────────────────── */}
                <Text style={[st.sectionLabel, { color: theme.colors.textSecondary }]}>APPEARANCE</Text>
                <View style={[st.card, { backgroundColor: bgGlass, borderColor: borderGlass }]}>
                    <View style={st.themeRow}>
                        {THEME_OPTIONS.map((opt, i) => {
                            const active = mode === opt.value;
                            return (
                                <HapticButton
                                    key={opt.value}
                                    style={[st.themeBtn, {
                                        backgroundColor: active
                                            ? (isDark ? 'rgba(99,102,241,0.2)' : theme.colors.primaryLight)
                                            : 'transparent',
                                        borderColor: active ? theme.colors.primary : borderGlass,
                                        borderWidth: active ? 1.5 : 1,
                                    }]}
                                    onPress={() => setMode(opt.value)}
                                    hapticType={Haptics.ImpactFeedbackStyle.Light}
                                >
                                    <Ionicons
                                        name={opt.icon as any}
                                        size={18}
                                        color={active ? theme.colors.primary : theme.colors.textSecondary}
                                    />
                                    <Text style={[st.themeLabel, {
                                        color: active ? theme.colors.primary : theme.colors.textSecondary,
                                        fontWeight: active ? '700' : '500',
                                    }]}>
                                        {opt.label}
                                    </Text>
                                </HapticButton>
                            );
                        })}
                    </View>
                </View>

                {/* ── Notifications ─────────────────────── */}
                <Text style={[st.sectionLabel, { color: theme.colors.textSecondary }]}>SMART ALERTS</Text>
                <View style={[st.card, { backgroundColor: bgGlass, borderColor: borderGlass }]}>
                    <ToggleRow
                        label="Morning Workout"
                        sublabel="5:00 AM daily reminder"
                        value={prefs.workout}
                        onToggle={() => toggleNotification('workout')}
                        theme={theme}
                    />
                    <ToggleRow
                        label="Craving Watch"
                        sublabel="2:00 PM check-in"
                        value={prefs.craving}
                        onToggle={() => toggleNotification('craving')}
                        theme={theme}
                    />
                    <ToggleRow
                        label="Evening Walk"
                        sublabel="6:00 PM reminder"
                        value={prefs.walk}
                        onToggle={() => toggleNotification('walk')}
                        theme={theme}
                        divider={false}
                    />
                </View>

                {/* ── Account ──────────────────────────── */}
                <Text style={[st.sectionLabel, { color: theme.colors.textSecondary }]}>ACCOUNT</Text>
                <View style={[st.card, { backgroundColor: bgGlass, borderColor: borderGlass }]}>
                    <SettingRow
                        icon="card-outline"
                        label="Subscription"
                        sublabel="Pro plan · Active"
                        iconBg={isDark ? 'rgba(99,102,241,0.15)' : theme.colors.primaryLight}
                        iconColor={theme.colors.primary}
                        onPress={() => { }}
                        theme={theme}
                    />
                    <View style={[st.divider, { backgroundColor: theme.colors.border }]} />
                    <SettingRow
                        icon="help-circle-outline"
                        label="Support"
                        sublabel="Get help or leave feedback"
                        iconBg={isDark ? 'rgba(99,102,241,0.15)' : theme.colors.primaryLight}
                        iconColor={theme.colors.primary}
                        onPress={() => { }}
                        theme={theme}
                    />
                    <View style={[st.divider, { backgroundColor: theme.colors.border }]} />
                    <SettingRow
                        icon="log-out-outline"
                        label="Sign Out"
                        iconBg={theme.colors.errorLight}
                        iconColor={theme.colors.error}
                        onPress={handleSignOut}
                        danger
                        theme={theme}
                    />
                </View>

                <Credits theme={theme} />

            </ScrollView>
        </View>
    );
}

const st = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 48 },

    // Avatar
    avatarSection: { alignItems: 'center', marginBottom: 36 },
    avatar: {
        width: 88, height: 88, borderRadius: 44,
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 0,
    },
    avatarLetter: { fontSize: 36, fontWeight: '800', color: '#fff' },
    name: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    email: { fontSize: 14, marginTop: 4, fontWeight: '500' },
    badge: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 },
    badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },

    // Section labels (uppercase, like web)
    sectionLabel: {
        fontSize: 12, fontWeight: '700', letterSpacing: 1.2,
        marginBottom: 10, marginLeft: 4,
    },

    // Card
    card: {
        borderRadius: 28, borderWidth: 1, padding: 8, marginBottom: 28,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 0,
    },

    // Theme buttons
    themeRow: { flexDirection: 'row', gap: 8, padding: 8 },
    themeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 12, borderRadius: 18,
    },
    themeLabel: { fontSize: 13 },

    // Setting rows
    settingRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 14, paddingHorizontal: 12,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    settingIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    settingLabel: { fontSize: 15, fontWeight: '500' },
    settingSubLabel: { fontSize: 12, marginTop: 1 },
    divider: { height: 1, marginHorizontal: 12 },

    version: { textAlign: 'center', fontSize: 12, marginTop: 8 },
});
