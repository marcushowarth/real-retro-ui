import React, { useState } from 'react';
import { adjust, formatCurrency } from '../utils/inflation';
import { ReferenceYearSlider } from './ReferenceYearSlider';
import { SpotValueChart } from './SpotValueChart';

interface Props {
  rpiMap: Map<number, number>;
  latestYear: number;
  cpiMap: Map<number, number>;
  cpiLoading: boolean;
  cpiError: string | null;
  inputYear: number;
  onInputYearChange: (year: number) => void;
  targetYear: number;
  onTargetYearChange: (year: number) => void;
}

// inputYear/targetYear are lifted to App so the same "include historical" confirm-on-uncheck
// flow used by the Datasets tab (kanban #1013) can also cover this tab's two year pickers.
export function SpotValue({
  rpiMap, latestYear, cpiMap, cpiLoading, cpiError,
  inputYear, onInputYearChange, targetYear, onTargetYearChange
}: Props) {
  const years = [...rpiMap.keys()].sort((a, b) => a - b);
  const minYear = years.length > 0 ? years[0] : 1987;

  const [amountInput, setAmountInput] = useState('');
  const [showChart, setShowChart] = useState(false);

  const amount = parseFloat(amountInput);
  const hasAmount = amountInput !== '' && !isNaN(amount) && amount > 0;

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <label>
          <div>Amount</div>
          <input
            type="number"
            step="any"
            placeholder="e.g. 25000"
            value={amountInput}
            onChange={e => setAmountInput(e.target.value)}
            style={{ width: '10rem', padding: '0.4rem' }}
          />
        </label>
        <label>
          <div>Year</div>
          <select
            value={inputYear}
            onChange={e => onInputYearChange(Number(e.target.value))}
            style={{ padding: '0.4rem' }}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>

      {!hasAmount ? (
        <p style={{ color: '#777' }}>Enter an amount to see the real-terms value.</p>
      ) : (
        <>
          <button onClick={() => setShowChart(s => !s)} style={{ marginBottom: '1rem' }}>
            {showChart ? 'Back to slider' : 'View as chart across years'}
          </button>

          {showChart ? (
            <SpotValueChart amount={amount} inputYear={inputYear} rpiMap={rpiMap} cpiMap={cpiMap} />
          ) : (
            <>
              <ReferenceYearSlider
                minYear={minYear}
                maxYear={latestYear}
                value={targetYear}
                onChange={onTargetYearChange}
              />
              <p style={{ fontSize: '1rem', color: '#555', margin: '1rem 0 0.5rem' }}>
                {formatCurrency(amount)} in {inputYear} is worth, in {targetYear} money:
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ background: '#e6edfd', borderRadius: 8, padding: '0.5rem 0.9rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    RPI-adjusted
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#2563eb' }}>
                    {formatCurrency(adjust(amount, inputYear, targetYear, rpiMap))}
                  </div>
                </div>
                <div style={{ background: '#fbe7e7', borderRadius: 8, padding: '0.5rem 0.9rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    CPI-adjusted
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 600, color: '#dc2626' }}>
                    {cpiLoading ? '…' : cpiError ? 'unavailable' : formatCurrency(adjust(amount, inputYear, targetYear, cpiMap))}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
