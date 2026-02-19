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
import { useTheme } from '@repo/ui';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle | ViewStyle[];
    /** Entrance animation delay in ms (stagger via delay) */
    delay?: number;
    /** Disable entrance animation */
    noAnimation?: boolean;
    /** Reduced padding variant */
    compact?: boolean;
}

/**
 * Card — the web app's "glass card" translated to React Native.
 *
 * Web equivalent:
 *   bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl
 *   rounded-[32px] shadow-sm
 *   border border-white/20 dark:border-slate-800
 *   ring-1 ring-slate-900/5 dark:ring-white/5
 *
 * React Native doesn't support backdrop-filter, so we simulate the glass
 * effect with semi-transparent background + slightly elevated shadow.
 */
export const Card = ({
    children,
    style,
    delay = 0,
    noAnimation = false,
    compact = false,
}: CardProps) => {
    const { theme, isDark } = useTheme();

    const opacity = useSharedValue(noAnimation ? 1 : 0);
    const translateY = useSharedValue(noAnimation ? 0 : 20);
    const scale = useSharedValue(noAnimation ? 1 : 0.97);

    useEffect(() => {
        if (noAnimation) return;
        opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
        translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 120 }));
        scale.value = withDelay(delay, withSpring(1, { damping: 18, stiffness: 120 }));
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    // Simulate glass: semi-transparent in light mode (web: bg-white/60),
    // more opaque in dark (web: bg-slate-900/60)
    const bgColor = isDark
        ? 'rgba(15, 23, 42, 0.85)'   // slate-950 / 85%
        : 'rgba(255, 255, 255, 0.75)'; // white / 75%

    // Ring border: web uses ring-1 ring-slate-900/5 dark:ring-white/5
    const borderColor = isDark
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(15, 23, 42, 0.06)';

    return (
        <Animated.View
            style={[
                styles.base,
                {
                    backgroundColor: bgColor,
                    borderColor,
                    padding: compact ? 16 : 24,
                },
                animatedStyle,
                style,
            ]}
        >
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 32,         // web: rounded-[32px]
        borderWidth: 1,
        // Web shadow-sm equivalent
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
        elevation: 3,
        overflow: 'hidden',
    },
});
