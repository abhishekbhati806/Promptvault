import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { getErrorMessage } from '../utils/helpers.js';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [confirmId, setConfirmId] = useState('');

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
      setError(getErrorMessage(err, 'Could not load admin data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.adminStats(), api.adminPrompts()])
      .then(([nextStats, nextPrompts]) => {
        if (active) {
          setStats(nextStats);
          setPrompts(nextPrompts);
        }
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err, 'Could not load admin data.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
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
      setError(getErrorMessage(err, 'Could not update prompt.'));
    } finally {
      setBusyId('');
    }
  }

  async function deletePrompt(prompt) {
    setBusyId(prompt.id);
    setError('');

    try {
      await api.deleteAdminPrompt(prompt.id);
      setConfirmId('');
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not delete prompt.'));
    } finally {
      setBusyId('');
    }
  }

  return (
    <main className="container admin-page">
      <div className="my-prompts-head">
        <div>
          <h1>🛡️ Admin Panel</h1>
          <p className="muted">Moderate PromptVault prompts and review platform statistics.</p>
        </div>
        <button type="button" className="btn" onClick={loadData}>
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <p className="muted">Loading admin data…</p>
      ) : (
        <>
          <section className="admin-stats">
            <article className="dashboard-card stat-card">
              <p className="muted">Total prompts</p>
              <h2 className="stat-value">{stats?.total_prompts ?? 0}</h2>
            </article>
            <article className="dashboard-card stat-card">
              <p className="muted">Registered users</p>
              <h2 className="stat-value">{stats?.total_users ?? 0}</h2>
            </article>
            <article className="dashboard-card stat-card">
              <p className="muted">Featured prompts</p>
              <h2 className="stat-value">{stats?.featured ?? 0}</h2>
            </article>
          </section>

          <h2 style={{ marginBottom: '0.9rem' }}>Prompt moderation</h2>

          {prompts.length === 0 ? (
            <p className="muted">No prompts found.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Prompt</th>
                    <th>Category</th>
                    <th>Featured</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prompts.map((prompt) => (
                    <tr key={prompt.id}>
                      <td>{prompt.title || 'Untitled prompt'}</td>
                      <td>
                        <span className="tag">{prompt.category || 'general'}</span>
                      </td>
                      <td>{prompt.featured ? '⭐ Yes' : 'No'}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="btn btn-small"
                            disabled={busyId === prompt.id}
                            onClick={() => toggleFeature(prompt)}
                          >
                            {prompt.featured ? 'Unfeature' : 'Feature'}
                          </button>
                          {confirmId === prompt.id ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-small btn-danger"
                                disabled={busyId === prompt.id}
                                onClick={() => deletePrompt(prompt)}
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                className="btn btn-small btn-ghost"
                                onClick={() => setConfirmId('')}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-small btn-danger"
                              disabled={busyId === prompt.id}
                              onClick={() => setConfirmId(prompt.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
