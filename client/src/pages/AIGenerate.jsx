import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { CATEGORIES } from '../data/categories.js';
import { useAuth } from '../context/useAuth.js';
import { copyText, getErrorMessage } from '../utils/helpers.js';

const SAMPLE_TOPICS = [
  'System design interview prep',
  'REST API security audit',
  'Weekly study schedule planner',
];

export default function AIGenerate() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    topic: '',
    category: 'general',
    style: 'step-by-step',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api
      .aiStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const set = (key) => (e) => {
    setError('');
    setForm({ ...form, [key]: e.target.value });
  };

  const run = async (e) => {
    e.preventDefault();
    if (form.topic.trim().length < 3) {
      setError('Give a topic first (at least 3 characters).');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);
    setCopied(false);
    try {
      setResult(
        await api.generatePrompt({
          ...form,
          topic: form.topic.trim(),
        })
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Could not generate a prompt. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!result || saving) return;
    setSaving(true);
    setError('');
    try {
      const desc = (result.description || `Prompt for ${form.topic}`).slice(0, 300);
      await api.createPrompt({
        title: (result.title || 'Generated Prompt').slice(0, 120),
        description: desc.length >= 10 ? desc : `${desc} — generated with PromptVault.`,
        prompt: result.prompt,
        category: result.category || form.category,
        tags: (result.tags || []).slice(0, 10),
      });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save the prompt.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.prompt) return;
    const ok = await copyText(result.prompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <main className="container ai-page">
      <div className="ai-header">
        <div>
          <h1>🧪 Prompt Generator</h1>
          <p className="muted">
            Describe a goal or topic and get a structured, ready-to-use prompt.
          </p>
        </div>
        {status && (
          <span className={`mode-pill mode-${status.mode}`}>
            {status.mode === 'openai'
              ? `● Live AI (${status.model})`
              : '⚡ Instant Heuristic Engine'}
          </span>
        )}
      </div>

      <div className="ai-grid">
        <form className="ai-panel" onSubmit={run}>
          <h2>What should it do?</h2>

          <label htmlFor="gen-topic">
            Topic or goal
            <input
              id="gen-topic"
              type="text"
              value={form.topic}
              onChange={set('topic')}
              placeholder="e.g. preparing for a Python backend interview"
              maxLength={300}
              required
            />
          </label>

          <div className="sample-chips">
            {SAMPLE_TOPICS.map((sample) => (
              <button
                key={sample}
                type="button"
                className="sample-chip"
                onClick={() => {
                  setError('');
                  setForm((cur) => ({ ...cur, topic: sample }));
                }}
              >
                {sample}
              </button>
            ))}
          </div>

          <div className="form-row">
            <label htmlFor="gen-category">
              Category
              <select id="gen-category" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor="gen-style">
              Style
              <select id="gen-style" value={form.style} onChange={set('style')}>
                <option value="step-by-step">Step-by-step</option>
                <option value="checklist">Checklist</option>
                <option value="creative">Creative</option>
                <option value="analytical">Analytical</option>
                <option value="role-play">Role-play</option>
              </select>
            </label>
          </div>

          {error && !result && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating…' : '🧪 Generate prompt'}
          </button>
        </form>

        <section className="ai-panel">
          <h2>Generated prompt</h2>
          {!result && !loading && (
            <p className="muted">
              Pick a topic and style on the left, then click <strong>Generate prompt</strong>.
            </p>
          )}
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
              {error && (
                <div className="alert alert-error" role="alert">
                  {error}
                </div>
              )}
              <div className="ai-result-actions">
                <button type="button" className="btn btn-primary" onClick={handleCopy}>
                  {copied ? '✓ Copied!' : '📋 Copy prompt'}
                </button>
                {user ? (
                  saved ? (
                    <Link to="/prompts/mine" className="btn btn-saved">
                      ✓ Saved — view My Prompts
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn"
                      disabled={saving}
                      onClick={save}
                    >
                      {saving ? 'Saving…' : '💾 Save to vault'}
                    </button>
                  )
                ) : (
                  <Link to="/register" className="btn">
                    Sign up to save
                  </Link>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
