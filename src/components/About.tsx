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

      <h3 style={{ marginBottom: '0.4rem' }}>Pre-1987 data (back to 1209)</h3>
      <p>
        Years before ONS's own series begin are drawn from the Bank of England's{' '}
        <a href="https://www.bankofengland.co.uk/statistics/research-datasets" target="_blank" rel="noopener noreferrer" style={link}>
          "A Millennium of Macroeconomic Data for the UK"
        </a>{' '}
        (v3.1), sheet A47, used here with the Bank's permission (non-commercial reuse
        confirmed by the Bank's Monetary &amp; Financial Data team, September 2026). This
        is a splice of several named academic sources, not a single continuous survey —
        annual figures only, joined onto the live ONS series above from 1987/88 onward:
      </p>
      <ul style={{ paddingLeft: '1.2rem' }}>
        <li>
          <strong>CPI (1209–2016):</strong> Schumpeter-Gilboy index via Mitchell (1988);
          Crafts and Mills (1991); Feinstein (1991, 1998); ONS, O'Donoghue et al. (2004);
          ONS CPI (1949–2014).
        </li>
        <li>
          <strong>RPI (1209–2016):</strong> Clark (2009); ONS, O'Donoghue et al. (2004).
        </li>
      </ul>

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
