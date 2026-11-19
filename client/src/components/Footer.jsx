import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();

  const scrollSection = (e, id) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.history.replaceState(null, '', `/#${id}`);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-about">
          <div className="footer-brand">🗄️ PromptVault</div>
          <p className="muted">
            Your community library for discovering, saving, scoring and improving AI prompts.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/#prompts" onClick={(e) => scrollSection(e, 'prompts')}>
            Prompt Library
          </Link>
          <Link to="/#categories" onClick={(e) => scrollSection(e, 'categories')}>
            Categories
          </Link>
          <Link to="/#about" onClick={(e) => scrollSection(e, 'about')}>
            How It Works
          </Link>
        </div>
        <div>
          <h4>AI Studio</h4>
          <Link to="/ai/improve">Prompt Improver</Link>
          <Link to="/ai/generate">Prompt Generator</Link>
          <Link to="/ai/score">Prompt Scorer</Link>
        </div>
        <div>
          <h4>Workspace</h4>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/prompts/new">Create Prompt</Link>
          <Link to="/prompts/mine">My Prompts</Link>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} PromptVault · Discover, save &amp; improve AI prompts.
      </div>
    </footer>
  );
}
