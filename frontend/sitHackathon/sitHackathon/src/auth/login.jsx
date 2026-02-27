'use client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState('signin');
  const [hoveredTab, setHoveredTab] = useState('');
  const [formData, setFormData] = useState({
    phoneNo: '',
    emailId: '',
    otp: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitHovered, setIsSubmitHovered] = useState(false);
  const [glowShadow, setGlowShadow] = useState({
    x: 0,
    y: -12,
    blur: 24,
    alpha: 0.36,
  });

  useEffect(() => {
    let frameId;
    let nextVariationAt = performance.now();

    let current = {
      x: 0,
      y: -12,
      blur: 24,
      alpha: 0.36,
    };

    let motion = {
      radiusX: 9,
      radiusY: 8,
      noiseX: 2,
      noiseY: 2,
      speedX: 0.45,
      speedY: 0.4,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseNoiseX: Math.random() * Math.PI * 2,
      phaseNoiseY: Math.random() * Math.PI * 2,
      targetBlur: 24,
      targetAlpha: 0.36,
    };

    const randomizeMotion = (now) => {
      motion = {
        radiusX: 6 + Math.random() * 8,
        radiusY: 5 + Math.random() * 8,
        noiseX: 1 + Math.random() * 3,
        noiseY: 1 + Math.random() * 3,
        speedX: 0.32 + Math.random() * 0.35,
        speedY: 0.28 + Math.random() * 0.38,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        phaseNoiseX: Math.random() * Math.PI * 2,
        phaseNoiseY: Math.random() * Math.PI * 2,
        targetBlur: 20 + Math.random() * 8,
        targetAlpha: 0.3 + Math.random() * 0.12,
      };
      nextVariationAt = now + 2400 + Math.random() * 2600;
    };

    const tick = (now) => {
      if (now >= nextVariationAt) {
        randomizeMotion(now);
      }

      const t = now / 1000;

      const desiredX =
        Math.sin(t * motion.speedX + motion.phaseX) * motion.radiusX +
        Math.sin(t * (motion.speedX * 2.35) + motion.phaseNoiseX) * motion.noiseX;

      const desiredY =
        Math.cos(t * motion.speedY + motion.phaseY) * motion.radiusY +
        Math.cos(t * (motion.speedY * 2.1) + motion.phaseNoiseY) * motion.noiseY;

      current.x += (desiredX - current.x) * 0.05;
      current.y += (desiredY - current.y) * 0.05;
      current.blur += (motion.targetBlur - current.blur) * 0.02;
      current.alpha += (motion.targetAlpha - current.alpha) * 0.02;

      setGlowShadow({
        x: Number(current.x.toFixed(1)),
        y: Number(current.y.toFixed(1)),
        blur: Number(current.blur.toFixed(1)),
        alpha: Number(current.alpha.toFixed(2)),
      });

      frameId = window.requestAnimationFrame(tick);
    };

    randomizeMotion(performance.now());
    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const onChangeField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.phoneNo.trim()) {
      setError('Please enter your mobile number.');
      return;
    }

    if (loginMode === 'signup' && !formData.emailId.trim()) {
      setError('Please enter your email for sign up.');
      return;
    }

    setIsLoading(true);

    try {
      if (loginMode === 'signin') {
        const checkResponse = await fetch('/api/auth/check-number', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: formData.phoneNo.trim(),
            loginMode: 'signin',
          }),
        });

        const checkData = await checkResponse.json();

        if (!checkResponse.ok || checkData?.exists === false) {
          setError(checkData?.message || 'Mobile number not registered. Please sign up.');
          return;
        }
      }

      const endpoint = loginMode === 'signin' ? '/api/auth/signin' : '/api/auth/signup';

      const authResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNo: formData.phoneNo.trim(),
          emailId: formData.emailId.trim(),
          otp: formData.otp.trim(),
        }),
      });

      const authData = await authResponse.json().catch(() => ({}));

      if (!authResponse.ok) {
        setError(authData?.message || 'Authentication failed. Please try again.');
        return;
      }

      setSuccessMessage(loginMode === 'signin' ? 'Login successful.' : 'Signup successful.');
      navigate('/dashboard');
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  
   
  return (
  <div
    style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '20px',
        padding: 'clamp(20px, 5vw, 32px)',
        boxShadow: `${glowShadow.x}px ${glowShadow.y}px ${glowShadow.blur}px rgba(34, 197, 94, ${glowShadow.alpha}), ${-Math.round(glowShadow.x * 0.45)}px ${-Math.round(glowShadow.y * 0.45)}px ${Math.max(12, Math.round(glowShadow.blur * 0.5))}px rgba(34, 197, 94, 0.12)`,
        transition: 'box-shadow 180ms ease-out',
        justifyContent: 'center',
      
      }}
    >
      {/* Heading */}
      <h2
        style={{
          fontSize: 'clamp(20px, 4vw, 24px)',
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        Login Securely
      </h2>

      <p
        style={{
          fontSize: 14,
          color: '#6b7280',
          marginBottom: 24,
        }}
      >
        Enter your phone number to receive a verification code.
      </p>

      {/* Toggle */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          background: 'white',
          borderRadius: 12,
          padding: 2 ,
          marginBottom: 24,
          color: 'black',
          transition: 'color 0.2s ease',
        }}
      >
        {['signin', 'signup'].map((mode) => (
          <button
            key={mode}
            type="button"
            onMouseEnter={() => setHoveredTab(mode)}
            onMouseLeave={() => setHoveredTab('')}
            onClick={() => {
              setLoginMode(mode);
              setError('');
              setSuccessMessage('');
            }}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 10px',
              border: 'none',
              borderRadius: 10,
              fontWeight: 500,
              background: loginMode === mode ? 'black' : hoveredTab === mode ? '#e5e7eb' : 'transparent',
              color: loginMode === mode ? '#ffffff' : hoveredTab === mode ? '#111827' : '#374151',
              cursor: 'pointer',
              transition: '0.4s',
              
            }}
          >
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      <form onSubmit={handleUserLogin}>
        {/* Phone */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            MOBILE NUMBER
          </label>

          <input
            type="tel"
            value={formData.phoneNo}
            onChange={(e) => onChangeField('phoneNo', e.target.value)}
            placeholder="Enter mobile number"
            disabled={isLoading}
            style={{
              width: '90%',
              padding: '14px',
              marginTop: 8,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: 15,
              outline: 'none',
            }}
          />
        </div>

        {/* Email */}
        {loginMode === 'signup' && (
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              EMAIL
            </label>

            <input
              type="email"
              value={formData.emailId}
              onChange={(e) => onChangeField('emailId', e.target.value)}
              placeholder="Enter email"
              disabled={isLoading}
              style={{
                width: '90%',
                padding: '14px',
                marginTop: 8,
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontSize: 15,
                outline: 'none',
              }}
            />
          </div>
        )}

        {/* OTP */}
        <div style={{ marginBottom: 10 }}>
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            ENTER 4-DIGIT OTP
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '10px',
              marginTop: 10,
              width: '100%',
            }}
          >
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={formData.otp[index] || ''}
                onChange={(e) => {
                  const newOtp =
                    formData.otp.substring(0, index) +
                    e.target.value +
                    formData.otp.substring(index + 1);
                  onChangeField('otp', newOtp);
                }}
                disabled={isLoading}
                style={{
                  width: '90%',
                  maxWidth: 52,
                  minWidth: 0,
                  height: 52,
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  textAlign: 'center',
                  fontSize: 'clamp(14px, 3vw, 18px)',
                  borderRadius: 10,
                  border: '1px solid black',
                  justifySelf: 'center',
                }}
              />
            ))}
          </div>
        </div>

        {/* Errors */}
        {error && (
          <p
            style={{
              color: '#dc2626',
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            {error}
          </p>
        )}

        {successMessage && (
          <p
            style={{
              color: '#16a34a',
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            {successMessage}
          </p>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          onMouseEnter={() => setIsSubmitHovered(true)}
          onMouseLeave={() => setIsSubmitHovered(false)}
          style={{
            width: '90%',
            padding: '16px',
            borderRadius: 14,
            border: 'none',
            fontSize: 15,
            fontWeight: 600,
            backgroundColor: isLoading ? '#9ca3af' : '#111827',
            color: '#ffffff',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transform: !isLoading && isSubmitHovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 180ms ease, background-color 200ms ease',
          }}
        >
          {isLoading
            ? loginMode === 'signin'
              ? 'Signing in...'
              : 'Signing up...'
            : 'Verify & Login'}
        </button>

        <p
          style={{
            fontSize: 11,
            color: '#9ca3af',
            marginTop: 18,
            textAlign: 'center',
          }}
        >
          Your data is encrypted using AES-256 standards.
        </p>
      </form>
    </div>
  </div>
);
}