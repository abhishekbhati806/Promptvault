
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [nextStats, nextPrompts] = await Promise.all([
        api.adminStats(),
        api.adminPrompts(),
      ]);

      setStats(nextStats);
      setPrompts(nextPrompts);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      try {
        const [nextStats, nextPrompts] = await Promise.all([
          api.adminStats(),
          api.adminPrompts(),
        ]);

        if (active) {
          setStats(nextStats);
          setPrompts(nextPrompts);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.detail || 'Could not load admin data.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialLoad();
    return () => {
      active = false;
    };
  }, []);

  async function toggleFeature(prompt) {
    setBusyId(prompt.id);
    setError('');

    try {
      await api.toggleFeature(prompt.id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not update prompt.');
    } finally {
      setBusyId('');
    }
  }

  async function deletePrompt(prompt) {
    if (!window.confirm(`Delete "${prompt.title}" permanently?`)) return;

    setBusyId(prompt.id);
    setError('');

    try {
      await api.deleteAdminPrompt(prompt.id);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not delete prompt.');
    } finally {
      setBusyId('');
    }
  }

  return (
    <main className="container page-section admin-page">
      <h1>Admin Panel</h1>
      <p className="muted">Manage PromptVault prompts and review platform statistics.</p>

      {error && <p role="alert" className="admin-error">{error}</p>}

      {loading ? (
        <p>Loading admin data...</p>
      ) : (
        <>
          <section className="admin-stats">
            <article className="dashboard-card">
              <h3>Total prompts</h3>
              <p>{stats?.total_prompts ?? 0}</p>
            </article>
            <article className="dashboard-card">
              <h3>Registered users</h3>
              <p>{stats?.total_users ?? 0}</p>
            </article>
            <article className="dashboard-card">
              <h3>Featured prompts</h3>
              <p>{stats?.featured ?? 0}</p>
            </article>
          </section>

          <h2>Prompt moderation</h2>

          {prompts.length === 0 ? (
            <p>No prompts found.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Prompt</th>
                    <th>Category</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.map((prompt) => (
                    <tr key={prompt.id}>
                      <td>{prompt.title || 'Untitled prompt'}</td>
                      <td>{prompt.category || 'General'}</td>
                      <td>{prompt.featured ? 'Yes' : 'No'}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="btn btn-small"
                            disabled={busyId === prompt.id}
                            onClick={() => toggleFeature(prompt)}
                          >
                            {prompt.featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-small"
                            disabled={busyId === prompt.id}
                            onClick={() => deletePrompt(prompt)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2>Prompts by category</h2>
          <ul>
            {(stats?.by_category || []).map((item) => (
              <li key={item.category}>
                {item.category}: {item.count}
              </li>
            ))}
          </ul>

          <button type="button" className="btn" onClick={loadData}>
            Refresh data
          </button>
        </>
      )}
    </main>
  );
}
