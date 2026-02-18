
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, withRepeat, withTiming, useAnimatedStyle, withSequence } from 'react-native-reanimated';
import { useTheme } from '@repo/ui';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton = ({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) => {
    const { theme, isDark } = useTheme(); // Now properly getting isDark
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    // Ensure `width` and `height` are passed as styles correctly
    const dynamicStyle: any = {
        width,
        height,
        borderRadius,
        backgroundColor: isDark ? '#334155' : '#cbd5e1', // Slate-700 : Slate-300
    };

    return (
        <Animated.View
            style={[
                styles.skeleton,
                dynamicStyle,
                animatedStyle,
                style
            ]}
        />
    );
};

const styles = StyleSheet.create({
    skeleton: {
        marginBottom: 8,
    }
});
