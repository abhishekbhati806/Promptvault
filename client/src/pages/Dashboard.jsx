import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/useAuth.js';
import { getErrorMessage } from '../utils/helpers.js';

function StatCard({ icon, label, value, description }) {
  return (
    <article className="dashboard-card stat-card">
      <span className="dashboard-icon" aria-hidden="true">{icon}</span>
      <p className="muted">{label}</p>
      <h2 className="stat-value">{value ?? 0}</h2>
      <p className="muted stat-desc">{description}</p>
    </article>
  );
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const [dashData, favData] = await Promise.all([
        api.getDashboard(),
        api.getFavorites().catch(() => []),
      ]);
      setStats(dashData);
      setFavorites(Array.isArray(favData) ? favData : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load dashboard statistics.'));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    Promise.all([api.getDashboard(), api.getFavorites().catch(() => [])])
      .then(([dashData, favData]) => {
        if (active) {
          setStats(dashData);
          setFavorites(Array.isArray(favData) ? favData : []);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Unable to load dashboard statistics.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const handleUnfavorite = async (id) => {
    try {
      await api.removeFavorite(id);
      setFavorites((list) => list.filter((p) => p.id !== id));
      setStats((prev) =>
        prev
          ? { ...prev, my_favorites: Math.max(0, (prev.my_favorites || 1) - 1) }
          : prev
      );
    } catch {
      /* ignore */
    }
  };

  const categories = stats?.top_categories ?? [];
  const recentPrompts = stats?.recent_prompts ?? [];

  return (
    <main className="container dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="hero-badge">YOUR WORKSPACE</p>
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p className="muted">
            Your prompts, saved favorites, and community library overview.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/prompts/new" className="btn btn-primary">
            + Create prompt
          </Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </section>

      <section className="dashboard-grid dashboard-stats-row">
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

      {error && (
        <section className="dashboard-card" role="alert">
          <h2>Dashboard unavailable</h2>
          <p className="muted">{error}</p>
          <button type="button" className="btn btn-primary" onClick={loadDashboard}>
            Try again
          </button>
        </section>
      )}

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <span className="dashboard-icon" aria-hidden="true">👤</span>
          <h2>Account details</h2>
          <p className="muted">Name: {user?.name || 'Not available'}</p>
          <p className="muted">Email: {user?.email || 'Not available'}</p>
          <div className="card-btn-row">
            <Link to="/prompts/mine" className="btn btn-small">
              Manage my prompts
            </Link>
          </div>
        </article>

        <article className="dashboard-card">
          <span className="dashboard-icon" aria-hidden="true">🚀</span>
          <h2>Explore &amp; build</h2>
          <p className="muted">
            Browse community prompts or craft new ones with AI Studio.
          </p>
          <div className="card-btn-row">
            <Link to="/#prompts" className="btn btn-small btn-primary">
              Explore prompts
            </Link>
            <Link to="/ai/generate" className="btn btn-small">
              AI Generator
            </Link>
          </div>
        </article>
      </section>

      <section className="dashboard-card">
        <h2>⭐ Saved favorites</h2>
        <p className="muted">Prompts you bookmarked for quick access.</p>

        {loading ? (
          <p className="muted" style={{ marginTop: '0.75rem' }}>Loading favorites…</p>
        ) : favorites.length > 0 ? (
          <div className="recent-list">
            {favorites.map((prompt) => (
              <article key={prompt.id} className="recent-row">
                <div>
                  <h3>
                    <Link to={`/prompts/${prompt.id}`} className="row-title">
                      {prompt.title}
                    </Link>
                  </h3>
                  <p className="muted">
                    {prompt.category || 'general'} · ❤️ {prompt.likes ?? 0}
                  </p>
                </div>
                <div className="row-actions">
                  <Link to={`/prompts/${prompt.id}`} className="btn btn-small">
                    View
                  </Link>
                  <button
                    type="button"
                    className="btn btn-small btn-ghost"
                    onClick={() => handleUnfavorite(prompt.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted" style={{ marginTop: '0.75rem' }}>
            No saved favorites yet. Open any prompt and click <strong>☆ Save</strong> to bookmark it here.
          </p>
        )}
      </section>

      <section className="dashboard-card">
        <h2>Popular categories</h2>
        <p className="muted">Click a category to browse matching prompts.</p>

        {loading ? (
          <p className="muted" style={{ marginTop: '0.75rem' }}>Loading categories…</p>
        ) : categories.length > 0 ? (
          <div className="dashboard-grid">
            {categories.map((item) => (
              <Link
                to={`/?category=${encodeURIComponent(item.category)}#prompts`}
                className="dashboard-card dash-cat-link"
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
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">No category data available yet.</p>
        )}
      </section>

      <section className="dashboard-card">
        <h2>Recent prompts</h2>
        <p className="muted">Latest prompts added to the PromptVault library.</p>

        {loading ? (
          <p className="muted" style={{ marginTop: '0.75rem' }}>Loading recent prompts…</p>
        ) : recentPrompts.length > 0 ? (
          <div className="recent-list">
            {recentPrompts.map((prompt) => (
              <article key={prompt.id} className="recent-row">
                <div>
                  <h3>
                    <Link to={`/prompts/${prompt.id}`} className="row-title">
                      {prompt.title || 'Untitled prompt'}
                    </Link>
                  </h3>
                  <p className="muted">
                    {prompt.category || 'General'} · ❤️ {prompt.likes ?? 0}
                  </p>
                </div>
                {prompt.id && (
                  <Link to={`/prompts/${prompt.id}`} className="btn btn-small">
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
