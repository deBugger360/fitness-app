
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthProvider';
import { NotificationService } from '../services/NotificationService';
import { useTheme } from '@repo/ui';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { theme, mode, setMode } = useTheme();

    const [prefs, setPrefs] = useState({
        workout: true,
        craving: true,
        walk: true,
        streak: true
    });

    useEffect(() => {
        const init = async () => {
            const granted = await NotificationService.registerForPushNotificationsAsync();
            if (granted) {
                NotificationService.setupDefaultNotifications(prefs);
            }
        };
        init();
    }, []);

    const toggleNotification = (key: keyof typeof prefs) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);
        NotificationService.setupDefaultNotifications(newPrefs);
    };

    const userName = user?.email?.split('@')[0] || "User";

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            Alert.alert("Error", "Failed to sign out");
        }
    };

    const SettingItem = ({ icon, label, onPress, color = theme.colors.textSecondary }: any) => (
        <TouchableOpacity style={styles(theme).settingRow} onPress={onPress}>
            <View style={styles(theme).settingLeft}>
                <View style={[styles(theme).iconBox, { backgroundColor: theme.colors.background }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={styles(theme).settingLabel}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.border} />
        </TouchableOpacity>
    );

    const NotificationToggle = ({ label, value, onToggle }: any) => (
        <View style={styles(theme).toggleRow}>
            <Text style={styles(theme).toggleLabel}>{label}</Text>
            <Switch
                trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                thumbColor={value ? theme.colors.primary : "#f4f3f4"}
                onValueChange={onToggle}
                value={value}
            />
        </View>
    );

    const ThemeOption = ({ label, value, current }: any) => (
        <TouchableOpacity
            style={[
                styles(theme).themeOption,
                current === value && { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }
            ]}
            onPress={() => setMode(value)}
        >
            <Text style={[
                styles(theme).themeText,
                current === value && { color: theme.colors.primary, fontWeight: '700' }
            ]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles(theme).container}>
            <ScrollView contentContainerStyle={styles(theme).content}>

                {/* Profile Header */}
                <View style={styles(theme).header}>
                    <View style={styles(theme).avatar}>
                        <Text style={styles(theme).avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles(theme).name}>{userName}</Text>
                    <Text style={styles(theme).email}>{user?.email}</Text>
                    <View style={styles(theme).badge}>
                        <Text style={styles(theme).badgeText}>PRO MEMBER</Text>
                    </View>
                </View>

                {/* Appearance */}
                <Text style={styles(theme).sectionTitle}>Appearance</Text>
                <View style={styles(theme).themeRow}>
                    <ThemeOption label="System" value="system" current={mode} />
                    <ThemeOption label="Light" value="light" current={mode} />
                    <ThemeOption label="Dark" value="dark" current={mode} />
                </View>

                {/* Notifications */}
                <Text style={styles(theme).sectionTitle}>Smart alerts</Text>
                <View style={styles(theme).settingsCard}>
                    <NotificationToggle
                        label="Morning Workout (5 AM)"
                        value={prefs.workout}
                        onToggle={() => toggleNotification('workout')}
                    />
                    <View style={styles(theme).divider} />
                    <NotificationToggle
                        label="Craving Watch (2 PM)"
                        value={prefs.craving}
                        onToggle={() => toggleNotification('craving')}
                    />
                    <View style={styles(theme).divider} />
                    <NotificationToggle
                        label="Evening Walk (6 PM)"
                        value={prefs.walk}
                        onToggle={() => toggleNotification('walk')}
                    />
                </View>

                {/* Account */}
                <Text style={styles(theme).sectionTitle}>Account</Text>
                <View style={styles(theme).settingsCard}>
                    <SettingItem icon="card-outline" label="Subscription" onPress={() => { }} />
                    <SettingItem icon="help-circle-outline" label="Support" onPress={() => { }} />

                    <TouchableOpacity style={styles(theme).settingRow} onPress={handleSignOut}>
                        <View style={styles(theme).settingLeft}>
                            <View style={[styles(theme).iconBox, { backgroundColor: theme.colors.errorLight }]}>
                                <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                            </View>
                            <Text style={[styles(theme).settingLabel, { color: theme.colors.error }]}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles(theme).version}>Version 1.0.0</Text>

            </ScrollView>
        </View>
    );
}

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: 60,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 12,
    },
    badge: {
        backgroundColor: theme.colors.successLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: theme.colors.success,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 8,
    },
    settingsCard: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 8,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '500',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    toggleLabel: {
        fontSize: 15,
        color: theme.colors.text,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginHorizontal: 16,
    },
    themeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 8,
    },
    themeOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    themeText: {
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    version: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginBottom: 20,
    },
});
