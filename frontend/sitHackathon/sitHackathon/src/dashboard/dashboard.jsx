'use client';
import { useNavigate } from 'react-router-dom';
export default function Dashboard() {
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
        background: '#f3f4f6',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Main Mobile Container */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '20px 16px 100px 16px', // bottom padding for nav
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>
            Financing Hub
          </h2>

          <div style={{ display: 'flex', gap: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}>
              notifications
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}>
              info
            </span>
          </div>
        </div>

        {/* Credit Summary Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            borderRadius: 20,
            padding: 24,
            color: '#ffffff',
            marginBottom: 28,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}
        >
          <p style={{ opacity: 0.8, fontSize: 13 }}>
            Total Credit Limit
          </p>

          <h1 style={{ fontSize: 28, margin: '6px 0 18px 0' }}>
            ₹25,00,000
          </h1>

          <p style={{ opacity: 0.8, fontSize: 12 }}>
            AVAILABLE FOR DISCOUNTING
          </p>

          <h2
            style={{
              fontSize: 22,
              color: '#22c55e',
              marginTop: 6,
              marginBottom: 18,
            }}
          >
            ₹18,45,000
          </h2>

          <button
            style={{
              width: '100%',
              padding: 14,
              background: '#22c55e',
              border: 'none',
              borderRadius: 14,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              color: '#ffffff',
            }}
          >
            + Discount New Invoice
          </button>
        </div>

        {/* Pending Invoices */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>
              Pending Invoices
            </h3>
            <span style={{ fontSize: 15, color: '#6b7280', cursor: 'pointer', ':hover': { color: '#111827' } }}>
              View All
            </span>
          </div>

          {[
            { id: 'INV-8829', date: 'Oct 12, 2023', amount: '₹1,24,500', status: 'Unpaid' },
            { id: 'INV-9012', date: 'Oct 15, 2023', amount: '₹45,000', status: 'Financed' },
            { id: 'INV-7734', date: 'Sep 28, 2023', amount: '₹89,200', status: 'Defaulted' },
          ].map((invoice, index) => (
            <div
              key={index}
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 14,
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
                <strong>{invoice.id}</strong>
                <strong>{invoice.amount}</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: '#6b7280' }}>
                  {invoice.date}
                </span>

                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    background:
                      invoice.status === 'Unpaid'
                        ? '#e5e7eb'
                        : invoice.status === 'Financed'
                        ? '#d1fae5'
                        : '#fee2e2',
                    color:
                      invoice.status === 'Unpaid'
                        ? '#374151'
                        : invoice.status === 'Financed'
                        ? '#065f46'
                        : '#991b1b',
                  }}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Active Loans */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>
                Active Loans
              </h3>
              <span
                style={{
                  fontSize: 11,
                  background: '#e5e7eb',
                  padding: '3px 8px',
                  borderRadius: 999,
                }}
              >
                3 Running
              </span>
            </div>

         <span style={{ fontSize: 15, color: '#6b7280', cursor: 'pointer', ':hover': { color: '#111827' } }}>
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 14,
              overflowX: 'auto',
              paddingBottom: 6,
            }}
          >
            {[
              {
                id: 'L-2041',
                amount: '₹5,00,000',
                progress: 65,
                roi: '14%',
                next: 'Nov 05',
              },
              {
                id: 'L-1192',
                amount: '₹2,50,000',
                progress: 40,
                roi: '12.5%',
                next: 'Nov 12',
              },
            ].map((loan, index) => (
              <div
                key={index}
                style={{
                  minWidth: 240,
                  background: '#ffffff',
                  borderRadius: 18,
                  padding: 16,
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
                  <strong>{loan.id}</strong>
                  <span>↗</span>
                </div>

                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                  Repayment Progress
                </p>

                <div
                  style={{
                    height: 6,
                    background: '#e5e7eb',
                    borderRadius: 999,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      width: `${loan.progress}%`,
                      height: '100%',
                      background: '#111827',
                      borderRadius: 999,
                    }}
                  />
                </div>

                <p style={{ fontSize: 13, marginBottom: 12 }}>
                  {loan.progress}%
                </p>

                <strong style={{ display: 'block', marginBottom: 14 }}>
                  {loan.amount}
                </strong>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: '#6b7280',
                  }}
                >
                  <div>
                    <p>ROI</p>
                    <strong style={{ color: '#111827' }}>
                      {loan.roi}
                    </strong>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p>NEXT EMI</p>
                    <strong style={{ color: '#111827' }}>
                      {loan.next}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Insight */}
        <div
          style={{
            background: '#e5e7eb',
            borderRadius: 18,
            padding: 18,
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            MARKET INSIGHT
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                background: '#ffffff',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              
            </div>

            <div>
              <strong>GST Liquidity is High</strong>
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                Avg. Approval time: 14 mins
              </p>
            </div>
          </div>
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
              color: i === 0 ? '#111827' : '#6b7280',
              cursor: 'pointer',
            }}
            onClick={() => navigate(item.path)}
          >
            <span style={{ fontSize: 18 }}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: i === 0 ? 25 : 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}
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