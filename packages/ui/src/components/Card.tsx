import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';

export interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    /**
     * Stagger entrance animation delay in ms.
     * Set delay={0} for no delay, or pass incrementing values for a cascade effect.
     */
    delay?: number;
    /** Skip entrance animation entirely */
    noAnimation?: boolean;
    /** 16px padding (default 24px) */
    compact?: boolean;
    /** Override the padding entirely */
    padding?: number;
}

/**
 * Card — the glass-card primitive, matching the web's:
 *   bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl
 *   rounded-[32px] shadow-sm ring-1 ring-slate-900/5
 *
 * Web doesn't support backdrop-filter in React Native, so we simulate
 * the frosted-glass look with a semi-transparent background + shadow.
 */
export const Card: React.FC<CardProps> = ({
    children,
    style,
    delay = 0,
    noAnimation = false,
    compact = false,
    padding,
}) => {
    const { isDark } = useTheme();

    const opacity = useSharedValue(noAnimation ? 1 : 0);
    const translateY = useSharedValue(noAnimation ? 0 : 20);
    const scale = useSharedValue(noAnimation ? 1 : 0.97);

    useEffect(() => {
        if (noAnimation) return;
        opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
        translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 120 }));
        scale.value = withDelay(delay, withSpring(1, { damping: 18, stiffness: 120 }));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    // Simulate glass: web → bg-white/60 dark:bg-slate-900/60
    const bgColor = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.75)';
    // Ring border: web → ring-slate-900/5 dark:ring-white/5
    const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';

    const resolvedPadding = padding ?? (compact ? 16 : 24);

    return (
        <Animated.View
            style={[
                st.base,
                { backgroundColor: bgColor, borderColor, padding: resolvedPadding },
                animStyle,
                style,
            ]}
        >
            {children}
        </Animated.View>
    );
};

const st = StyleSheet.create({
    base: {
        borderRadius: 32,         // web: rounded-[32px]
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 3,
        overflow: 'hidden',
    },
});
