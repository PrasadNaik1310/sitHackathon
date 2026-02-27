'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoicesApi } from '../lib/api';
import { useMaterialIcons } from '../lib/hooks/useMaterialIcons';

export default function InvoicesPage() {
  useMaterialIcons();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    invoice_number: '',
    amount: '',
    due_date: '',
    delay_days: 0,
  });

  const navItems = [
    { label: 'Home', icon: 'home', path: '/dashboard' },
    { label: 'Invoices', icon: 'description', path: '/invoices' },
    { label: 'Loans', icon: 'credit_card', path: '/loan' },
    { label: 'Profile', icon: 'person', path: '/dashboard' },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  const selectedInvoiceId = useMemo(() => localStorage.getItem('selectedInvoiceId') || '', []);

  const loadInvoices = async () => {
    setLoading(true);
    setError('');

    try {
      const list = await invoicesApi.listMyInvoices();
      setInvoices(Array.isArray(list) ? list : []);

      if (selectedInvoiceId) {
        try {
          const detail = await invoicesApi.getInvoice(selectedInvoiceId);
          setSelectedInvoice(detail);
        } catch {
          setSelectedInvoice(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleFetchDetail = async (invoiceId) => {
    if (!invoiceId) return;
    setError('');

    try {
      const detail = await invoicesApi.getInvoice(invoiceId);
      setSelectedInvoice(detail);
      localStorage.setItem('selectedInvoiceId', invoiceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch invoice detail.');
    }
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.invoice_number.trim() || !form.amount || !form.due_date) {
      setError('Invoice number, amount and due date are required.');
      return;
    }

    setAdding(true);

    try {
      const created = await invoicesApi.addInvoice({
        invoice_number: form.invoice_number.trim(),
        amount: Number(form.amount),
        due_date: `${form.due_date}T00:00:00Z`,
        delay_days: Number(form.delay_days || 0),
      });

      setMessage(`Invoice ${created.invoice_number} added successfully.`);
      setForm({ invoice_number: '', amount: '', due_date: '', delay_days: 0 });
      await loadInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add invoice.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0eaeae1', display: 'flex', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '20px 16px 100px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>←</span>
          <h2 style={{ margin: 0, fontSize: 20 }}>Invoices</h2>
          <span />
        </div>

        {(error || message) && (
          <p style={{ color: error ? '#dc2626' : '#166534', fontSize: 12, marginBottom: 12 }}>
            {error || message}
          </p>
        )}

        <div style={{ background: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 18, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Add Invoice</h3>
          <form onSubmit={handleAddInvoice}>
            <input placeholder="Invoice Number" value={form.invoice_number} onChange={(e) => setForm((p) => ({ ...p, invoice_number: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginBottom: 8 }} />
            <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginBottom: 8 }} />
            <input type="date" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginBottom: 8 }} />
            <input type="number" placeholder="Delay Days" value={form.delay_days} onChange={(e) => setForm((p) => ({ ...p, delay_days: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 10, border: '1px solid #d1d5db', marginBottom: 10 }} />
            <button disabled={adding} style={{ width: '100%', padding: 11, borderRadius: 10, border: 'none', background: '#111827', color: '#fff', cursor: adding ? 'not-allowed' : 'pointer' }}>
              {adding ? 'Adding...' : 'Add Invoice'}
            </button>
          </form>
        </div>

        <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>My Invoices</h3>
          {loading && <span style={{ fontSize: 12, color: '#6b7280' }}>Loading...</span>}
        </div>

        {invoices.map((invoice) => (
          <div key={invoice.id} style={{ background: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{invoice.invoice_number}</strong>
              <strong>{formatCurrency(invoice.amount)}</strong>
            </div>
            <p style={{ margin: '6px 0', fontSize: 12, color: '#6b7280' }}>{new Date(invoice.due_date).toLocaleDateString('en-IN')}</p>
            <button onClick={() => handleFetchDetail(invoice.id)} style={{ border: 'none', background: '#e5e7eb', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
              View Detail
            </button>
          </div>
        ))}

        {selectedInvoice && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 16, marginTop: 10, boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, fontSize: 15 }}>Selected Invoice Detail</h3>
            <p style={{ fontSize: 13, margin: '4px 0' }}><strong>ID:</strong> {selectedInvoice.id}</p>
            <p style={{ fontSize: 13, margin: '4px 0' }}><strong>Number:</strong> {selectedInvoice.invoice_number}</p>
            <p style={{ fontSize: 13, margin: '4px 0' }}><strong>Status:</strong> {selectedInvoice.status}</p>
            <p style={{ fontSize: 13, margin: '4px 0' }}><strong>Amount:</strong> {formatCurrency(selectedInvoice.amount)}</p>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-around', padding: '10px 0', maxWidth: 420, margin: '0 auto' }}>
        {navItems.map((item, i) => (
          <div key={i} onClick={() => navigate(item.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: 12, color: i === 1 ? '#111827' : '#6b7280', cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, lineHeight: 1, fontVariationSettings: "'wght' 100" }}>
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
