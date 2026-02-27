import { useEffect, useState } from 'react';
import './submit.css';

export default function SubmitAnimation({ onDone }) {
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    setPhase('onclic');

    const toValidate = setTimeout(() => {
      setPhase('validate');
    }, 2250);

    return () => {
      clearTimeout(toValidate);
    };
  }, []);

  return (
    <div className="submit-overlay">
      <div className="submit-modal">
        <h3 className="submit-title">Processing Disbursement</h3>
        <p className="submit-subtitle">Please wait while we submit your request.</p>

        <div className="submit-container">
          <button
            type="button"
            className={`submit-button ${phase}`}
            aria-label={phase === 'validate' ? 'Completed' : 'Submitting'}
          >
            {phase === 'validate' ? '✓' : 'SUBMIT'}
          </button>
        </div>

        {phase === 'validate' && (
          <button type="button" className="submit-done-btn" onClick={onDone}>
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}