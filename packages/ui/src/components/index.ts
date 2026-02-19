/**
 * @repo/ui — React Native component primitives
 *
 * These are platform-native (React Native) implementations of the shared
 * design contract. They CANNOT be imported by the web app (no react-native-web).
 * Web equivalents live in apps/web/features/core/components/.
 *
 * All primitives consume tokens from ../theme/colors.ts via useTheme() so they
 * automatically reflect light/dark mode without any extra wiring.
 */

export { Card } from './Card';
export type { CardProps } from './Card';

export { Button } from './Button';
export type { ButtonProps, HapticStyle } from './Button';

export { ProgressRing } from './ProgressRing';
export type { ProgressRingProps } from './ProgressRing';

export { SectionHeader } from './SectionHeader';
export type { SectionHeaderProps } from './SectionHeader';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
