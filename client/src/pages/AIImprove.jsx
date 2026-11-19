import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client.js';
import { CATEGORIES } from '../data/categories.js';
import { useAuth } from '../context/useAuth.js';
import { copyText, getErrorMessage } from '../utils/helpers.js';

const SAMPLE_PROMPTS = [
  'Help me write a portfolio website for a computer science student',
  'Explain this Python error and fix my code',
  'Write a cold email to a startup founder about an internship',
];

export default function AIImprove() {
  const location = useLocation();
  const { user } = useAuth();

  const [text, setText] = useState(() => location.state?.prompt || '');
  const [category, setCategory] = useState(() => location.state?.category || 'general');
  const [tone, setTone] = useState('clear');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api
      .aiStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  async function handleImprove(event) {
    event.preventDefault();

    if (text.trim().length < 10) {
      setError('Please enter a prompt with at least 10 characters.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCopied(false);
    setSaved(false);

    try {
      const data = await api.improvePrompt({
        prompt: text.trim(),
        category,
        tone,
      });
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not improve the prompt. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.improved) return;
    const ok = await copyText(result.improved);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else {
      setError('Copy failed. Please select and copy the result manually.');
    }
  }

  async function handleSave() {
    if (!result?.improved || saving) return;
    setSaving(true);
    setError('');
    try {
      const snippet = text.trim().slice(0, 60);
      await api.createPrompt({
        title: `Improved: ${snippet}`,
        description: `Refined ${category} prompt in a ${tone} tone using PromptVault AI Improver.`,
        prompt: result.improved,
        category,
        tags: [category, tone, 'improved'],
      });
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save the improved prompt.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="container ai-page">
      <div className="ai-header">
        <div>
          <h1>✨ Prompt Improver</h1>
          <p className="muted">
            Turn a rough instruction into a clear, structured, reliable prompt.
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
        <form className="ai-panel" onSubmit={handleImprove}>
          <h2>Your prompt</h2>

          <label htmlFor="ai-prompt">Enter a prompt to improve</label>
          <textarea
            id="ai-prompt"
            rows={8}
            maxLength={4000}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setError('');
            }}
            placeholder="Example: Write a portfolio website for a student..."
            required
          />

          <div className="sample-row">
            <span className="field-hint">{text.length}/4000 characters</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                const next =
                  SAMPLE_PROMPTS[
                    (SAMPLE_PROMPTS.indexOf(text) + 1) % SAMPLE_PROMPTS.length
                  ];
                setText(next);
                setError('');
              }}
            >
              Try an example
            </button>
          </div>

          <div className="form-row">
            <label htmlFor="improve-category">
              Category
              <select
                id="improve-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.icon} {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label htmlFor="improve-tone">
              Tone
              <select
                id="improve-tone"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
              >
                <option value="clear">Clear</option>
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
                <option value="creative">Creative</option>
                <option value="concise">Concise</option>
              </select>
            </label>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Improving…' : '✨ Improve prompt'}
          </button>
        </form>

        <section className="ai-panel">
          <h2>Improved prompt</h2>

          {!result && !loading && (
            <p className="muted">
              Enter a prompt on the left and click <strong>Improve prompt</strong> to see the refined version and changelog here.
            </p>
          )}

          {loading && <p className="muted">Refining your prompt…</p>}

          {result && (
            <>
              <pre className="ai-result">{result.improved}</pre>

              {result.changes?.length > 0 && (
                <div className="ai-changes">
                  <h3>What changed</h3>
                  <ul>
                    {result.changes.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ai-result-actions">
                <button type="button" className="btn btn-primary" onClick={handleCopy}>
                  {copied ? '✓ Copied!' : '📋 Copy prompt'}
                </button>
                <Link
                  to="/ai/score"
                  state={{ prompt: result.improved }}
                  className="btn"
                >
                  🎯 Score it
                </Link>
                {user &&
                  (saved ? (
                    <Link to="/prompts/mine" className="btn btn-saved">
                      ✓ Saved — My Prompts
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn"
                      disabled={saving}
                      onClick={handleSave}
                    >
                      {saving ? 'Saving…' : '💾 Save to vault'}
                    </button>
                  ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
