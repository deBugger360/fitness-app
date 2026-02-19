
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';

interface HapticButtonProps extends TouchableOpacityProps {
    hapticType?: Haptics.ImpactFeedbackStyle | Haptics.NotificationFeedbackType;
    scaleOnPress?: boolean;
    style?: StyleProp<ViewStyle>;
}

// Create animated component
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const HapticButton: React.FC<HapticButtonProps> = ({
    children,
    onPress,
    hapticType = Haptics.ImpactFeedbackStyle.Light,
    scaleOnPress = true,
    style,
    ...props
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        if (scaleOnPress) {
            scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
        }
    };

    const handlePressOut = () => {
        if (scaleOnPress) {
            scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        }
    };

    const handlePress = (e: any) => {
        // Trigger Haptic
        const notifications = [
            Haptics.NotificationFeedbackType.Success,
            Haptics.NotificationFeedbackType.Warning,
            Haptics.NotificationFeedbackType.Error,
        ];

        if (notifications.includes(hapticType as any)) {
            Haptics.notificationAsync(hapticType as Haptics.NotificationFeedbackType);
        } else {
            Haptics.impactAsync(hapticType as Haptics.ImpactFeedbackStyle);
        }

        // Call original handler
        onPress?.(e);
    };

    return (
        <AnimatedTouchable
            activeOpacity={0.8}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[style, animatedStyle]}
            {...props}
        >
            {children}
        </AnimatedTouchable>
    );
};
