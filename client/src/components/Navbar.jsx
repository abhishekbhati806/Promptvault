import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

const links = [
  { to: '/', hash: '', label: 'Home' },
  { to: '/#prompts', hash: 'prompts', label: 'Explore' },
  { to: '/#categories', hash: 'categories', label: 'Categories' },
  { to: '/#about', hash: 'about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const handleNavClick = (event, link) => {
    setOpen(false);
    if (link.hash && location.pathname === '/') {
      event.preventDefault();
      navigate(`/#${link.hash}`, { replace: true });
      document.getElementById(link.hash)?.scrollIntoView({ behavior: 'smooth' });
    } else if (!link.hash && location.pathname === '/') {
      event.preventDefault();
      navigate('/', { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-icon" aria-hidden="true">🗄️</span>
          <span>PromptVault</span>
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

        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary">
          {links.map((l) => {
            const isActive =
              location.pathname === '/' &&
              (l.hash ? location.hash === `#${l.hash}` : !location.hash);
            return (
              <Link
                key={l.label}
                to={l.to}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, l)}
              >
                {l.label}
              </Link>
            );
          })}

          {user && (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/prompts/mine"
                className={`nav-link ${location.pathname === '/prompts/mine' ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                My Prompts
              </Link>
            </>
          )}

          {user ? (
            <div className="nav-auth">
              <span className="nav-user" title={user.email}>
                👤 {user.name ? user.name.split(' ')[0] : 'Account'}
              </span>
              <button type="button" className="btn btn-small" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-small" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link
                to="/register"
                className="btn btn-small btn-primary"
                onClick={() => setOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
