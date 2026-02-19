'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface EmptyStateProps {
    /** Icon element (Lucide icon, img, etc.) */
    icon?: React.ReactNode;
    /** Primary bold message */
    title: string;
    /** Descriptive secondary text */
    description?: string;
    /** CTA button / link */
    action?: React.ReactNode;
    className?: string;
}

/**
 * EmptyState — matches the RN EmptyState in @repo/ui, implemented with
 * Framer Motion scale + fade entrance.
 *
 * Usage:
 *   <EmptyState
 *     icon={<BarChart2 className="w-12 h-12 text-slate-300" />}
 *     title="Building your insights"
 *     description="Keep logging data. Recommendations appear after a few days."
 *   />
 */
export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                'flex flex-col items-center justify-center py-16 px-6 text-center',
                className,
            )}
        >
            {icon && (
                <div className="mb-5 opacity-50">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-6">
                    {action}
                </div>
            )}
        </motion.div>
    );
}
