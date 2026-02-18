
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../context/AuthProvider';
import { useTheme } from '@repo/ui';
import { FOUNDATION_PRINCIPLES } from '@repo/shared';

// Map lucide icon names (used on web) to Ionicons equivalents for mobile
const LUCIDE_TO_IONICONS: Record<string, string> = {
    Moon: 'moon-outline',
    Droplets: 'water-outline',
    Utensils: 'restaurant-outline',
    Activity: 'walk-outline',
    Sun: 'sunny-outline',
    Brain: 'book-outline',
    ShieldOff: 'shield-outline',
    SmartphoneOff: 'phone-portrait-outline',
    Heart: 'heart-outline',
    Book: 'book-outline',
    Feather: 'pencil-outline',
};

export default function ActivityScreen() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [habits, setHabits] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchHabits();
    }, [user?.id]);

    const fetchHabits = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const { data } = await supabase
                .from('foundations')
                .select('notes') // 'notes' column stores JSON of habit checklist in our simplified schema
                .eq('user_id', user.id)
                .eq('date', today)
                .single();

            if (data?.notes) {
                setHabits(data.notes);
            } else {
                setHabits({});
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleHabit = async (habitId: string) => {
        if (!user?.id) return;

        const newHabits = { ...habits, [habitId]: !habits[habitId] };

        // Optimistic Update
        setHabits(newHabits);

        try {
            // Upsert foundation log
            const { error } = await supabase
                .from('foundations')
                .upsert({
                    user_id: user.id,
                    date: today,
                    notes: newHabits // Storing checkliststate in notes JSON column for now
                }, { onConflict: 'user_id, date' });

            if (error) throw error;
        } catch (error) {
            console.error("Failed to save habit", error);
            // Revert on failure
            setHabits(habits);
        }
    };

    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Foundations</Text>
                <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.listContainer}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Daily Non-Negotiables</Text>
                    {FOUNDATION_PRINCIPLES.map((principle) => {
                        const ionicon = LUCIDE_TO_IONICONS[principle.icon] || 'checkmark-circle-outline';
                        const isChecked = !!habits[principle.id];
                        return (
                            <TouchableOpacity
                                key={principle.id}
                                style={styles.habitRow}
                                onPress={() => toggleHabit(principle.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.habitInfo}>
                                    <View style={[styles.iconBox, isChecked && styles.iconBoxActive]}>
                                        <Ionicons
                                            name={ionicon as any}
                                            size={22}
                                            color={isChecked ? '#fff' : theme.colors.textSecondary}
                                        />
                                    </View>
                                    <View>
                                        <Text style={[styles.habitLabel, isChecked && styles.habitLabelActive]}>
                                            {principle.name}
                                        </Text>
                                        <Text style={styles.habitDescription}>{principle.description}</Text>
                                    </View>
                                </View>

                                <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                                    {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
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
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: 24,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.textSecondary,
        margin: 16,
        marginBottom: 8,
    },
    habitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 4,
        borderRadius: 16,
    },
    habitInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconBoxActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    habitLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: theme.colors.textSecondary,
    },
    habitLabelActive: {
        color: theme.colors.text,
        fontWeight: '600',
    },
    habitDescription: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
});
