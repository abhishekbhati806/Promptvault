import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import ScoreBadge from '../components/ScoreBadge.jsx';

export default function AIScore() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.aiStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  const run = async (e) => {
    e.preventDefault();
    if (text.trim().length < 10) {
      setError('Paste a prompt of at least 10 characters first.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      setResult(await api.scorePrompt({ prompt: text }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not score the prompt. Is the API running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container ai-page">
      <h1>📊 Prompt Scorer</h1>
      <p className="muted">
        Get a quality score with strengths, weaknesses and concrete tips.
        {status && (
          <span className={`mode-pill mode-${status.mode}`}>
            {status.mode === 'openai' ? `Live AI (${status.model})` : 'Mock mode — no API key set'}
          </span>
        )}
      </p>

      <div className="ai-grid">
        <form className="ai-panel" onSubmit={run}>
          <h3>Prompt to score</h3>
          <textarea
            rows={9}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste any prompt here…"
          />
          {error && <div className="alert alert-error">{error}</div>}
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Scoring…' : '📊 Score prompt'}
          </button>
        </form>

        <div className="ai-panel">
          <h3>Result</h3>
          {!result && !loading && <p className="muted">Score, strengths and tips appear here.</p>}
          {loading && <p className="muted">Evaluating your prompt…</p>}
          {result && (
            <>
              <div className="score-row">
                <ScoreBadge score={result.score} grade={result.grade} />
              </div>
              <div className="score-cols">
                <div className="score-col">
                  <h4 className="score-good">✓ Strengths</h4>
                  <ul>
                    {(result.strengths || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="score-col">
                  <h4 className="score-bad">✗ Weaknesses</h4>
                  <ul>
                    {(result.weaknesses || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {(result.tips || []).length > 0 && (
                <div className="ai-changes">
                  <h4>💡 Tips to improve</h4>
                  <ul>
                    {result.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
