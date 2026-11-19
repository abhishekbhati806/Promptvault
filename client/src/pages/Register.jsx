import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authRequest } from '../utils/auth.js';
import { useAuth } from '../context/useAuth.js';

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await authRequest('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/login', {
        replace: true,
        state: { message: 'Account created! Log in with your new credentials.' },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="container auth-page">
      <section className="auth-card">
        <p className="hero-badge">JOIN PROMPTVAULT</p>
        <h1>Create your account</h1>
        <p className="muted auth-description">
          Publish your own prompts and bookmark favorites across devices.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="register-name">Full name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Abhishek Bhati"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={60}
            required
          />

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="register-password">Password</label>
          <div className="password-wrap">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              maxLength={72}
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
          <p className="muted auth-hint">Use 8–72 characters.</p>

          {error && <p className="alert alert-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
