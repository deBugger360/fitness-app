import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    Easing,
} from 'react-native-reanimated';

export interface SectionHeaderProps {
    /** Primary title text */
    title: string;
    /** Optional subtitle / description (appears below title) */
    subtitle?: string;
    /** Right-side slot — any React node (badge, button, count) */
    trailing?: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    subtitleStyle?: TextStyle;
    /** Font size of the title (default 20) */
    titleSize?: number;
    /** Entrance animation delay in ms */
    delay?: number;
    /** Whether to render as a large page-level header (h1 equivalent) */
    large?: boolean;
    /** Text color for title */
    color: string;
    /** Text color for subtitle */
    subtitleColor: string;
}

/**
 * SectionHeader — matches the web's pattern of:
 *   <h1 className="text-4xl font-extrabold tracking-tight">Today's Plan</h1>
 *   <p className="text-slate-500 font-medium">subtitle</p>
 *
 * And inner section titles:
 *   <p className="text-xs font-bold uppercase tracking-wider">Section</p>
 *
 * Two visual modes:
 *   large=true  → page-level h1 (32–40px extrabold tracking-tight)
 *   large=false → inner section label (20px bold, or pass titleSize)
 *
 * Usage:
 *   // Page header
 *   <SectionHeader
 *     large
 *     title="Insights"
 *     subtitle="Your progress this week"
 *     color={theme.colors.text}
 *     subtitleColor={theme.colors.textSecondary}
 *   />
 *
 *   // Section label
 *   <SectionHeader
 *     title="Quick Logger"
 *     color={theme.colors.text}
 *     subtitleColor={theme.colors.textSecondary}
 *     trailing={<Badge count={3} />}
 *   />
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    trailing,
    style,
    titleStyle,
    subtitleStyle,
    titleSize,
    delay = 0,
    large = false,
    color,
    subtitleColor,
}) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(large ? -16 : 0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }));
        if (large) {
            translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
        }
    }, []);

    const anim = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const resolvedTitleSize = titleSize ?? (large ? 32 : 20);

    return (
        <Animated.View style={[st.root, style, anim]}>
            <View style={st.main}>
                <Text
                    style={[
                        large ? st.h1 : st.h2,
                        { fontSize: resolvedTitleSize, color },
                        titleStyle,
                    ]}
                    numberOfLines={1}
                >
                    {title}
                </Text>
                {subtitle ? (
                    <Text style={[st.subtitle, { color: subtitleColor }, subtitleStyle]}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
            {trailing ? <View style={st.trailing}>{trailing}</View> : null}
        </Animated.View>
    );
};

const st = StyleSheet.create({
    root: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    main: { flex: 1 },
    // Page-level header — web: text-4xl font-extrabold tracking-tight
    h1: {
        fontWeight: '800',
        letterSpacing: -0.5,   // tracking-tight
        lineHeight: 38,
    },
    // Section title — web: text-xl font-bold
    h2: {
        fontWeight: '700',
        letterSpacing: -0.2,
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
        lineHeight: 20,
    },
    trailing: { marginLeft: 12 },
});
