import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authRequest } from '../utils/auth.js';
import { useAuth } from '../context/useAuth.js';

function getSafeRedirectPath(candidate) {
  if (typeof candidate !== 'string') return '/dashboard';
  const trimmed = candidate.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return '/dashboard';
  }
  return trimmed;
}

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const infoMessage = location.state?.message || '';

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const result = await authRequest('/api/auth/login', {
        email: email.trim(),
        password,
      });

      login(result.access_token, result.user);
      navigate(getSafeRedirectPath(location.state?.from), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container auth-page">
      <section className="auth-card">
        <p className="hero-badge">WELCOME BACK</p>
        <h1>Log in to PromptVault</h1>
        <p className="muted auth-description">
          Access your saved favorites, published prompts, and dashboard.
        </p>

        {infoMessage && !error && (
          <div className="alert alert-success" role="status">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <div className="password-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && <p className="alert alert-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/register">Create one free</Link>
        </p>
      </section>
    </main>
  );
}
