import { Link } from 'react-router-dom';

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
      <div className="prompt-card-foot">
        <span className="muted">by {prompt.author}</span>
        <Link to={`/prompts/${prompt.id}`} className="card-link">
          View →
        </Link>
      </div>
    </article>
  );
}
