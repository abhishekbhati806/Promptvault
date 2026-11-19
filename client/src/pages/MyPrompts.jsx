import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { formatDate, getErrorMessage } from '../utils/helpers.js';

export default function MyPrompts() {
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      try {
        setMine(await api.getMyPrompts());
        setError('');
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, 'Could not load your prompts.'));
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

  const remove = async (id) => {
    setDeletingId(id);
    setError('');
    try {
      await api.deletePrompt(id);
      setMine((list) => list.filter((p) => p.id !== id));
      setConfirmId(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Delete failed. Please try again.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container my-prompts">
      <div className="my-prompts-head">
        <div>
          <h1>📝 My Prompts</h1>
          <p className="muted">View, edit or remove the prompts you published.</p>
        </div>
        <Link to="/prompts/new" className="btn btn-primary">
          + New prompt
        </Link>
      </div>

      {loading && <p className="muted">Loading your prompts…</p>}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && mine.length === 0 && (
        <div className="empty-card">
          <h3>No prompts published yet</h3>
          <p className="muted">
            Share your best prompt with the community or generate one with AI Studio.
          </p>
          <div className="card-btn-row">
            <Link to="/prompts/new" className="btn btn-primary">
              + Create your first prompt
            </Link>
            <Link to="/ai/generate" className="btn">
              🧪 Generate with AI
            </Link>
          </div>
        </div>
      )}

      {!loading && mine.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Likes</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/prompts/${p.id}`} className="row-title">
                      {p.title}
                    </Link>
                  </td>
                  <td>
                    <span className="tag">{p.category}</span>
                  </td>
                  <td>❤ {p.likes ?? 0}</td>
                  <td className="muted">{formatDate(p.created_at)}</td>
                  <td>
                    <div className="row-actions">
                      {confirmId === p.id ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-small btn-danger"
                            disabled={deletingId === p.id}
                            onClick={() => remove(p.id)}
                          >
                            {deletingId === p.id ? 'Deleting…' : 'Confirm delete'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-small btn-ghost"
                            onClick={() => setConfirmId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to={`/prompts/${p.id}/edit`} className="btn btn-small">
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn btn-small btn-danger"
                            onClick={() => setConfirmId(p.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
