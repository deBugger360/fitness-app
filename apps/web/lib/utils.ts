/**
 * cn — className utility
 *
 * Joins class names, filtering falsy values.
 * Drop-in compatible with clsx/tailwind-merge for simple cases.
 *
 * If you need conditional merging of Tailwind utility conflicts,
 * install `clsx` + `tailwind-merge` and replace this implementation.
 */
export function cn(...classes: (string | undefined | null | false | 0)[]): string {
    return classes.filter(Boolean).join(' ');
}
