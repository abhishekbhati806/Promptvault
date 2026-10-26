import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { CATEGORIES } from '../data/categories.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AIGenerate() {
  const { user } = useAuth();
  const [form, setForm] = useState({ topic: '', category: 'general', style: 'step-by-step' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.aiStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const run = async (e) => {
    e.preventDefault();
    if (form.topic.trim().length < 3) {
      setError('Give me a topic first (at least 3 characters).');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);
    try {
      setResult(await api.generatePrompt(form));
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate a prompt. Is the API running?');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      await api.createPrompt({
        title: result.title,
        description: result.description,
        prompt: result.prompt,
        category: result.category || form.category,
        tags: result.tags || [],
      });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save the prompt.');
    }
  };

  return (
    <main className="container ai-page">
      <h1>🧪 Prompt Generator</h1>
      <p className="muted">
        Tell it what you want and get a ready-to-use prompt.
        {status && (
          <span className={`mode-pill mode-${status.mode}`}>
            {status.mode === 'openai' ? `Live AI (${status.model})` : 'Mock mode — no API key set'}
          </span>
        )}
      </p>

      <div className="ai-grid">
        <form className="ai-panel" onSubmit={run}>
          <h3>What should it do?</h3>
          <label>
            Topic
            <input
              value={form.topic}
              onChange={set('topic')}
              placeholder="e.g. preparing for a Python interview"
            />
          </label>
          <div className="form-row">
            <label>
              Category
              <select value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Style
              <select value={form.style} onChange={set('style')}>
                <option value="step-by-step">Step-by-step</option>
                <option value="checklist">Checklist</option>
                <option value="creative">Creative</option>
                <option value="analytical">Analytical</option>
                <option value="role-play">Role-play</option>
              </select>
            </label>
          </div>
          {error && !result && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating…' : '🧪 Generate prompt'}
          </button>
        </form>

        <div className="ai-panel">
          <h3>Generated prompt</h3>
          {!result && !loading && <p className="muted">Your new prompt will appear here.</p>}
          {loading && <p className="muted">Writing your prompt…</p>}
          {result && (
            <>
              <h3 className="ai-result-title">{result.title}</h3>
              <p className="muted ai-result-desc">{result.description}</p>
              <pre className="ai-result">{result.prompt}</pre>
              {(result.tags || []).length > 0 && (
                <div className="prompt-card-tags">
                  {result.tags.map((t) => (
                    <span key={t} className="mini-tag">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              {error && <div className="alert alert-error">{error}</div>}
              <div className="ai-result-actions">
                {user ? (
                  saved ? (
                    <Link to="/prompts/mine" className="btn">
                      ✓ Saved — view My prompts
                    </Link>
                  ) : (
                    <button className="btn" onClick={save}>
                      💾 Save to vault
                    </button>
                  )
                ) : (
                  <span className="muted">
                    <Link to="/register">Create an account</Link> to save this prompt.
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
