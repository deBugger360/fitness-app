
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthProvider';
import { NotificationService } from '../services/NotificationService';
import { useTheme } from '@repo/ui';
import { HapticButton } from '../components/ui';
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
    const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

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
                        <Text style={st.avatarLetter}>{displayName.charAt(0)}</Text>
                    </View>
                    <Text style={[st.name, { color: theme.colors.text }]}>{displayName}</Text>
                    <Text style={[st.email, { color: theme.colors.textSecondary }]}>{user?.email}</Text>
                    <View style={[st.badge, { backgroundColor: theme.colors.successLight }]}>
                        <Text style={[st.badgeText, { color: theme.colors.success }]}>PRO MEMBER</Text>
                    </View>
                </Animated.View>

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

                <Text style={[st.version, { color: theme.colors.textMuted }]}>FitTrack Pro · Version 1.0.0</Text>

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
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
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
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 3,
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
