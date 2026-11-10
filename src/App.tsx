import { useState, useEffect } from 'react';
import { Theme, defineTheme } from '@astryxdesign/core/theme';
import { themes, defaultThemeSlug } from '../astryx-themes';
import { WorkstationPortfolio } from './components/WorkstationPortfolio';

const workstationTheme = defineTheme({
  name: 'sleek-craft',
  extends: themes[defaultThemeSlug],
  tokens: {
    '--font-family-heading': '"Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
    '--font-family-body': 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    '--font-family-code': '"JetBrains Mono", "Cascadia Code", monospace',
    '--color-background-body': ['#f8fafc', '#090d16'],
    '--color-background-surface': ['#ffffff', '#0f172a'],
    '--color-background-card': ['#ffffff', '#131e33'],
    '--color-background-muted': ['#f1f5f9', '#1e293b'],
    '--color-accent': ['#4f46e5', '#6366f1'],
    '--color-text-accent': ['#4f46e5', '#818cf8'],
    '--color-text-primary': ['#0f172a', '#f8fafc'],
    '--color-text-secondary': ['#475569', '#94a3b8'],
  },
});

function getInitialColorMode(): 'dark' | 'light' {
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem('benassi-color-mode');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
  }
  return 'dark';
}

export function App() {
  const [colorMode, setColorMode] = useState<'dark' | 'light'>(getInitialColorMode);

  const handleToggleColorMode = () => {
    setColorMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('benassi-color-mode', next);
        } catch {
          // ignore storage errors
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      url.searchParams.delete('variant');
      url.searchParams.delete('switcher');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
  }, []);

  return (
    <Theme theme={workstationTheme} mode={colorMode}>
      <WorkstationPortfolio
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
      />
    </Theme>
  );
}
