
import { useEffect, useState } from 'react';
import { api } from '../api/client.js';

const CATEGORIES = [
  { id: 'general', name: 'General' },
  { id: 'coding', name: 'Coding' },
  { id: 'web development', name: 'Web Development' },
  { id: 'business', name: 'Business' },
  { id: 'writing', name: 'Writing' },
  { id: 'education', name: 'Education' },
  { id: 'marketing', name: 'Marketing' },
];

export default function AIImprove() {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('general');
  const [tone, setTone] = useState('clear');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.aiStatus()
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

    try {
      const data = await api.improvePrompt({
        prompt: text.trim(),
        category,
        tone,
      });
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.detail
          ? typeof err.response.data.detail === 'string'
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail)
          : 'Could not improve the prompt. Check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.improved) return;

    try {
      await navigator.clipboard.writeText(result.improved);
      setCopied(true);
    } catch {
      setError('Copy failed. Please select and copy the result manually.');
    }
  }

  return (
    <main className="container ai-page">
      <h1>✨ Prompt Improver</h1>
      <p className="muted">
        Turn a basic instruction into a clearer, more useful prompt.
      </p>

      {status && (
        <p>
          <span className={`mode-pill mode-${status.mode}`}>
            {status.mode === 'openai'
              ? `Live AI (${status.model})`
              : 'Mock mode — no API key configured'}
          </span>
        </p>
      )}

      <div className="ai-grid">
        <form className="ai-panel" onSubmit={handleImprove}>
          <h2>Your prompt</h2>

          <label htmlFor="ai-prompt">Enter a prompt to improve</label>
          <textarea
            id="ai-prompt"
            rows={9}
            maxLength={4000}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Example: Write a portfolio website for a student..."
            required
          />

          <p className="muted">{text.length}/4000 characters</p>

          <div className="form-row">
            <label>
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tone
              <select
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

          {error && <div className="alert alert-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Improving...' : '✨ Improve prompt'}
          </button>
        </form>

        <section className="ai-panel">
          <h2>Improved prompt</h2>

          {!result && !loading && (
            <p className="muted">
              Your improved prompt will appear here.
            </p>
          )}

          {loading && (
            <p className="muted">Working on your prompt...</p>
          )}

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

              {result.mode && (
                <p className="muted">
                  Result generated in {result.mode} mode.
                </p>
              )}

              <button
                type="button"
                className="btn"
                onClick={handleCopy}
              >
                {copied ? '✓ Copied!' : '📋 Copy improved prompt'}
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
