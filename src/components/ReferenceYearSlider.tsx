import React from 'react';

interface Props {
  minYear: number;
  maxYear: number;
  value: number;
  onChange: (year: number) => void;
}

export function ReferenceYearSlider({ minYear, maxYear, value, onChange }: Props) {
  return (
    <div style={{ margin: '1rem 0' }}>
      <label htmlFor="target-year-slider">
        <strong>Target year: {value}</strong>
        &nbsp;— values shown in {value} money
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
        <span>{minYear}</span>
        <input
          id="target-year-slider"
          type="range"
          min={minYear}
          max={maxYear}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span>{maxYear} (today)</span>
      </div>
    </div>
  );
}
