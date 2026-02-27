'use client';
import { useNavigate } from 'react-router-dom';
import { useMaterialIcons } from '../lib/hooks/useMaterialIcons';

export default function EmiSchedule() {
  useMaterialIcons();
  const navigate = useNavigate();
  const navItems = [
    { label: 'Home', icon: 'home', path: '/dashboard' },
    { label: 'Invoices', icon: 'description', path: '/emiSchedule' },
    { label: 'Loans', icon: 'credit_card', path: '/loan' },
    { label: 'Profile', icon: 'person', path: '/dashboard' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f0eaeae1',
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
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            ←
          </span>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            Loan Detail
          </h2>
          <span className="material-symbols-outlined" style={{ fontSize: 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}>
            timer
          </span>
        </div>

        {/* Loan Info */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>
            LN-2023-8841
          </h3>
          <p style={{ fontSize: 13, color: '#22c55e' }}>
            Active - On Track
          </p>
        </div>

        {/* Summary Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: 18,
            marginBottom: 20,
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            display: 'flex',
            gap: 18,
          }}
        >
          {/* Circular Progress */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'conic-gradient(#22c55e 270deg, #e5e7eb 0deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              <strong>75%</strong>
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                PAID
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
                fontSize: 13,
              }}
            >
              <span>Total Repaid</span>
              <strong style={{ color: '#22c55e' }}>
                ₹1,125,000
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                marginBottom: 10,
              }}
            >
              <span>Outstanding</span>
              <strong>₹375,000</strong>
            </div>

            <span
              style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '4px 10px',
                borderRadius: 999,
                fontSize: 12,
              }}
            >
              On Track
            </span>
          </div>
        </div>

        {/* ROI & Tenure */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              flex: 1,
              background: '#ffffff',
              padding: 16,
              borderRadius: 16,
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            }}
          >
            <p style={{ fontSize: 12, color: '#6b7280' }}>
              RATE (ROI)
            </p>
            <strong>14.5% p.a.</strong>
          </div>

          <div
            style={{
              flex: 1,
              background: '#ffffff',
              padding: 16,
              borderRadius: 16,
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            }}
          >
            <p style={{ fontSize: 12, color: '#6b7280' }}>
              TENURE
            </p>
            <strong>12 Months</strong>
          </div>
        </div>

        {/* Collateral */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 18,
            padding: 18,
            marginBottom: 24,
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            COLLATERAL STATUS
          </p>

          <strong>Commercial Unit #402</strong>
          <p style={{ fontSize: 12, color: '#6b7280' }}>
            Crystal IT Park, Tower A, Sector 62, Noida
          </p>

          <div
            style={{
              marginTop: 10,
              background: '#f3f4f6',
              padding: 10,
              borderRadius: 10,
              fontSize: 13,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>ASSET VALUE</span>
            <strong>₹45,00,000</strong>
          </div>
        </div>

        {/* EMI Schedule */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>
              EMI SCHEDULE
            </h3>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              9 of 12 Paid
            </span>
          </div>

          {/* EMI Item - Scheduled */}
          <EmiCard
            month="November 2023"
            amount="₹125,000"
            date="05 Nov 2023"
            status="Scheduled"
          />

          {/* EMI Item - Bounced */}
          <EmiCard
            month="October 2023"
            amount="₹125,000"
            date="05 Oct 2023"
            status="Bounced"
          />

          {/* EMI Item - Paid */}
          <EmiCard
            month="September 2023"
            amount="₹125,000"
            date="05 Sep 2023"
            status="Paid"
          />

          <EmiCard
            month="August 2023"
            amount="₹125,000"
            date="05 Aug 2023"
            status="Paid"
          />

          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              marginTop: 20,
              color: '#111827',
              fontWeight: 500,
            }}
          >
            View Full Repayment Schedule
          </p>
        </div>
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
              color: i === 1 ? '#111827' : '#6b7280',
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

/* EMI CARD COMPONENT */
function EmiCard({ month, amount, date, status }) {
  const isBounced = status === 'Bounced';
  const isPaid = status === 'Paid';

  return (
    <div
      style={{
        background: isBounced ? '#fee2e2' : '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        border: isBounced ? '1px solid #fecaca' : 'none',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <strong>{month}</strong>
        <span
          style={{
            fontSize: 11,
            padding: '4px 8px',
            borderRadius: 999,
            background: isPaid
              ? '#dcfce7'
              : isBounced
              ? '#ef4444'
              : '#e5e7eb',
            color: isPaid
              ? '#166534'
              : isBounced
              ? '#ffffff'
              : '#374151',
          }}
        >
          {status}
        </span>
      </div>

      <strong style={{ display: 'block', marginBottom: 6 }}>
        {amount}
      </strong>

      <p style={{ fontSize: 12, color: '#6b7280' }}>
        {date}
      </p>

      {isBounced && (
        <button
          style={{
            marginTop: 10,
            background: '#ef4444',
            color: '#ffffff',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 10,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          Retry Payment
        </button>
      )}
    </div>
  );
}