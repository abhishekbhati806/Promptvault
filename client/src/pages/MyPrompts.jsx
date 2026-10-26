import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { formatDate } from '../utils/helpers.js';

export default function MyPrompts() {
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setMine(await api.getMyPrompts());
      setError('');
    } catch {
      setError('Could not load your prompts. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (id) => {
    if (!window.confirm('Delete this prompt permanently?')) return;
    try {
      await api.deletePrompt(id);
      setMine((list) => list.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || 'Delete failed.');
    }
  };

  return (
    <main className="container my-prompts">
      <div className="my-prompts-head">
        <div>
          <h1>📝 My prompts</h1>
          <p className="muted">Edit or delete the prompts you published.</p>
        </div>
        <Link to="/prompts/new" className="btn btn-primary">
          + New prompt
        </Link>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !error && mine.length === 0 && (
        <p className="muted">
          You have not published any prompts yet.{' '}
          <Link to="/prompts/new">Create your first one →</Link>
        </p>
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
                <th></th>
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
                  <td>❤ {p.likes}</td>
                  <td className="muted">{formatDate(p.created_at)}</td>
                  <td className="row-actions">
                    <Link to={`/prompts/${p.id}/edit`} className="btn btn-small">
                      Edit
                    </Link>
                    <button type="button" className="btn btn-small btn-danger" onClick={() => remove(p.id)}>
                      Delete
                    </button>
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
