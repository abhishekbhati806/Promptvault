
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

const API_BASE = 'http://localhost:8000';

function StatCard({ icon, label, value, description }) {
  return (
    <article className="dashboard-card">
      <span className="dashboard-icon">{icon}</span>
      <p className="muted">{label}</p>
      <h2>{value ?? 0}</h2>
      <p className="muted">{description}</p>
    </article>
  );
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    const controller = new AbortController();

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE}/api/stats/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Your session has expired. Please log in again.'
              : `Could not load dashboard (HTTP ${response.status}).`
          );
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load dashboard statistics.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, [token]);

  const categories = stats?.top_categories ?? [];
  const recentPrompts = stats?.recent_prompts ?? [];

  return (
    <main className="container dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="hero-badge">YOUR WORKSPACE</p>
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p className="muted">
            Your prompts, activity, and workspace overview.
          </p>
        </div>

        <button className="btn btn-ghost" onClick={logout}>
          Log out
        </button>
      </section>

      <section className="dashboard-grid">
        <StatCard
          icon="📚"
          label="Library prompts"
          value={loading ? '…' : stats?.total_prompts}
          description="Prompts in the library"
        />
        <StatCard
          icon="✍️"
          label="My prompts"
          value={loading ? '…' : stats?.my_prompts}
          description="Prompts created by you"
        />
        <StatCard
          icon="❤️"
          label="Total likes"
          value={loading ? '…' : stats?.total_likes}
          description="Likes across the library"
        />
        <StatCard
          icon="⭐"
          label="My favorites"
          value={loading ? '…' : stats?.my_favorites}
          description="Saved prompts"
        />
      </section>

      {(error || !token) && (
        <section className="dashboard-card" role="alert">
          <h2>Dashboard unavailable</h2>
          <p>{error || 'Your login session is unavailable. Please log in again.'}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </section>
      )}

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <span className="dashboard-icon">👤</span>
          <h2>Account details</h2>
          <p className="muted">Name: {user?.name || 'Not available'}</p>
          <p className="muted">Email: {user?.email || 'Not available'}</p>
        </article>

        <article className="dashboard-card">
          <span className="dashboard-icon">🚀</span>
          <h2>Explore PromptVault</h2>
          <p className="muted">
            Discover prompts and open their details.
          </p>
          <Link to="/#prompts" className="btn btn-primary">
            Explore prompts
          </Link>
        </article>
      </section>

      <section className="dashboard-card">
        <h2>Popular categories</h2>
        <p className="muted">Categories with the most prompts.</p>

        {loading ? (
          <p>Loading categories…</p>
        ) : categories.length > 0 ? (
          <div className="dashboard-grid">
            {categories.map((item) => (
              <article
                className="dashboard-card"
                key={item.category}
              >
                <h3>
                  {String(item.category || 'General')
                    .replaceAll('_', ' ')
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </h3>
                <p className="muted">
                  {item.count} {item.count === 1 ? 'prompt' : 'prompts'}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">No category data available yet.</p>
        )}
      </section>

      <section className="dashboard-card">
        <h2>Recent prompts</h2>
        <p className="muted">Recently created prompts in the library.</p>

        {loading ? (
          <p>Loading recent prompts…</p>
        ) : recentPrompts.length > 0 ? (
          <div>
            {recentPrompts.map((prompt) => (
              <article
                key={prompt.id}
                className="dashboard-card"
              >
                <h3>{prompt.title || 'Untitled prompt'}</h3>
                <p className="muted">
                  {prompt.category || 'General'} · ❤️ {prompt.likes ?? 0}
                </p>
                {prompt.id && (
                  <Link
                    to={`/prompts/${prompt.id}`}
                    className="btn btn-ghost"
                  >
                    View prompt
                  </Link>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">No recent prompts to display.</p>
        )}
      </section>
    </main>
  );
}
