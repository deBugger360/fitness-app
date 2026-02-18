
import { lightTheme, darkTheme, palette, radius, spacing, fontSize, fontWeight, shadows } from '../theme/colors';
import { lightColorVars, darkColorVars, radiusVars, spacingVars, lightCssVars, darkCssVars, LIGHT_CSS_VARS_BLOCK, DARK_CSS_VARS_BLOCK } from '../theme/cssVariables';

// ─── Palette ──────────────────────────────────────────────────────────────────
describe('palette', () => {

    it('has all required color families', () => {
        expect(palette).toHaveProperty('slate');
        expect(palette).toHaveProperty('indigo');
        expect(palette).toHaveProperty('emerald');
        expect(palette).toHaveProperty('amber');
        expect(palette).toHaveProperty('red');
    });

    it('slate scale has all required stops', () => {
        const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
        stops.forEach(stop => {
            expect(palette.slate).toHaveProperty(String(stop));
        });
    });

    it('all palette values are valid hex strings', () => {
        const hexRegex = /^#[0-9a-fA-F]{3,8}$/;
        const checkObj = (obj: any) => {
            for (const val of Object.values(obj)) {
                if (typeof val === 'string') {
                    expect(val).toMatch(hexRegex);
                } else if (typeof val === 'object' && val !== null) {
                    checkObj(val);
                }
            }
        };
        // Only check named colors (not white/black/transparent)
        checkObj({ slate: palette.slate, indigo: palette.indigo });
    });
});

// ─── lightTheme ───────────────────────────────────────────────────────────────
describe('lightTheme', () => {

    it('has dark: false', () => {
        expect(lightTheme.dark).toBe(false);
    });

    it('has all required color keys', () => {
        const requiredKeys = [
            'background', 'card', 'text', 'textSecondary', 'primary',
            'success', 'warning', 'error', 'border', 'tint',
        ];
        requiredKeys.forEach(key => {
            expect(lightTheme.colors).toHaveProperty(key);
        });
    });

    it('has new token keys added in Phase 5', () => {
        expect(lightTheme.colors).toHaveProperty('popover');
        expect(lightTheme.colors).toHaveProperty('textMuted');
        expect(lightTheme.colors).toHaveProperty('separator');
        expect(lightTheme.colors).toHaveProperty('tabBarInactive');
        expect(lightTheme.colors).toHaveProperty('overlay');
        expect(lightTheme.colors).toHaveProperty('glass');
    });

    it('primary is indigo.600', () => {
        expect(lightTheme.colors.primary).toBe(palette.indigo[600]);
    });

    it('background is slate.50', () => {
        expect(lightTheme.colors.background).toBe(palette.slate[50]);
    });
});

// ─── darkTheme ────────────────────────────────────────────────────────────────
describe('darkTheme', () => {

    it('has dark: true', () => {
        expect(darkTheme.dark).toBe(true);
    });

    it('has all the same color keys as lightTheme', () => {
        const lightKeys = Object.keys(lightTheme.colors).sort();
        const darkKeys = Object.keys(darkTheme.colors).sort();
        expect(darkKeys).toEqual(lightKeys);
    });

    it('primary is brighter (indigo.400) for dark mode', () => {
        expect(darkTheme.colors.primary).toBe(palette.indigo[400]);
    });

    it('background is darker than light mode', () => {
        // slate.950 is darker than slate.50
        expect(darkTheme.colors.background).toBe(palette.slate[950]);
    });

    it('text is light on dark background', () => {
        expect(darkTheme.colors.text).toBe(palette.slate[50]);
    });
});

// ─── Spacing tokens ───────────────────────────────────────────────────────────
describe('spacing', () => {

    it('has standard spacing values', () => {
        expect(spacing[4]).toBe(16);
        expect(spacing[8]).toBe(32);
    });

    it('spacing values are numbers', () => {
        Object.values(spacing).forEach(val => {
            expect(typeof val).toBe('number');
        });
    });
});

// ─── Radius tokens ────────────────────────────────────────────────────────────
describe('radius', () => {

    it('has all required radius sizes', () => {
        expect(radius).toHaveProperty('sm');
        expect(radius).toHaveProperty('md');
        expect(radius).toHaveProperty('lg');
        expect(radius).toHaveProperty('xl');
        expect(radius).toHaveProperty('2xl');
        expect(radius).toHaveProperty('full');
    });

    it('radius values increase in size', () => {
        expect(radius.sm).toBeLessThan(radius.md);
        expect(radius.md).toBeLessThan(radius.lg);
        expect(radius.lg).toBeLessThan(radius.xl);
        expect(radius.xl).toBeLessThan(radius['2xl']);
    });

    it('full radius is very large (pill shape)', () => {
        expect(radius.full).toBeGreaterThan(1000);
    });
});

// ─── fontSize tokens ──────────────────────────────────────────────────────────
describe('fontSize', () => {

    it('has xs through 5xl', () => {
        ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'].forEach(size => {
            expect(fontSize).toHaveProperty(size);
        });
    });

    it('font sizes increase monotonically', () => {
        const sizes = [fontSize.xs, fontSize.sm, fontSize.base, fontSize.md,
        fontSize.lg, fontSize.xl, fontSize['2xl'], fontSize['3xl']];
        for (let i = 1; i < sizes.length; i++) {
            expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
        }
    });
});

// ─── shadows tokens ───────────────────────────────────────────────────────────
describe('shadows', () => {

    it('has sm, md, lg variants', () => {
        expect(shadows).toHaveProperty('sm');
        expect(shadows).toHaveProperty('md');
        expect(shadows).toHaveProperty('lg');
    });

    it('each shadow has required React Native shadow props', () => {
        ['sm', 'md', 'lg'].forEach(size => {
            const shadow = shadows[size as keyof typeof shadows];
            expect(shadow).toHaveProperty('shadowColor');
            expect(shadow).toHaveProperty('shadowOffset');
            expect(shadow).toHaveProperty('shadowOpacity');
            expect(shadow).toHaveProperty('shadowRadius');
            expect(shadow).toHaveProperty('elevation');
        });
    });
});

// ─── cssVariables ─────────────────────────────────────────────────────────────
describe('cssVariables', () => {

    it('lightColorVars contains --color-background', () => {
        expect(lightColorVars).toHaveProperty('--color-background');
        expect(lightColorVars['--color-background']).toBe(palette.slate[50]);
    });

    it('darkColorVars contains --color-background with dark value', () => {
        expect(darkColorVars).toHaveProperty('--color-background');
        expect(darkColorVars['--color-background']).toBe(palette.slate[950]);
    });

    it('converts camelCase to kebab-case correctly', () => {
        expect(lightColorVars).toHaveProperty('--color-text-secondary');
        expect(lightColorVars).toHaveProperty('--color-primary-light');
        expect(lightColorVars).toHaveProperty('--color-tab-bar-inactive');
    });

    it('radiusVars contains all radius tokens as px strings', () => {
        expect(radiusVars['--radius-sm']).toBe(`${radius.sm}px`);
        expect(radiusVars['--radius-lg']).toBe(`${radius.lg}px`);
        expect(radiusVars['--radius']).toBe(`${radius.lg}px`);
    });

    it('spacingVars contains spacing tokens as px strings', () => {
        expect(spacingVars['--spacing-4']).toBe('16px');
        expect(spacingVars['--spacing-8']).toBe('32px');
    });

    it('lightCssVars merges colors, radius, and spacing', () => {
        expect(lightCssVars).toHaveProperty('--color-background');
        expect(lightCssVars).toHaveProperty('--radius-lg');
        expect(lightCssVars).toHaveProperty('--spacing-4');
    });

    it('LIGHT_CSS_VARS_BLOCK starts with :root {', () => {
        expect(LIGHT_CSS_VARS_BLOCK).toMatch(/^:root \{/);
    });

    it('DARK_CSS_VARS_BLOCK starts with .dark', () => {
        expect(DARK_CSS_VARS_BLOCK).toMatch(/^\.dark/);
    });

    it('CSS blocks contain valid CSS variable declarations', () => {
        expect(LIGHT_CSS_VARS_BLOCK).toContain('--color-background:');
        expect(DARK_CSS_VARS_BLOCK).toContain('--color-background:');
    });

    it('light and dark CSS blocks have different background values', () => {
        const lightBg = lightColorVars['--color-background'];
        const darkBg = darkColorVars['--color-background'];
        expect(lightBg).not.toBe(darkBg);
    });
});
