'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface SectionHeaderProps {
    /** Title */
    title: string;
    /** Subtitle below title */
    subtitle?: string;
    /** Right-side slot */
    trailing?: React.ReactNode;
    /** Large = page-level h1 (text-4xl font-extrabold tracking-tight) */
    large?: boolean;
    className?: string;
    /** Stagger delay in seconds, default 0 */
    delay?: number;
}

/**
 * SectionHeader — matches the web convention and the RN SectionHeader in @repo/ui.
 *
 * large=true  → h1 equivalent — text-4xl font-extrabold tracking-tight
 * large=false → section title — text-xl font-bold
 *
 * Usage:
 *   <SectionHeader large title="Today's Plan" subtitle="5 tasks remaining" />
 *   <SectionHeader title="Quick Logger" trailing={<Badge />} />
 */
export function SectionHeader({
    title,
    subtitle,
    trailing,
    large = false,
    className,
    delay = 0,
}: SectionHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: large ? -12 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={cn('flex items-end justify-between mb-4', className)}
        >
            <div>
                <h2
                    className={cn(
                        large
                            ? 'text-4xl font-extrabold tracking-tight'
                            : 'text-xl font-bold tracking-tight',
                    )}
                >
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
            {trailing && <div className="ml-3 shrink-0">{trailing}</div>}
        </motion.div>
    );
}
