import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Home' },
  { to: '/#prompts', label: 'Explore' },
  { to: '/#categories', label: 'Categories' },
  { to: '/#about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

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

          {user && (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <Link to="/prompts/mine" className="nav-link" onClick={() => setOpen(false)}>
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
                Login
              </Link>
              <Link to="/register" className="btn btn-small btn-primary" onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
