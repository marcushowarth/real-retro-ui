import React, { useEffect, useRef, useState } from 'react';

export type StartMode = 'example' | 'blank' | 'import';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, mode: StartMode) => void;
}

const choiceButton: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.6rem',
};

const choiceSubtext: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  color: '#777',
  fontWeight: 400,
};

/**
 * Replaces the old window.prompt('Dataset name:') flow — a blocking,
 * unstyled native dialog with no next-step guidance. This is a 2-step
 * wizard (name, then how to start), deliberately not a swipeable carousel:
 * naming a dataset is a linear flow, not something you browse back and
 * forth through. Discussed and agreed 2026-08-09, see Kanban #978.
 */
export function NewDatasetWizard({ open, onClose, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setStep(1);
      setName('');
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleNext = () => {
    if (!name.trim()) return;
    setStep(2);
  };

  const choose = (mode: StartMode) => {
    onSubmit(name.trim(), mode);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      style={{
        border: 'none',
        borderRadius: 8,
        padding: 0,
        width: 'min(420px, 90vw)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ padding: '1.5rem' }}>
        {step === 1 ? (
          <>
            <h2 style={{ marginTop: 0 }}>New dataset</h2>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>
              Give it a name — e.g. &ldquo;Motorbikes&rdquo; or &ldquo;My salary&rdquo;.
            </p>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              placeholder="Dataset name"
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => dialogRef.current?.close()}>Cancel</button>
              <button onClick={handleNext} disabled={!name.trim()}>
                Next
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 0 }}>How do you want to start?</h2>
            <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1rem' }}>&ldquo;{name}&rdquo;</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <button style={choiceButton} onClick={() => choose('example')}>
                <strong>Start from the example</strong>
                <span style={choiceSubtext}>Seed with the motorbike example data so you can see it working right away</span>
              </button>
              <button style={choiceButton} onClick={() => choose('blank')}>
                <strong>Start blank</strong>
                <span style={choiceSubtext}>Add points by hand or import a CSV afterwards</span>
              </button>
              <button style={choiceButton} onClick={() => choose('import')}>
                <strong>Import a CSV now</strong>
                <span style={choiceSubtext}>Creates the dataset — the CSV import button will be right there</span>
              </button>
            </div>
            <button onClick={() => setStep(1)}>Back</button>
          </>
        )}
      </div>
    </dialog>
  );
}
