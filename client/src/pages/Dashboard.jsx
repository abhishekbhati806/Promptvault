import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="container dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="hero-badge">YOUR WORKSPACE</p>
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p className="muted">Your PromptVault account is active.</p>
        </div>
        <button className="btn btn-ghost" onClick={logout}>
          Log out
        </button>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <span className="dashboard-icon">👤</span>
          <h2>Account details</h2>
          <p className="muted">Name: {user?.name}</p>
          <p className="muted">Email: {user?.email}</p>
        </article>

        <article className="dashboard-card">
          <span className="dashboard-icon">📚</span>
          <h2>Explore prompts</h2>
          <p className="muted">
            Browse the existing PromptVault prompt library.
          </p>
          <Link to="/#prompts" className="btn btn-primary">
            Explore prompts
          </Link>
        </article>
      </section>
    </main>
  );
}
