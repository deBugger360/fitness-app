'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

/**
 * Button — cross-platform pressable primitive.
 *
 * Web equivalent of @repo/ui/components/Button.tsx (React Native).
 *
 * Provides:
 * - whileHover: slight lift (scale 1.02)
 * - whileTap: spring press-in (scale 0.95), matching RN spring
 * - disabled: 60% opacity
 *
 * No visual styling baked in — compose via className.
 *
 * Usage:
 *   <Button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl" onPress={save}>
 *     Save Changes
 *   </Button>
 */
export function Button({
    children,
    className,
    disabled,
    ...rest
}: ButtonProps) {
    return (
        <motion.button
            whileHover={disabled ? {} : { scale: 1.02 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            disabled={disabled}
            className={cn(
                'cursor-pointer select-none',
                'transition-opacity',
                disabled && 'opacity-60 cursor-not-allowed',
                className,
            )}
            {...rest}
        >
            {children}
        </motion.button>
    );
}
