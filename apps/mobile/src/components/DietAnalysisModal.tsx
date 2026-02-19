import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@repo/ui';
import { HapticButton } from '../components/ui';
import { supabase } from '../context/AuthProvider';
import { createMealEvent } from '@repo/shared';
import { logAnalyticsEvent } from '@repo/lib';
import * as Haptics from 'expo-haptics';

interface Props {
    visible: boolean;
    onClose: () => void;
    userId: string | undefined;
}

export default function DietAnalysisModal({ visible, onClose, userId }: Props) {
    const { theme, isDark } = useTheme();
    const [description, setDescription] = useState('');
    const [analysis, setAnalysis] = useState<{ quality: string; advice: string; correction: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const analyzeMeal = (text: string) => {
        const lowerText = text.toLowerCase();
        // 1. Nigerian & General Context Dictionary
        const signals = {
            unhealthy: [
                'soda', 'coke', 'fanta', 'sprite', 'pepsi', 'mineral', 'beer', 'alcohol', 'wine',
                'puff puff', 'puff-puff', 'chin chin', 'chin-chin', 'gala', 'meat pie', 'sausage roll', 'buns', 'egg roll',
                'cake', 'chocolate', 'candy', 'sugar', 'ice cream', 'cookies', 'donut', 'pastry',
                'agege bread', 'white bread', 'butter', 'margarine', 'jam',
                'indomie', 'instant noodles', 'processed', 'fries', 'burger', 'pizza', 'shawarma'
            ],
            denseCarbs: [
                'pounded yam', 'iyan', 'eba', 'garri', 'amala', 'fufu', 'semovita', 'semo', 'tuwo', 'starch',
                'white rice', 'jollof', 'fried rice', 'rice and stew', 'spaghetti', 'pasta', 'yam', 'potatoes',
                'fried plantain', 'dodo', 'bread'
            ],
            healthyProteins: [
                'chicken', 'turkey', 'fish', 'titus', 'catfish', 'croaker', 'snail', 'meat', 'beef', 'goat meat',
                'egg', 'eggs', 'moi moi', 'moi-moi', 'akara', 'beans', 'ewa', 'okpa'
            ],
            vegetables: [
                'vegetable soup', 'efo riro', 'edikang ikong', 'afang', 'okro', 'okra', 'ewedu', 'ogbono', 'egusi', 'bitter leaf', 'oha',
                'salad', 'cucumber', 'carrots', 'cabbage', 'ugly', 'spinach', 'greens', 'pepper soup'
            ],
            beneficialCarbs: [
                'oats', 'pap', 'akamu', 'ogi', 'brown rice', 'ofada', 'unripe plantain', 'sweet potato', 'corn', 'maize', 'boiled plantain'
            ]
        };

        let scores = { unhealthy: 0, denseCarbs: 0, healthyProteins: 0, vegetables: 0, beneficialCarbs: 0 };

        Object.entries(signals).forEach(([category, keywords]) => {
            keywords.forEach(word => {
                if (lowerText.includes(word)) {
                    scores[category as keyof typeof scores]++;
                }
            });
        });

        let quality = 'moderate';
        let advice = "";
        let correction = "";
        let forecast = "";

        if (scores.unhealthy > 0) {
            quality = 'unhealthy';
            advice = "High sugar/processed content detected. This spikes insulin and triggers fat storage.";
            forecast = "Likely Energy Crash: You might feel tired in 1-2 hours.";
            correction = "Drink 2 glasses of water now to dilute sugar. Zero-carb dinner heavily advised.";
        } else if (scores.denseCarbs > 0) {
            if (scores.vegetables > 0 || scores.healthyProteins > 0) {
                quality = 'moderate';
                advice = "Traditional staple meal. Good protein/fiber mix, but calorie-dense.";
                forecast = "Sustained Energy: Good for a workout day.";
                correction = "Optimization: Cut the 'swallow' portion by half next time. Add more soup/meat.";
            } else {
                quality = 'unhealthy';
                advice = "Carb-heavy meal with insufficient fiber/protein.";
                forecast = "Bloating Risk: High carb load without fiber may cause sluggishness.";
                correction = "Eat a cucumber or salad NOW to slow absorption. Walk for 15 mins.";
            }
        } else if (scores.healthyProteins > 0 || scores.vegetables > 0 || scores.beneficialCarbs > 0) {
            quality = 'healthy';
            advice = "Excellent nutrient density! This supports muscle repair and metabolism.";
            forecast = "Fat Burning Zone: Low insulin spike keeps you in fat-burning mode.";
            correction = "Great job! Keep hydrated.";
        } else {
            quality = 'moderate';
            advice = "Could not identify specific items, assuming moderate calorie intake.";
            forecast = "Unknown Impact.";
            correction = "General Advice: Drink water and ensure your next meal is protein-rich.";
        }

        return { quality, advice, correction: forecast + " " + correction };
    };

    const handleAnalyze = async () => {
        if (!description.trim()) return;
        setSaving(true);
        try {
            const result = analyzeMeal(description);
            setAnalysis(result);

            if (userId) {
                await supabase.from('diet_reflections').insert({
                    user_id: userId,
                    date: new Date().toISOString(),
                    description: description,
                    quality: result.quality,
                    synced: 0
                });

                // Log Analytics
                const event = createMealEvent(userId, description, result.quality);
                await logAnalyticsEvent(supabase, event);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save analysis');
        } finally {
            setSaving(false);
        }
    };

    const reset = () => {
        setAnalysis(null);
        setDescription('');
        onClose();
    };

    const qualityColor = (q: string) => {
        if (q === 'healthy') return isDark ? '#22c55e' : '#15803d';
        if (q === 'unhealthy') return isDark ? '#ef4444' : '#b91c1c';
        return isDark ? '#f59e0b' : '#b45309';
    };

    const qualityBg = (q: string) => {
        if (q === 'healthy') return isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7';
        if (q === 'unhealthy') return isDark ? 'rgba(239,68,68,0.15)' : '#fee2e2';
        return isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7';
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={[st.overlay, { backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)' }]}>
                <View style={[st.container, { backgroundColor: theme.colors.background }]}>
                    <View style={st.header}>
                        <Text style={[st.title, { color: theme.colors.text }]}>Diet Analysis</Text>
                        <TouchableOpacity onPress={onClose} style={st.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {!analysis ? (
                        <View>
                            <Text style={[st.label, { color: theme.colors.textSecondary }]}>What did you eat?</Text>
                            <TextInput
                                style={[st.input, {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                                    color: theme.colors.text
                                }]}
                                multiline
                                numberOfLines={4}
                                placeholder="E.g., I had a burger and fries..."
                                placeholderTextColor={theme.colors.textMuted}
                                value={description}
                                onChangeText={setDescription}
                            />
                            <Text style={{ fontSize: 12, color: theme.colors.textMuted, marginTop: 8, marginBottom: 24 }}>
                                Be honest! We'll help you adjust.
                            </Text>

                            <HapticButton
                                style={[st.btn, { backgroundColor: theme.colors.primary, opacity: (!description.trim() || saving) ? 0.6 : 1 }]}
                                onPress={handleAnalyze}
                                disabled={!description.trim() || saving}
                            >
                                {saving ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Text style={st.btnText}>Analyze My Meal</Text>
                                        <Ionicons name="sparkles" size={18} color="#fff" />
                                    </>
                                )}
                            </HapticButton>
                        </View>
                    ) : (
                        <View style={{ gap: 16 }}>
                            <View style={[st.resultCard, { backgroundColor: qualityBg(analysis.quality), borderColor: qualityColor(analysis.quality) }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Ionicons
                                        name={analysis.quality === 'healthy' ? 'checkmark-circle' : analysis.quality === 'unhealthy' ? 'alert-circle' : 'restaurant'}
                                        size={24}
                                        color={qualityColor(analysis.quality)}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text style={[st.resultTitle, { color: qualityColor(analysis.quality) }]}>
                                        {analysis.quality.charAt(0).toUpperCase() + analysis.quality.slice(1)} Choice
                                    </Text>
                                </View>
                                <Text style={[st.advice, { color: theme.colors.text }]}>{analysis.advice}</Text>
                            </View>

                            <View style={[st.correctionBox, { backgroundColor: isDark ? '#1e293b' : '#f8fafc' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                    <Ionicons name="sparkles" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
                                    <Text style={[st.correctionTitle, { color: theme.colors.text }]}>Smart Correction</Text>
                                </View>
                                <Text style={{ color: theme.colors.textSecondary, lineHeight: 22 }}>
                                    {analysis.correction}
                                </Text>
                            </View>

                            <HapticButton
                                style={[st.btn, { backgroundColor: theme.colors.text, marginTop: 12 }]}
                                onPress={reset}
                            >
                                <Text style={[st.btnText, { color: theme.colors.background }]}>Got it, thanks!</Text>
                            </HapticButton>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const st = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', padding: 20 },
    container: { borderRadius: 32, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 22, fontWeight: '800' },
    closeBtn: { padding: 4 },
    label: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
    input: { borderRadius: 20, padding: 16, height: 120, textAlignVertical: 'top', fontSize: 16 },
    btn: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    resultCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
    resultTitle: { fontSize: 18, fontWeight: '800' },
    advice: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
    correctionBox: { padding: 20, borderRadius: 20 },
    correctionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
