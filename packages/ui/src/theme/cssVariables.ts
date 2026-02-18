/**
 * cssVariables.ts
 *
 * Converts the shared @repo/ui theme tokens into CSS custom property
 * declarations. Import this in your web app's theme setup to keep
 * CSS variables in sync with the shared design system.
 *
 * Usage (in a Next.js layout or globals.css via a script):
 *   import { lightCssVars, darkCssVars } from '@repo/ui/cssVariables';
 *
 * Or use the pre-built CSS string constants directly in a <style> tag.
 */

import { lightTheme, darkTheme, radius, spacing } from './colors';

/**
 * Converts a camelCase token name to a kebab-case CSS variable name.
 * e.g. "primaryLight" → "--color-primary-light"
 */
function toKebab(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Generates a CSS variable block from a color map.
 */
function buildColorVars(colors: Record<string, string>, prefix = '--color'): Record<string, string> {
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(colors)) {
        vars[`${prefix}-${toKebab(key)}`] = value as string;
    }
    return vars;
}

/**
 * Generates a CSS variable block from the radius tokens.
 */
function buildRadiusVars(): Record<string, string> {
    return {
        '--radius-sm': `${radius.sm}px`,
        '--radius-md': `${radius.md}px`,
        '--radius-lg': `${radius.lg}px`,
        '--radius-xl': `${radius.xl}px`,
        '--radius-2xl': `${radius['2xl']}px`,
        '--radius': `${radius.lg}px`, // default alias
    };
}

/**
 * Generates a CSS variable block from the spacing tokens.
 */
function buildSpacingVars(): Record<string, string> {
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(spacing)) {
        vars[`--spacing-${key}`] = `${value}px`;
    }
    return vars;
}

/**
 * Converts a variable map to a CSS block string.
 */
function toCssBlock(vars: Record<string, string>): string {
    return Object.entries(vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported variable maps (for programmatic use in JS/TS)
// ─────────────────────────────────────────────────────────────────────────────

export const lightColorVars = buildColorVars(lightTheme.colors);
export const darkColorVars = buildColorVars(darkTheme.colors);
export const radiusVars = buildRadiusVars();
export const spacingVars = buildSpacingVars();

export const lightCssVars = { ...lightColorVars, ...radiusVars, ...spacingVars };
export const darkCssVars = { ...darkColorVars, ...radiusVars, ...spacingVars };

// ─────────────────────────────────────────────────────────────────────────────
// Exported CSS strings (for injection into <style> tags or CSS files)
// ─────────────────────────────────────────────────────────────────────────────

export const LIGHT_CSS_VARS_BLOCK = `:root {\n${toCssBlock(lightCssVars)}\n}`;
export const DARK_CSS_VARS_BLOCK = `.dark, [data-theme="dark"] {\n${toCssBlock(darkColorVars)}\n}`;
export const SYSTEM_DARK_CSS_VARS_BLOCK = `@media (prefers-color-scheme: dark) {\n  :root {\n${toCssBlock(darkColorVars).split('\n').map(l => '  ' + l).join('\n')}\n  }\n}`;

/**
 * Returns a React Native StyleSheet-compatible object for the given theme.
 * Useful for applying tokens in RN without importing the full theme context.
 */
export function getThemeVars(dark: boolean) {
    return dark ? darkColorVars : lightColorVars;
}
