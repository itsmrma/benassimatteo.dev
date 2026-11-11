import { useState } from 'react';
import { Theme } from '@astryxdesign/core/theme';
import { themeLivrea } from './themes';
import { LivreaPortfolio } from './components/LivreaPortfolio';

export function App() {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('info@benassimatteo.dev');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  return (
    <Theme theme={themeLivrea} mode="dark">
      <LivreaPortfolio
        onCopyEmail={handleCopyEmail}
        emailCopied={emailCopied}
      />
    </Theme>
  );
}
