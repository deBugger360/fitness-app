'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
    /** 0 – 100 */
    score: number;
    /** SVG radius in px (default 80) */
    radius?: number;
    /** Stroke width in px (default 14) */
    strokeWidth?: number;
    /** Arc fill color — use a Tailwind color value or hex */
    color: string;
    /** Track color */
    trackColor: string;
    /** Children rendered in the center of the ring */
    children?: React.ReactNode;
    className?: string;
    /** Spring config delay in seconds (default 0.3) */
    delay?: number;
}

/**
 * ProgressRing — animated SVG arc, matching the RN ProgressRing in @repo/ui.
 *
 * Web implementation uses Framer Motion's `useSpring` + `strokeDashoffset`
 * (equivalent to RN's `useAnimatedProps` approach).
 *
 * Usage:
 *   <ProgressRing score={78} color="#6366f1" trackColor="#e2e8f0">
 *     <span className="text-3xl font-extrabold">78%</span>
 *     <span className="text-xs text-slate-500">CONSISTENCY</span>
 *   </ProgressRing>
 */
export function ProgressRing({
    score,
    radius = 80,
    strokeWidth = 14,
    color,
    trackColor,
    children,
    className,
    delay = 0.3,
}: ProgressRingProps) {
    const circumference = 2 * Math.PI * radius;
    const size = radius * 2 + strokeWidth;
    const cx = radius + strokeWidth / 2;
    const cy = radius + strokeWidth / 2;

    const springVal = useSpring(0, { stiffness: 60, damping: 20 });
    const dashOffset = useTransform(springVal, (v) => circumference - v * circumference);

    useEffect(() => {
        const t = setTimeout(() => {
            springVal.set(score / 100);
        }, delay * 1000);
        return () => clearTimeout(t);
    }, [score]);

    return (
        <div className={cn('relative flex items-center justify-center', className)}>
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ transform: 'rotate(-90deg)' }}
            >
                {/* Track */}
                <circle
                    cx={cx} cy={cy} r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                {/* Arc */}
                <motion.circle
                    cx={cx} cy={cy} r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset: dashOffset }}
                    strokeLinecap="round"
                    fill="transparent"
                />
            </svg>
            {children && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {children}
                </div>
            )}
        </div>
    );
}
