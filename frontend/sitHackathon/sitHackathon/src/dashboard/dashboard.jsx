'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaterialIcons } from '../lib/hooks/useMaterialIcons';
import { authStorage, businessesApi, invoicesApi, offersApi } from '../lib/api';

export default function Dashboard() {
  useMaterialIcons();
  const navigate = useNavigate();
  const [businessProfile, setBusinessProfile] = useState(null);
  const [isBusinessLoading, setIsBusinessLoading] = useState(true);
  const [businessError, setBusinessError] = useState('');
  const [creditScore, setCreditScore] = useState(null);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [isRecalculatingScore, setIsRecalculatingScore] = useState(false);
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);
  const [offerFeedback, setOfferFeedback] = useState('');
  const navItems = [
    { label: 'Home', icon: 'home', path: '/dashboard' },
    { label: 'Invoices', icon: 'description', path: '/invoices' },
    { label: 'Loans', icon: 'credit_card', path: '/loan' },
    { label: 'Profile', icon: 'person', path: '/dashboard' },
  ];

  const loadBusiness = async () => {
    setIsBusinessLoading(true);
    setBusinessError('');

    try {
      const [profileData, scoreData, invoiceData] = await Promise.all([
        businessesApi.getMyBusiness(),
        businessesApi.getCreditScore(),
        invoicesApi.listMyInvoices('UNPAID'),
      ]);

      setBusinessProfile(profileData);
      setCreditScore(scoreData);
      setPendingInvoices(invoiceData || []);
    } catch (err) {
      const hasToken = authStorage.getAccessToken();
      if (!hasToken) {
        navigate('/login');
        return;
      }

      setBusinessError(err instanceof Error ? err.message : 'Failed to load business profile.');
    } finally {
      setIsBusinessLoading(false);
    }
  };

  useEffect(() => {
    loadBusiness();
  }, [navigate]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  const getStatusStyles = (status) => {
    if (status === 'UNPAID') {
      return { background: '#e5e7eb', color: '#374151', label: 'Unpaid' };
    }
    if (status === 'FINANCED') {
      return { background: '#d1fae5', color: '#065f46', label: 'Financed' };
    }
    if (status === 'DEFAULTED') {
      return { background: '#fee2e2', color: '#991b1b', label: 'Defaulted' };
    }

    return {
      background: '#e0e7ff',
      color: '#3730a3',
      label: (status || 'UNKNOWN').replaceAll('_', ' '),
    };
  };

  const handleGenerateOffer = async () => {
    if (!pendingInvoices.length) {
      setOfferFeedback('No unpaid invoice available to generate offer.');
      return;
    }

    setIsGeneratingOffer(true);
    setOfferFeedback('');

    try {
      const generated = await offersApi.generate({ invoice_id: pendingInvoices[0].id });
      localStorage.setItem('selectedInvoiceId', pendingInvoices[0].id);

      const generatedOfferId = generated?.offer_id || generated?.id;
      if (generatedOfferId) {
        localStorage.setItem('selectedOfferId', generatedOfferId);
      }

      setOfferFeedback(`Offer generated for ${pendingInvoices[0].invoice_number || pendingInvoices[0].id}.`);
    } catch (err) {
      setOfferFeedback(err instanceof Error ? err.message : 'Failed to generate offer.');
    } finally {
      setIsGeneratingOffer(false);
    }
  };

  const handleRecalculateCreditScore = async () => {
    setIsRecalculatingScore(true);
    setBusinessError('');

    try {
      const updatedScore = await businessesApi.recalculateCreditScore();
      setCreditScore(updatedScore);
    } catch (err) {
      setBusinessError(err instanceof Error ? err.message : 'Failed to recalculate credit score.');
    } finally {
      setIsRecalculatingScore(false);
    }
  };

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
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
              {isBusinessLoading
                ? 'Loading profile...'
                : businessProfile?.gst_number
                  ? 'Financing Hub'
                  : 'Financing Hub'}
            </h2>
            {businessProfile?.gst_number && (
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                GST: {businessProfile.gst_number}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}>
              notifications
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}>
              info
            </span>
          </div>
        </div>

        {businessError && (
          <p style={{ color: '#dc2626', fontSize: 13, marginTop: -8, marginBottom: 14 }}>
            {businessError}
          </p>
        )}

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
            Final Credit Score
          </p>

          <h1 style={{ fontSize: 28, margin: '6px 0 18px 0' }}>
            {creditScore?.final_score ?? '--'}
          </h1>

          <p style={{ opacity: 0.8, fontSize: 12 }}>
            RISK GRADE
          </p>

          <h2
            style={{
              fontSize: 22,
              color: '#22c55e',
              marginTop: 6,
              marginBottom: 18,
            }}
          >
            {creditScore?.risk_grade || '--'}
          </h2>

          <button
            onClick={handleRecalculateCreditScore}
            disabled={isRecalculatingScore}
            style={{
              width: '100%',
              padding: 10,
              background: '#334155',
              border: 'none',
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 12,
              cursor: isRecalculatingScore ? 'not-allowed' : 'pointer',
              opacity: isRecalculatingScore ? 0.85 : 1,
              color: '#ffffff',
              marginBottom: 10,
            }}
          >
            {isRecalculatingScore ? 'Recalculating...' : 'Recalculate Score'}
          </button>

          <button
            onClick={handleGenerateOffer}
            disabled={isGeneratingOffer}
            style={{
              width: '100%',
              padding: 14,
              background: '#22c55e',
              border: 'none',
              borderRadius: 14,
              fontWeight: 600,
              fontSize: 14,
              cursor: isGeneratingOffer ? 'not-allowed' : 'pointer',
              opacity: isGeneratingOffer ? 0.85 : 1,
              color: '#ffffff',
            }}
          >
            {isGeneratingOffer ? 'Generating Offer...' : '+ Discount New Invoice'}
          </button>

          {offerFeedback && (
            <p style={{ marginTop: 10, fontSize: 12, color: '#d1fae5' }}>
              {offerFeedback}
            </p>
          )}
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
            <span
              onClick={() => navigate('/invoices')}
              style={{ fontSize: 15, color: '#6b7280', cursor: 'pointer', ':hover': { color: '#111827' } }}
            >
              View All
            </span>
          </div>

          {pendingInvoices.length === 0 && !isBusinessLoading && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 14,
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                color: '#6b7280',
                fontSize: 14,
              }}
            >
              No pending invoices found.
            </div>
          )}

          {pendingInvoices.map((invoice, index) => {
            const statusStyles = getStatusStyles(invoice.status);
            const dueDate = invoice?.due_date
              ? new Date(invoice.due_date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : '-';

            return (
            <div
              key={index}
              onClick={() => {
                localStorage.setItem('selectedInvoiceId', invoice.id);
                navigate('/invoices');
              }}
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 14,
                boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <strong>{invoice.invoice_number || invoice.id}</strong>
                <strong>{formatCurrency(invoice.amount)}</strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: '#6b7280' }}>
                  {dueDate}
                </span>

                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    background: statusStyles.background,
                    color: statusStyles.color,
                  }}
                >
                  {statusStyles.label}
                </span>
              </div>
            </div>
            );
          })}
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