import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';

export interface EmptyStateProps {
    /** Icon slot — typically an <Ionicons> or <Image> */
    icon?: React.ReactNode;
    /** Primary message — bold, larger */
    title: string;
    /** Descriptive text — secondary color, smaller */
    description?: string;
    /** CTA button slot */
    action?: React.ReactNode;
    style?: ViewStyle;
    titleStyle?: TextStyle;
    descriptionStyle?: TextStyle;
    /** Text colors */
    color: string;
    descriptionColor: string;
}

/**
 * EmptyState — matches the web's empty state pattern:
 *
 *   <div className="flex flex-col items-center justify-center py-16">
 *     <Icon className="w-12 h-12 text-slate-300 mb-4" />
 *     <h3 className="text-lg font-bold text-slate-900">No data yet</h3>
 *     <p className="text-slate-500 text-sm text-center mt-2 max-w-xs">
 *       Description text here.
 *     </p>
 *     <button ...>CTA</button>
 *   </div>
 *
 * Usage:
 *   <EmptyState
 *     icon={<Ionicons name="analytics-outline" size={44} color={theme.colors.textMuted} />}
 *     title="Building your insights"
 *     description="Keep logging your data. Personalised recommendations appear after a few days."
 *     color={theme.colors.text}
 *     descriptionColor={theme.colors.textSecondary}
 *   />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    style,
    titleStyle,
    descriptionStyle,
    color,
    descriptionColor,
}) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.92);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
        scale.value = withSpring(1, { damping: 18, stiffness: 120 });
    }, []);

    const anim = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[st.root, style, anim]}>
            {icon ? <View style={st.iconWrap}>{icon}</View> : null}
            <Text style={[st.title, { color }, titleStyle]}>{title}</Text>
            {description ? (
                <Text style={[st.description, { color: descriptionColor }, descriptionStyle]}>
                    {description}
                </Text>
            ) : null}
            {action ? <View style={st.action}>{action}</View> : null}
        </Animated.View>
    );
};

const st = StyleSheet.create({
    root: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 24,
    },
    iconWrap: {
        marginBottom: 20,
        opacity: 0.6,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.2,
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 300,
    },
    action: {
        marginTop: 24,
    },
});
