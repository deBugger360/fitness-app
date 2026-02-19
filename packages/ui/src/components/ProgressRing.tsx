import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withDelay,
    withTiming,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
    /** 0–100 */
    score: number;
    /** Outer radius in dp (default 80) */
    radius?: number;
    /** Ring stroke width (default 14) */
    strokeWidth?: number;
    /** Color of the filled arc (default indigo primary) */
    color: string;
    /** Color of the unfilled track (typically theme.colors.border) */
    trackColor: string;
    /** Contents rendered inside the ring (label, score text, etc.) */
    children?: React.ReactNode;
    /** Entrance animation delay in ms */
    delay?: number;
    /** Animation duration in ms (default 1400) */
    duration?: number;
    style?: ViewStyle;
}

/**
 * ProgressRing — animated SVG ring matching the web's animated progress rings
 * (Framer Motion path-length animation equivalent in React Native).
 *
 * Web equivalent:
 *   <motion.circle
 *     pathLength={animatedValue}
 *     stroke={color}
 *     style={{ pathLength: spring(score / 100) }}
 *   />
 *
 * Usage:
 *   <ProgressRing
 *     score={score}
 *     color={theme.colors.primary}
 *     trackColor={theme.colors.border}
 *   >
 *     <Text style={styles.scoreText}>{score}%</Text>
 *   </ProgressRing>
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
    score,
    radius = 80,
    strokeWidth = 14,
    color,
    trackColor,
    children,
    delay = 0,
    duration = 1400,
    style,
}) => {
    const circumference = 2 * Math.PI * radius;
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withDelay(delay, withTiming(score / 100, { duration }));
    }, [score]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference - progress.value * circumference,
    }));

    const size = radius * 2 + strokeWidth;
    const cx = radius + strokeWidth / 2;
    const cy = radius + strokeWidth / 2;

    return (
        <View style={[st.container, style]}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G rotation="-90" origin={`${cx}, ${cy}`}>
                    {/* Track */}
                    <Circle
                        cx={cx} cy={cy} r={radius}
                        stroke={trackColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress arc */}
                    <AnimatedCircle
                        cx={cx} cy={cy} r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        animatedProps={animatedProps}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </G>
            </Svg>
            {children && (
                <View style={st.center}>
                    {children}
                </View>
            )}
        </View>
    );
};

const st = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
