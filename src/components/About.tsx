import React from 'react';

const link: React.CSSProperties = { color: '#2563eb' };

export function About() {
  return (
    <div style={{ maxWidth: '38rem', lineHeight: 1.6, color: '#333' }}>
      <p>
        REAL RETRO answers "what was £X worth, in today's money?" (or any other
        year) — a real-terms retrospective visualiser, not a forecast or
        financial-advice tool. Nothing you enter is stored on our servers; any
        dataset you build lives in your browser's <code>localStorage</code> only.
        Illustrative only.
      </p>

      <h3 style={{ marginBottom: '0.4rem' }}>Data sources</h3>
      <p>
        Both index series come from the Office for National Statistics' published
        time series (dataset MM23, Consumer Price Inflation), refreshed weekly:
      </p>
      <ul style={{ paddingLeft: '1.2rem' }}>
        <li>
          <strong>RPI</strong> — <a href="https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/chaw/mm23" target="_blank" rel="noopener noreferrer" style={link}>RPI All Items Index: Jan 1987=100</a> (CDID CHAW). Covers 1987 onward.
        </li>
        <li>
          <strong>CPI</strong> — <a href="https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7bt/mm23" target="_blank" rel="noopener noreferrer" style={link}>CPI Index 00: All Items 2015=100</a> (CDID D7BT). Covers 1988 onward.
        </li>
      </ul>
      <p>
        RPI and CPI measure inflation differently (RPI includes housing costs like
        mortgage interest that CPI excludes, among other basket differences), so
        the same amount adjusted by each will genuinely disagree — that's shown
        deliberately, not averaged away.
      </p>

      <h3 style={{ marginBottom: '0.4rem' }}>Code</h3>
      <p>
        Both repos are public:{' '}
        <a href="https://github.com/marcushowarth/real-retro-api" target="_blank" rel="noopener noreferrer" style={link}>real-retro-api</a>
        {' · '}
        <a href="https://github.com/marcushowarth/real-retro-ui" target="_blank" rel="noopener noreferrer" style={link}>real-retro-ui</a>
        {' · '}
        <a href="https://github.com/marcushowarth/fin-model" target="_blank" rel="noopener noreferrer" style={link}>fin-model</a>{' '}
        (the shared engine both this and FIN OPTICS build on).
      </p>
    </div>
  );
}
