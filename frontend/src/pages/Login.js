import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password);
      navigate(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  const demoAccounts = [
    { label: 'Admin',   email: 'admin@company.com', password: 'admin123'   },
    { label: 'Trainer', email: 'riya@company.com',  password: 'trainer123' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '20px',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:none; } }
        .login-card { animation: fadeUp 0.5s ease both; }
        .input-field:focus { border-color: rgba(255,255,255,0.35) !important; outline: none; }
        .input-field { transition: border-color 0.2s; }
        .demo-btn:hover { border-color: rgba(255,255,255,0.2) !important; color: #ccc !important; background: rgba(255,255,255,0.06) !important; }
        @media (max-width: 480px) {
          .login-inner { padding: 28px 20px !important; }
          .login-logo img { width: 52px !important; height: 52px !important; }
        }
      `}</style>

      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo area */}
        <div className="login-logo" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <img
              src="/mits_logo.png"
              alt="MITS Logo"
              style={{ width: 64, height: 64, objectFit: 'contain' }}
              onError={e => {
                e.target.style.display = 'none';
                document.getElementById('logo-fallback').style.display = 'flex';
              }}
            />
            <div id="logo-fallback" style={{
              display: 'none', width: 64, height: 64,
              background: '#fff', borderRadius: 12,
              alignItems: 'center', justifyContent: 'center',
              color: '#000', fontWeight: 900, fontSize: 24,
            }}>M</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>TrainerTrack</div>
              <div style={{ color: '#444', fontSize: 12, marginTop: 3 }}>Slot-wise task management for trainers</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="login-card" style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: 36,
          boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
        }}>
          <div className="login-inner">
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Welcome back</h2>
            <p style={{ color: '#555', fontSize: 13, margin: '0 0 24px' }}>Sign in to your account</p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', color: '#555', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Email
                </label>
                <input
                  className="input-field"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, color: '#fff', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', color: '#555', fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Password
                </label>
                <input
                  className="input-field"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '11px 14px',
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8, color: '#fff', fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8, padding: '10px 14px',
                  color: '#f87171', fontSize: 13, marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '12px',
                  background: loading ? '#1a1a1a' : '#fff',
                  border: 'none', borderRadius: 8,
                  color: loading ? '#444' : '#000',
                  fontSize: 14, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.01em',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{ marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
              <p style={{ color: '#333', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 10, marginTop: 0 }}>
                Demo Accounts
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {demoAccounts.map(acc => (
                  <button
                    key={acc.label}
                    className="demo-btn"
                    onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                    style={{
                      flex: 1, padding: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6, color: '#444', fontSize: 12, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
