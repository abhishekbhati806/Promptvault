import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authRequest } from '../utils/auth.js';
import { useAuth } from '../context/useAuth.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const result = await authRequest('/api/auth/login', {
        email,
        password,
      });

      login(result.access_token, result.user);
      navigate(location.state?.from || '/dashboard', { replace: true });
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
          Access your personal prompt workspace.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}
