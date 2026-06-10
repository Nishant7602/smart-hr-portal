import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, background: 'rgba(255,255,255,.15)', borderRadius: 14,
            display: 'grid', placeItems: 'center', fontSize: 26, margin: '0 auto 12px'
          }}>🏢</div>
          <div style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{title}</div>
          <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, marginTop: 4 }}>{subtitle}</div>
        </div>
        <div style={{
          background: 'white', borderRadius: 14, padding: 32, boxShadow: '0 25px 50px rgba(0,0,0,.25)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const ok = await login(form.email, form.password);
    if (ok) navigate('/dashboard');
  };

  const fill = (email, pw) => setForm({ email, password: pw });

  return (
    <AuthLayout title="SmartHR Portal" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email}
            onChange={set('email')} placeholder="you@company.com" />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={form.password}
            onChange={set('password')} placeholder="••••••••" />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        {/* Demo credentials */}
        <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12, fontSize: 12 }}>
          <div style={{ fontWeight: 600, color: 'var(--gray-600)', marginBottom: 6 }}>Demo Credentials</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button type="button" className="btn btn-ghost btn-sm"
              onClick={() => fill('admin@hrportal.com', 'admin123')}
              style={{ justifyContent: 'flex-start', fontSize: 12 }}>
              👑 HR Admin — admin@hrportal.com / admin123
            </button>
            <button type="button" className="btn btn-ghost btn-sm"
              onClick={() => fill('recruiter@hrportal.com', 'recruiter123')}
              style={{ justifyContent: 'flex-start', fontSize: 12 }}>
              🔍 Recruiter — recruiter@hrportal.com / recruiter123
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-500)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)' }}>Register</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'RECRUITER' });
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const ok = await register(form);
    if (ok) navigate('/dashboard');
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the SmartHR Portal">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-grid form-grid-2">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-input" value={form.firstName} onChange={set('firstName')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-input" value={form.lastName} onChange={set('lastName')} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={set('email')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" value={form.password} onChange={set('password')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <select className="form-select" value={form.role} onChange={set('role')}>
            <option value="RECRUITER">Recruiter</option>
            <option value="HR_ADMIN">HR Admin</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}
          style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
          {loading ? 'Creating…' : 'Create Account'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-500)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
