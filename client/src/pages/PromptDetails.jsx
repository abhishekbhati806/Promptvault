import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PROMPTS } from '../data/prompts.js';
import { categoryMeta } from '../data/categories.js';

export default function PromptDetails() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const prompt = PROMPTS.find((p) => p.id === id);

  if (!prompt) {
    return (
      <main className="container page-loading">
        <h1>Prompt not found</h1>
        <p className="muted">This prompt does not exist (yet).</p>
        <Link to="/" className="btn">
          ← Back to home
        </Link>
      </main>
    );
  }

  const meta = categoryMeta(prompt.category);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <main className="container details">
      <Link to="/" className="back-link">
        ← Back to vault
      </Link>

      <div className="details-head">
        <div>
          <div className="details-tags">
            <span className="tag">
              {meta.icon} {meta.name}
            </span>
            <span className="tag tag-alt">{prompt.difficulty}</span>
            <span className="tag tag-alt">❤ {prompt.likes}</span>
          </div>
          <h1 className="details-title">{prompt.title}</h1>
          <p className="muted details-meta">
            by <strong>{prompt.author}</strong> · {new Date(prompt.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className="btn btn-primary" onClick={copy}>
          {copied ? '✓ Copied!' : '📋 Copy prompt'}
        </button>
      </div>

      <p className="details-desc">{prompt.description}</p>

      <pre className="details-prompt">{prompt.prompt}</pre>

      {(prompt.tags || []).length > 0 && (
        <div className="details-tags">
          {prompt.tags.map((t) => (
            <span key={t} className="tag">
              #{t}
            </span>
          ))}
        </div>
      )}
    </main>
  );
}
