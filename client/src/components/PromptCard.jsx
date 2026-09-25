export default function PromptCard({ prompt }) {
  return (
    <article className="prompt-card">
      <div className="prompt-card-top">
        <span className="tag">{prompt.category}</span>
        <span className="tag tag-alt">❤ {prompt.likes}</span>
      </div>
      <h3>{prompt.title}</h3>
      <p className="prompt-card-desc">{prompt.description}</p>
      <pre className="prompt-card-text">{prompt.prompt}</pre>
      <div className="prompt-card-foot">
        <span className="muted">by {prompt.author}</span>
      </div>
    </article>
  );
}
