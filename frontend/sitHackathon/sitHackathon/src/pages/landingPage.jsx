'use client';

import { motion } from 'framer-motion';

export default function LandingPage() {
  const steps = [
    {
      title: 'Connect GST Portal',
      desc: 'Securely fetch invoice and transaction data directly from GST systems. No manual uploads required.',
    },
    {
      title: 'AI Risk Assessment',
      desc: 'Our engine evaluates repayment history, invoice quality and credit profile in minutes.',
    },
    {
      title: 'Instant Disbursement',
      desc: 'Once approved, funds are credited to your registered bank account within 24–48 hours.',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#111827',
        background: '#ffffff',
      }}
    >
      {/* NAVBAR */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ fontWeight: 700 }}>FinFlow</h2>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <a href="#how" style={{ fontSize: 14 }}>How it Works</a>
          <a href="/login">
            <button
              style={{
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid #111827',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          </a>
        </div>
      </div>

      {/* HERO */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '100px 20px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 60,
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Unlock Instant
            <br />
            Invoice Financing
          </h1>

          <p
            style={{
              fontSize: 18,
              color: '#6b7280',
              marginBottom: 30,
              maxWidth: 500,
            }}
          >
            Convert unpaid invoices into working capital within minutes using AI-driven risk evaluation and secure GST integration.
          </p>

          <a href="/login">
            <button
              style={{
                padding: '16px 28px',
                borderRadius: 14,
                border: 'none',
                background: '#111827',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              Get Started
            </button>
          </a>
        </div>

        {/* HERO CARD MOCKUP */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'linear-gradient(135deg,#1e293b,#0f172a)',
            borderRadius: 24,
            padding: 30,
            color: '#ffffff',
            boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
          }}
        >
          <p style={{ opacity: 0.8 }}>Total Credit Limit</p>
          <h2 style={{ fontSize: 32, margin: '10px 0' }}>
            ₹25,00,000
          </h2>

          <p style={{ opacity: 0.8 }}>Available</p>
          <h3 style={{ color: '#22c55e', fontSize: 24 }}>
            ₹18,45,000
          </h3>
        </motion.div>
      </div>

      {/* TRUST STRIP */}
      <div
        style={{
          background: '#f9fafb',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: 14,
        }}
      >
        Trusted by 500+ MSMEs • ₹50Cr+ financed • 98% On-time repayment rate
      </div>

      {/* HOW IT WORKS (Animated Vertical Flow) */}
      <section
        id="how"
        style={{
          padding: '120px 20px',
          background: '#ffffff',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{
              textAlign: 'center',
              fontSize: 40,
              fontWeight: 700,
              marginBottom: 100,
            }}
          >
            How It Works
          </motion.h2>

          <div style={{ position: 'relative', paddingLeft: 50 }}>
            {/* Animated Line */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              transition={{ duration: 1.2 }}
              viewport={{ once: true }}
              style={{
                position: 'absolute',
                left: 20,
                top: 0,
                width: 3,
                background: '#111827',
                borderRadius: 999,
              }}
            />

            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.3,
                }}
                viewport={{ once: true }}
                style={{
                  position: 'relative',
                  marginBottom: 100,
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    position: 'absolute',
                    left: -38,
                    top: 5,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#111827',
                    boxShadow: '0 0 0 6px #ffffff',
                  }}
                />

                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontSize: 16,
                    color: '#6b7280',
                    lineHeight: 1.6,
                    maxWidth: 600,
                  }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <div
        style={{
          background: '#f9fafb',
          padding: '100px 20px',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 60,
            }}
          >
            Why Choose FinFlow?
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))',
              gap: 30,
            }}
          >
            {[
              'AI-based credit scoring',
              'Up to 85% invoice financing',
              'Secure GST integration',
              'Transparent pricing',
              'Fast approval in minutes',
              'Bank-grade security',
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  padding: 30,
                  borderRadius: 20,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                }}
              >
                <h3 style={{ marginBottom: 10 }}>{item}</h3>
                <p style={{ color: '#6b7280' }}>
                  Designed to help businesses unlock liquidity efficiently and securely.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div
        style={{
          padding: '120px 20px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: 36, fontWeight: 700 }}>
          Ready to unlock working capital?
        </h2>

        <p
          style={{
            color: '#6b7280',
            marginTop: 10,
            marginBottom: 40,
          }}
        >
          Join hundreds of businesses financing smarter.
        </p>

        <a href="/login">
          <button
            style={{
              padding: '18px 36px',
              borderRadius: 14,
              border: 'none',
              background: '#111827',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            Start Financing
          </button>
        </a>
      </div>

      {/* FOOTER */}
      <div
        style={{
          background: '#111827',
          color: '#ffffff',
          padding: 50,
          textAlign: 'center',
          fontSize: 14,
        }}
      >
        © 2026 FinFlow. All rights reserved.
      </div>
    </div>
  );
}