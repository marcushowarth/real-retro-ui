import React, { useState } from 'react';
import { adjust, formatCurrency } from '../utils/inflation';
import { ReferenceYearSlider } from './ReferenceYearSlider';
import { SpotValueChart } from './SpotValueChart';

interface Props {
  rpiMap: Map<number, number>;
  latestYear: number;
}

export function SpotValue({ rpiMap, latestYear }: Props) {
  const years = [...rpiMap.keys()].sort((a, b) => a - b);
  const minYear = years.length > 0 ? years[0] : 1987;

  const [amountInput, setAmountInput] = useState('');
  const [inputYear, setInputYear] = useState(latestYear);
  const [targetYear, setTargetYear] = useState(latestYear);
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
            onChange={e => setInputYear(Number(e.target.value))}
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
            <SpotValueChart amount={amount} inputYear={inputYear} rpiMap={rpiMap} />
          ) : (
            <>
              <ReferenceYearSlider
                minYear={minYear}
                maxYear={latestYear}
                value={targetYear}
                onChange={setTargetYear}
              />
              <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>
                {formatCurrency(amount)} in {inputYear} → <strong>{formatCurrency(adjust(amount, inputYear, targetYear, rpiMap))}</strong> in {targetYear} money
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
