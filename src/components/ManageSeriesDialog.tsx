import React, { useMemo, useState } from 'react';
import { DataPoint } from '../types';

interface Props {
  datasetId: string;
  points: DataPoint[];
  onSave: (points: DataPoint[]) => void;
  onClose: () => void;
}

interface DraftRow {
  key: string;
  date: string;
  amount: string;
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};

const boxStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: '1.5rem',
  width: 'min(560px, 90vw)', maxHeight: '85vh', overflowY: 'auto',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
};

let rowKeySeq = 0;
const newRowKey = () => `row-${++rowKeySeq}`;

function pointsForLabel(points: DataPoint[], label: string): DraftRow[] {
  return points
    .filter(p => p.seriesName === label)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(p => ({ key: newRowKey(), date: p.date, amount: String(p.amount) }));
}

/**
 * Manual data entry — one label (series) at a time. Complements CSV import:
 * CSV replaces a whole dataset in one go, this edits a single series's rows
 * without touching the others.
 */
export function ManageSeriesDialog({ datasetId, points, onSave, onClose }: Props) {
  const labels = useMemo(
    () => [...new Set(points.map(p => p.seriesName))].sort(),
    [points]
  );

  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [rows, setRows] = useState<DraftRow[]>([]);

  const openLabel = (label: string) => {
    setSelectedLabel(label);
    setRows(pointsForLabel(points, label));
  };

  const openNewLabel = () => {
    const name = newLabelInput.trim();
    if (!name) return;
    setSelectedLabel(name);
    setRows([]);
    setNewLabelInput('');
  };

  const addRow = () => setRows(r => [...r, { key: newRowKey(), date: '', amount: '' }]);
  const updateRow = (key: string, field: 'date' | 'amount', value: string) =>
    setRows(r => r.map(row => (row.key === key ? { ...row, [field]: value } : row)));
  const deleteRow = (key: string) => setRows(r => r.filter(row => row.key !== key));

  const saveLabel = () => {
    if (!selectedLabel) return;
    const validRows = rows
      .filter(r => r.date && r.amount !== '' && !isNaN(parseFloat(r.amount)))
      .map(r => ({ datasetId, seriesName: selectedLabel, date: r.date, amount: parseFloat(r.amount) }));
    const updated = [...points.filter(p => p.seriesName !== selectedLabel), ...validRows];
    onSave(updated);
    setSelectedLabel(null);
  };

  const deleteLabel = () => {
    if (!selectedLabel) return;
    if (!window.confirm(`Delete all entries for "${selectedLabel}"?`)) return;
    onSave(points.filter(p => p.seriesName !== selectedLabel));
    setSelectedLabel(null);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={boxStyle} onClick={e => e.stopPropagation()}>
        {selectedLabel === null ? (
          <>
            <h2 style={{ marginTop: 0 }}>Manage data</h2>
            {labels.length === 0 && <p style={{ color: '#777' }}>No series yet — add one below.</p>}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
              {labels.map(label => (
                <li key={label} style={{ marginBottom: '0.4rem' }}>
                  <button style={{ width: '100%', textAlign: 'left', padding: '0.5rem' }} onClick={() => openLabel(label)}>
                    {label} <span style={{ color: '#999' }}>({points.filter(p => p.seriesName === label).length} points)</span>
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="New label name (e.g. Salary)"
                value={newLabelInput}
                onChange={e => setNewLabelInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && openNewLabel()}
                style={{ flex: 1, padding: '0.4rem' }}
              />
              <button onClick={openNewLabel} disabled={!newLabelInput.trim()}>+ New label</button>
            </div>
            <button onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 0 }}>{selectedLabel}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  <th style={{ paddingBottom: '0.3rem' }}>Date</th>
                  <th style={{ paddingBottom: '0.3rem' }}>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.key}>
                    <td style={{ padding: '0.2rem 0.4rem 0.2rem 0' }}>
                      <input
                        type="date"
                        value={row.date}
                        onChange={e => updateRow(row.key, 'date', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '0.2rem 0.4rem' }}>
                      <input
                        type="number"
                        step="any"
                        value={row.amount}
                        onChange={e => updateRow(row.key, 'amount', e.target.value)}
                        style={{ width: '8rem' }}
                      />
                    </td>
                    <td>
                      <button onClick={() => deleteRow(row.key)} aria-label={`Delete row ${row.date}`}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button onClick={addRow}>+ Add row</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
              <button onClick={() => setSelectedLabel(null)}>Back</button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={deleteLabel} style={{ color: '#b91c1c' }}>Delete label</button>
                <button onClick={saveLabel}>Save</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
