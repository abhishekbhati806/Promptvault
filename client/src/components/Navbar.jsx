import { Link } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/#prompts', label: 'Explore' },
  { to: '/#categories', label: 'Categories' },
  { to: '/#about', label: 'About' },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">🗄️</span>
          PromptVault
        </Link>
        <nav className="nav-links">
          {links.map((l) => (
            <Link key={l.label} to={l.to} className="nav-link">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
