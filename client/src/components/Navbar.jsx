import { useState } from 'react';
import { Link } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/#prompts', label: 'Explore' },
  { to: '/#categories', label: 'Categories' },
  { to: '/#about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-icon">🗄️</span>
          PromptVault
        </Link>

        <button
          type="button"
          className={`nav-toggle ${open ? 'open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="nav-link" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
