/**
 * apps/mobile local UI components — mobile-specific only.
 *
 * Cross-platform primitives (Card, Button, ProgressRing, SectionHeader, EmptyState)
 * are in @repo/ui. Import those from '@repo/ui' instead.
 *
 * What lives here: Expo-specific components that can't go into @repo/ui
 * because they depend on expo-haptics, expo-linear-gradient, etc.
 */

// HapticButton wraps expo-haptics — mobile only, stays here
export * from './HapticButton';

// Skeleton is RN + Reanimated shimmer — stays here (web has its own)
export * from './Skeleton';

// Card has been promoted to @repo/ui — import from '@repo/ui' instead.
// Re-exported here for backwards compatibility with any screens that
// still import from '../components/ui'.
export { Card } from '@repo/ui';
