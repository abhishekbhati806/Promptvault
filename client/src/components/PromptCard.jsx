import { Link } from 'react-router-dom';
import { formatDate } from '../utils/helpers.js';

export default function PromptCard({ prompt }) {
  return (
    <article className="prompt-card">
      <div className="prompt-card-top">
        <span className="tag">{prompt.category}</span>
        <span className="tag tag-alt">❤ {prompt.likes}</span>
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
        <span className="muted">
          by {prompt.author} · {formatDate(prompt.created_at)}
        </span>
        <Link to={`/prompts/${prompt.id}`} className="card-link">
          View →
        </Link>
      </div>
    </article>
  );
}
