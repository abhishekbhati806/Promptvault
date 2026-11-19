import { useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import PromptDetails from './pages/PromptDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CreatePrompt from './pages/CreatePrompt.jsx';
import MyPrompts from './pages/MyPrompts.jsx';
import EditPrompt from './pages/EditPrompt.jsx';
import AIImprove from './pages/AIImprove.jsx';
import AIGenerate from './pages/AIGenerate.jsx';
import AIScore from './pages/AIScore.jsx';
import Admin from './pages/Admin.jsx';
import ProtectedRoute from './context/ProtectedRoute.jsx';
import { useAuth } from './context/useAuth.js';

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 40);
      return () => clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash]);

  return null;
}

function NotFound() {
  return (
    <main className="container page-loading">
      <h1>404</h1>
      <p className="muted" style={{ marginBottom: '1.25rem' }}>
        That page does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        ← Back to PromptVault
      </Link>
    </main>
  );
}

function PromptActions() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const itemClass = (path, primary = false) => {
    if (primary) return 'tool-chip tool-chip-primary';
    return `tool-chip ${pathname === path ? 'active' : ''}`;
  };

  return (
    <div className="tool-bar-wrap">
      <nav className="container tool-bar" aria-label="Quick tools">
        {user && (
          <>
            <Link to="/prompts/new" className={itemClass('/prompts/new', true)}>
              + Create Prompt
            </Link>
            <Link to="/prompts/mine" className={itemClass('/prompts/mine')}>
              📝 My Prompts
            </Link>
            <Link to="/dashboard" className={itemClass('/dashboard')}>
              📊 Dashboard
            </Link>
            {user.is_admin && (
              <Link to="/admin" className={itemClass('/admin')}>
                🛡️ Admin
              </Link>
            )}
            <span className="tool-divider" aria-hidden="true" />
          </>
        )}

        <Link to="/ai/improve" className={itemClass('/ai/improve')}>
          ✨ AI Improver
        </Link>
        <Link to="/ai/generate" className={itemClass('/ai/generate')}>
          🧪 AI Generator
        </Link>
        <Link to="/ai/score" className={itemClass('/ai/score')}>
          🎯 AI Scorer
        </Link>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <ScrollManager />
      <Navbar />
      <PromptActions />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/prompts/new"
          element={
            <ProtectedRoute>
              <CreatePrompt />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prompts/mine"
          element={
            <ProtectedRoute>
              <MyPrompts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/prompts/:id/edit"
          element={
            <ProtectedRoute>
              <EditPrompt />
            </ProtectedRoute>
          }
        />

        <Route path="/prompts/:id" element={<PromptDetails />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="/ai/improve" element={<AIImprove />} />
        <Route path="/ai/generate" element={<AIGenerate />} />
        <Route path="/ai/score" element={<AIScore />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}
