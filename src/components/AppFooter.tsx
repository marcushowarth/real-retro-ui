import { useEffect, useState } from 'react';
import { fetchVersion, VersionInfo } from '../api/version';

const short = (s: string) => (s === 'dev' ? 'dev' : s.slice(0, 7));

export function AppFooter() {
  const [api, setApi] = useState<VersionInfo | null>(null);

  useEffect(() => {
    fetchVersion()
      .then(setApi)
      .catch(() => setApi(null)); // API unreachable — show a dash rather than failing
  }, []);

  const tooltip = (() => {
    const apiLine = api
      ? `API ${api.version} (${api.gitSha}) built ${api.builtAt}`
      : 'API unreachable';
    return `UI ${__UI_VERSION__} built ${__UI_BUILT_AT__}\n${apiLine}`;
  })();

  return (
    <footer style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e2e2', color: '#999', fontSize: '0.75rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }} title={tooltip}>
        <span>REAL RETRO</span>
        <span style={{ color: '#ccc' }}>·</span>
        <span>UI {short(__UI_VERSION__)}</span>
        <span style={{ color: '#ccc' }}>·</span>
        <span>API {api ? short(api.gitSha) : '—'}</span>
      </div>
      <p style={{ margin: '0.4rem auto 0', maxWidth: '32rem', color: '#aaa', lineHeight: 1.4 }}>
        Nothing you enter is stored on our servers — any dataset you create lives in
        your browser only. Illustrative only.
      </p>
    </footer>
  );
}
