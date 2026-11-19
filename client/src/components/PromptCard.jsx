import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { categoryMeta } from '../data/categories.js';
import { copyText, formatDate } from '../utils/helpers.js';

export default function PromptCard({ prompt, onLiked }) {
  const [localLikes, setLocalLikes] = useState(null);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [copied, setCopied] = useState(false);

  const likes = localLikes ?? prompt.likes ?? 0;
  const meta = categoryMeta(prompt.category);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await api.likePrompt(prompt.id);
      const nextLikes = res?.likes ?? likes + 1;
      setLocalLikes(nextLikes);
      setLiked(true);
      onLiked?.(prompt.id, nextLikes);
    } catch {
      /* keep current count if offline */
    } finally {
      setLiking(false);
    }
  };

  const handleCopy = async () => {
    const ok = await copyText(prompt.prompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <article className="prompt-card">
      <div className="prompt-card-top">
        <span className="tag">
          <span aria-hidden="true">{meta.icon}</span> {meta.name}
        </span>
        <button
          type="button"
          className={`like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={liking}
          aria-label={`Like ${prompt.title} (${likes} likes)`}
          title="Like this prompt"
        >
          ❤ {likes}
        </button>
      </div>
      <h3>
        <Link to={`/prompts/${prompt.id}`} className="prompt-card-title-link">
          {prompt.title}
        </Link>
      </h3>
      <p className="prompt-card-desc">{prompt.description}</p>
      <pre className="prompt-card-text">{prompt.prompt}</pre>
      {(prompt.tags || []).length > 0 && (
        <div className="prompt-card-tags">
          {prompt.tags.slice(0, 3).map((t) => (
            <span key={t} className="mini-tag">
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="prompt-card-foot">
        <span className="muted card-author">
          by {prompt.author}
          {prompt.created_at ? ` · ${formatDate(prompt.created_at)}` : ''}
        </span>
        <div className="card-actions">
          <button
            type="button"
            className={`card-copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            aria-label={`Copy ${prompt.title}`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <Link to={`/prompts/${prompt.id}`} className="card-link">
            View →
          </Link>
        </div>
      </div>
    </article>
  );
}
