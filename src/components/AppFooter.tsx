import { useEffect, useState, CSSProperties } from 'react';
import { fetchVersion, VersionInfo } from '../api/version';

const short = (s: string) => (s === 'dev' ? 'dev' : s.slice(0, 7));

// Build-provenance link targets — see Agents/patterns/version-build-provenance.md.
// Each sha badge links straight to the exact commit that's live, not just the
// repo home page: "what's deployed right now" is the whole point of showing
// a sha at all, so the link should land on that commit's diff, not a generic
// landing page one more click away from it.
const UI_REPO = 'https://github.com/marcushowarth/real-retro-ui';
const API_REPO = 'https://github.com/marcushowarth/real-retro-api';

const linkStyle: CSSProperties = { color: 'inherit', textDecoration: 'none', borderBottom: '1px dotted #bbb' };

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
        <span>
          UI{' '}
          {__UI_VERSION__ === 'dev' ? (
            'dev'
          ) : (
            <a href={`${UI_REPO}/commit/${__UI_VERSION__}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              {short(__UI_VERSION__)}
            </a>
          )}
        </span>
        <span style={{ color: '#ccc' }}>·</span>
        <span>
          API{' '}
          {!api ? (
            '—'
          ) : api.gitSha === 'dev' ? (
            'dev'
          ) : (
            <a href={`${API_REPO}/commit/${api.gitSha}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>
              {short(api.gitSha)}
            </a>
          )}
        </span>
      </div>
      <p style={{ margin: '0.4rem auto 0', maxWidth: '32rem', color: '#aaa', lineHeight: 1.4 }}>
        Nothing you enter is stored on our servers — any dataset you create lives in
        your browser only. Illustrative only.
      </p>
    </footer>
  );
}
