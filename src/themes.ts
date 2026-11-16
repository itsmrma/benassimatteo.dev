import { defineTheme } from '@astryxdesign/core/theme';
import { themes, defaultThemeSlug } from '../astryx-themes';

const baseTheme = themes[defaultThemeSlug];

/**
 * "Livrea" theme — carbon pit-wall palette.
 *
 * Graphite surfaces with a faint cool tint, three text roles and one
 * off-white accent for primary actions. The racing red survives only as the
 * livery mark (`--color-text-red`): the section tick, the scroll progress line,
 * the active navigation marker and the P1 rank. Nothing else is red.
 */
export const themeLivrea = defineTheme({
  name: 'livrea-motorsport',
  extends: baseTheme,
  tokens: {
    '--font-family-heading': '"Archivo", -apple-system, BlinkMacSystemFont, sans-serif',
    '--font-family-body': '"Archivo", -apple-system, BlinkMacSystemFont, sans-serif',
    '--font-family-code': '"Geist Mono", ui-monospace, monospace',

    // Graphite ramp, tinted a touch towards carbon blue
    '--color-background-body': '#0E0F12',
    '--color-background-surface': '#141519',
    '--color-background-card': '#16171C',
    '--color-background-muted': '#1D1E24',
    '--color-background-popover': '#16171C',

    // Three text roles
    '--color-text-primary': '#ECEDEF',
    '--color-text-secondary': '#A3A6AE',
    '--color-text-disabled': '#7C808A',

    // Off-white accent: primary buttons read as deliberate, not loud
    '--color-accent': '#ECEDEF',
    '--color-text-accent': '#ECEDEF',
    '--color-on-accent': '#0E0F12',
    '--color-icon-accent': '#ECEDEF',

    // Hairlines
    '--color-border': 'rgba(236, 237, 239, 0.08)',
    '--color-border-emphasized': 'rgba(236, 237, 239, 0.16)',

    // Livery mark — a muted racing red, used in a handful of places only.
    // Exposed through the palette red role so it stays a theme token.
    '--color-text-red': '#C8463E',
  },
});
