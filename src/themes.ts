import { defineTheme } from '@astryxdesign/core/theme';
import { themes, defaultThemeSlug } from '../astryx-themes';

const baseTheme = themes[defaultThemeSlug];

/**
 * Prototype B — "Livrea" Carbon Chassis Theme
 * High-performance motorsport technical livery:
 * Deep carbon chassis (#0A0B0D), graphite surfaces (#131418),
 * precision borders, high-contrast white typography (#FFFFFF),
 * and precision racing red (#E10600).
 */
export const themeLivrea = defineTheme({
  name: 'livrea-motorsport',
  extends: baseTheme,
  tokens: {
    '--font-family-heading': '"Archivo", -apple-system, BlinkMacSystemFont, sans-serif',
    '--font-family-body': '"Archivo", -apple-system, BlinkMacSystemFont, sans-serif',
    '--font-family-code': '"Geist Mono", monospace',
    '--color-background-body': '#0A0B0D',
    '--color-background-surface': '#131418',
    '--color-background-card': '#181A20',
    '--color-background-muted': '#20222A',
    '--color-text-primary': '#FFFFFF',
    '--color-text-secondary': '#9A9EA8',
    '--color-accent': '#E10600',
    '--color-text-accent': '#E10600',
    '--color-border': 'rgba(255, 255, 255, 0.12)',
  },
});
