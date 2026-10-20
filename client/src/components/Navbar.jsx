import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-icon">▤</span>
          PromptVault
        </Link>

        <button
          type="button"
          className={`nav-toggle ${open ? 'open' : ''}`}
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="nav-link"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
                Dashboard
              </Link>
              <button
                type="button"
                className="nav-link nav-action"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                Log in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary nav-register"
                onClick={closeMenu}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
