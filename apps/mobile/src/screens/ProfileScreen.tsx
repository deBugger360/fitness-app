
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../context/AuthProvider';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    // Mock user data if profile not fully set
    const userName = user?.email?.split('@')[0] || "User";
    const joinDate = new Date().toLocaleDateString();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            Alert.alert("Error", "Failed to sign out");
        }
    };

    const SettingItem = ({ icon, label, onPress, color = "#334155" }: any) => (
        <TouchableOpacity style={styles.settingRow} onPress={onPress}>
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Header */}
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.name}>{userName}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>PRO MEMBER</Text>
                    </View>
                </View>

                {/* Stats Summary */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Workouts</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>85%</Text>
                        <Text style={styles.statLabel}>Avg Score</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </View>
                </View>

                {/* Settings Section */}
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.settingsCard}>
                    <SettingItem icon="notifications-outline" label="Notifications" onPress={() => { }} />
                    <SettingItem icon="moon-outline" label="Dark Mode" onPress={() => { }} />
                    <SettingItem icon="lock-closed-outline" label="Privacy & Security" onPress={() => { }} />
                </View>

                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.settingsCard}>
                    <SettingItem icon="card-outline" label="Subscription" onPress={() => { }} />
                    <SettingItem icon="help-circle-outline" label="Support" onPress={() => { }} />

                    {/* Logout */}
                    <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#fee2e2' }]}>
                                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                            </View>
                            <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <Text style={styles.version}>Version 1.0.0</Text>

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
        backgroundColor: '#4F46E5', // Indigo-600
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#4F46E5',
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
        color: '#0f172a',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: '#ccfbf1', // Teal-100
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#0f766e', // Teal-700
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 8,
    },
    settingsCard: {
        backgroundColor: '#fff',
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
        color: '#334155',
        fontWeight: '500',
    },
    version: {
        textAlign: 'center',
        color: '#cbd5e1',
        fontSize: 12,
        marginBottom: 20,
    },
});
