import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

// Optional haptics — if expo-haptics isn't installed (e.g. in tests), ignore.
let Haptics: any = null;
try {
    Haptics = require('expo-haptics');
} catch { /* not installed — web or test env */ }

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    /**
     * Haptic feedback style. Pass falsy to disable.
     * 'light' | 'medium' | 'heavy' — impact feedback
     * 'success' | 'warning' | 'error' — notification feedback
     */
    haptic?: HapticStyle | false;
    /** Scale down on press (web: whileTap={{ scale: 0.95 }}) */
    scaleOnPress?: boolean;
    /** Scale target, default 0.96 */
    scaleTarget?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Button — cross-platform pressable primitive.
 *
 * Web equivalent (Framer Motion):
 *   <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} />
 *
 * Provides:
 * - Spring scale animation on press (matches web's whileTap)
 * - Haptic feedback (mobile only — gracefully skipped on web/test)
 * - No visual styling — compose with the `variant` you need via `style` prop
 *
 * Usage:
 *   <Button style={styles.primaryBtn} onPress={handleSave} haptic="medium">
 *     <Text>Save</Text>
 *   </Button>
 */
export const Button: React.FC<ButtonProps> = ({
    children,
    onPress,
    haptic = 'light',
    scaleOnPress = true,
    scaleTarget = 0.96,
    style,
    disabled,
    ...rest
}) => {
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (scaleOnPress) {
            scale.value = withSpring(scaleTarget, { damping: 10, stiffness: 300 });
        }
    };

    const handlePressOut = () => {
        if (scaleOnPress) {
            scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        }
    };

    const handlePress = (e: any) => {
        if (haptic && Haptics && !disabled) {
            if (haptic === 'success' || haptic === 'warning' || haptic === 'error') {
                const type = { success: 'success', warning: 'warning', error: 'error' }[haptic];
                Haptics.notificationAsync(Haptics.NotificationFeedbackType[
                    haptic.charAt(0).toUpperCase() + haptic.slice(1) as 'Success' | 'Warning' | 'Error'
                ]);
            } else {
                const impactMap: Record<string, string> = {
                    light: 'Light',
                    medium: 'Medium',
                    heavy: 'Heavy',
                };
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle[impactMap[haptic] as 'Light' | 'Medium' | 'Heavy']);
            }
        }
        onPress?.(e);
    };

    return (
        <AnimatedTouchable
            activeOpacity={0.85}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[style, animStyle, disabled && { opacity: 0.6 }]}
            {...rest}
        >
            {children}
        </AnimatedTouchable>
    );
};
