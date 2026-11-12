import { defineTheme } from '@astryxdesign/core/theme';
import { themes, defaultThemeSlug } from '../astryx-themes';

const baseTheme = themes[defaultThemeSlug];

/**
 * Prototype B — "Livrea" Carbon Chassis Theme
 * High-performance motorsport technical livery:
 * Deep carbon chassis (#0B0D12), graphite surfaces (#12151D),
 * precision borders, high-contrast platinum typography (#F8FAFC),
 * secondary slate (#94A3B8), and calibrated racing vermilion (#E03E3E).
 */
export const themeLivrea = defineTheme({
  name: 'livrea-motorsport',
  extends: baseTheme,
  tokens: {
    '--font-family-heading': '"Archivo", -apple-system, BlinkMacSystemFont, sans-serif',
    '--font-family-body': '"Archivo", -apple-system, BlinkMacSystemFont, sans-serif',
    '--font-family-code': '"Geist Mono", monospace',
    '--color-background-body': '#0B0D12',
    '--color-background-surface': '#12151D',
    '--color-background-card': '#161924',
    '--color-background-muted': '#1E2230',
    '--color-text-primary': '#F8FAFC',
    '--color-text-secondary': '#94A3B8',
    '--color-accent': '#E03E3E',
    '--color-text-accent': '#E03E3E',
    '--color-border': 'rgba(255, 255, 255, 0.09)',
  },
});
