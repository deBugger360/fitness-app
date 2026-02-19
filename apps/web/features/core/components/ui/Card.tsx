'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    className?: string;
    /**
     * Stagger index for cascade entrance animations.
     * Each step adds 80ms to the delay. Default: 0.
     */
    staggerIndex?: number;
    /** Disable entrance animation */
    noAnimation?: boolean;
}

/**
 * Card — the glass-card primitive, matching the RN Card in @repo/ui/components/Card.tsx.
 *
 * Design contract (shared with mobile):
 *   - bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl
 *   - rounded-[32px]
 *   - ring-1 ring-slate-900/5 dark:ring-white/5
 *   - shadow-sm
 *
 * Usage:
 *   <Card staggerIndex={0}> ... </Card>
 *   <Card staggerIndex={1}> ... </Card>  ← enters 80ms later
 */
export function Card({
    children,
    className,
    staggerIndex = 0,
    noAnimation = false,
    ...rest
}: CardProps) {
    return (
        <motion.div
            initial={noAnimation ? false : { opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                delay: staggerIndex * 0.08,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
                // Glass card — the design contract
                'bg-white/60 dark:bg-slate-900/60',
                'backdrop-blur-xl',
                'rounded-[32px]',
                'border border-white/20 dark:border-slate-800/60',
                'ring-1 ring-slate-900/5 dark:ring-white/5',
                'shadow-sm',
                className,
            )}
            {...rest}
        >
            {children}
        </motion.div>
    );
}
