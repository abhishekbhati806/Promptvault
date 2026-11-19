import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client.js';
import ScoreBadge from '../components/ScoreBadge.jsx';
import { getErrorMessage } from '../utils/helpers.js';

const SAMPLE_PROMPT =
  'You are a senior software engineer. Review the Python function below and return a bullet list of bugs, security issues, and performance tips. Limit your answer to 200 words. For example, flag SQL injection or O(n^2) loops.';

export default function AIScore() {
  const location = useLocation();
  const [text, setText] = useState(() => location.state?.prompt || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api
      .aiStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
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
      setResult(await api.scorePrompt({ prompt: text.trim() }));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not score the prompt. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container ai-page">
      <div className="ai-header">
        <div>
          <h1>🎯 Prompt Scorer</h1>
          <p className="muted">
            Score any prompt out of 10 with strengths, weaknesses and actionable tips.
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
          <h2>Prompt to evaluate</h2>
          <label htmlFor="score-prompt">Paste or write your prompt</label>
          <textarea
            id="score-prompt"
            rows={9}
            maxLength={4000}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError('');
            }}
            placeholder="Paste any prompt here to evaluate role clarity, structure, examples, and constraints…"
            required
          />
          <div className="sample-row">
            <span className="field-hint">{text.length}/4000 characters</span>
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                setText(SAMPLE_PROMPT);
                setError('');
              }}
            >
              Load sample prompt
            </button>
          </div>
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Scoring…' : '🎯 Score prompt'}
          </button>
        </form>

        <section className="ai-panel">
          <h2>Evaluation result</h2>
          {!result && !loading && (
            <p className="muted">
              Your quality score, grade, strengths, weaknesses and improvement tips will appear here.
            </p>
          )}
          {loading && <p className="muted">Evaluating your prompt…</p>}
          {result && (
            <>
              <div className="score-row">
                <ScoreBadge score={result.score} grade={result.grade} />
                <div className="score-meter" aria-hidden="true">
                  <div
                    className="score-meter-fill"
                    style={{ width: `${Math.min(100, Math.max(0, result.score * 10))}%` }}
                  />
                </div>
              </div>
              <div className="score-cols">
                <div className="score-col score-col-good">
                  <h4 className="score-good">✓ Strengths</h4>
                  <ul>
                    {(result.strengths || []).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="score-col score-col-bad">
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
              <div className="ai-result-actions">
                <Link
                  to="/ai/improve"
                  state={{ prompt: text.trim() }}
                  className="btn btn-primary"
                >
                  ✨ Improve this prompt →
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
