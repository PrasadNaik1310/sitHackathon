'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoanConfiguration() {
  const navigate = useNavigate();
  const [tenure, setTenure] = useState(9);
  const [agreed, setAgreed] = useState(false);
  const [mode, setMode] = useState('unsecured');
  const [submitState, setSubmitState] = useState('idle');
  const navItems = [
    { label: 'Home', icon: 'home', path: '/dashboard' },
    { label: 'Invoices', icon: 'description', path: '/emiSchedule' },
    { label: 'Loans', icon: 'credit_card', path: '/loan' },
    { label: 'Profile', icon: 'person', path: '/dashboard' },
  ];

  const handleAcceptDisburse = () => {
    if (!agreed || submitState !== 'idle') {
      return;
    }

    setSubmitState('loading');

    setTimeout(() => {
      setSubmitState('success');
    }, 2200);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '20px 16px 100px 16px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 18 }}>←</span>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            Loan Configuration
          </h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}>
              notifications
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}>
              info
            </span>
          </div>
        </div>

        {/* Financing Mode */}
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          FINANCING MODE
        </p>

        <div
          style={{
            display: 'flex',
            background: '#e5e7eb',
            borderRadius: 16,
            padding: 6,
            marginBottom: 24,
          }}
        >
          {['unsecured', 'secured'].map((item) => (
            <div
              key={item}
              onClick={() => setMode(item)}
              style={{
                flex: 1,
                padding: 14,
                textAlign: 'center',
                borderRadius: 14,
                background:
                  mode === item ? '#ffffff' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <strong>
                {item === 'unsecured'
                  ? 'Unsecured'
                  : 'Secured'}
              </strong>
              <p
                style={{
                  fontSize: 12,
                  color: '#6b7280',
                }}
              >
                {item === 'unsecured'
                  ? '20% Limit'
                  : '85% Limit'}
              </p>
            </div>
          ))}
        </div>

        {/* Eligible Amount Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: 18,
            marginBottom: 24,
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 13 }}>
              Eligible Principal Amount
            </span>
            <span
              style={{
                fontSize: 11,
                background: '#111827',
                color: '#ffffff',
                padding: '4px 8px',
                borderRadius: 999,
              }}
            >
              STANDARD
            </span>
          </div>

          <h1 style={{ fontSize: 28, marginBottom: 16 }}>
            ₹2,50,000
          </h1>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              color: '#6b7280',
            }}
          >
            <div>
              <p>Interest Rate</p>
              <strong style={{ color: '#111827' }}>
                18.0% p.a.
              </strong>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p>Processing Fee</p>
              <strong style={{ color: '#111827' }}>
                ₹5,000
              </strong>
            </div>
          </div>
        </div>

        {/* Repayment Calculator */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: 18,
            marginBottom: 24,
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
          }}
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            REPAYMENT CALCULATOR
          </h3>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div>
              <p style={{ fontSize: 12, color: '#6b7280' }}>
                MONTHLY INSTALLMENT
              </p>
              <h2 style={{ fontSize: 22 }}>
                ₹43,881{' '}
                <span
                  style={{
                    fontSize: 13,
                    color: '#6b7280',
                  }}
                >
                  / month
                </span>
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: '#6b7280' }}>
                TOTAL TENURE
              </p>
              <h2 style={{ fontSize: 18 }}>
                {tenure} Months
              </h2>
            </div>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="3"
            max="12"
            step="3"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            style={{ width: '100%', marginBottom: 10 }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#6b7280',
              marginBottom: 20,
            }}
          >
            <span>3m</span>
            <span>6m</span>
            <span>9m</span>
            <span>12m</span>
          </div>

          <div
            style={{
              background: '#f3f4f6',
              borderRadius: 12,
              padding: 14,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
            }}
          >
            <span>Total Repayment:</span>
            <strong>₹2,63,286</strong>
          </div>
        </div>

        {/* Agreement */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: 'flex',
              gap: 10,
              fontSize: 13,
              alignItems: 'flex-start',
            }}
          >
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
            />
            <span>
              I hereby agree to the <u>Loan Agreement</u> and
              General Liability Terms. I authorize G-Discount
              to deduct EMIs from my registered bank account
              via e-NACH.
            </span>
          </label>
        </div>

        {/* Accept Button */}
        <button 
          disabled={!agreed || submitState === 'loading' || submitState === 'success'}
          onClick={handleAcceptDisburse}
          style={{
            width: submitState === 'loading' || submitState === 'success' ? 56 : '100%',
            height: 56,
            padding: 16,
            borderRadius: submitState === 'loading' || submitState === 'success' ? '50%' : 14,
            border: submitState === 'loading' ? '3px solid #d1d5db' : 'none',
            borderLeftColor: submitState === 'loading' ? '#111827' : undefined,
            background:
              submitState === 'success'
                ? '#22c55e'
                : agreed
                  ? '#111827'
                  : '#d1d5db',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 15,
            cursor:
              !agreed || submitState === 'loading' || submitState === 'success'
                ? 'not-allowed'
                : 'pointer',
            transition: 'all 0.25s ease',
            display: 'block',
            margin: '0 auto',
          }}
        >
          {submitState === 'loading' ? '' : submitState === 'success' ? '✓' : 'Accept & Disburse'}
        </button>

        {submitState === 'success' && (
          <p
            style={{
              fontSize: 12,
              color: '#16a34a',
              marginTop: 10,
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            Disbursement submitted successfully. Funds will be processed shortly.
          </p>
        )}

        <p
          style={{
            fontSize: 11,
            color: '#6b7280',
            marginTop: 10,
            textAlign: 'center',
          }}
        >
          *Funds are typically disbursed within 24-48 hours of acceptance.
        </p>
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 0',
          maxWidth: 420,
          margin: '0 auto',
        }}
      >
        {navItems.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 12,
              color: i === 2 ? '#111827' : '#6b7280',
              cursor: 'pointer',
            }}
            onClick={() => navigate(item.path)}
          >
            <span style={{ fontSize: 18 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}
              >
                {item.icon}
              </span>
            </span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}