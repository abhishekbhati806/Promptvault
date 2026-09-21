import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="footer-brand">🗄️ PromptVault</div>
          <p className="muted">Your library for discovering, saving and improving AI prompts.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <a href="/#categories">Categories</a>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} PromptVault · Built day by day.
      </div>
    </footer>
  );
}
