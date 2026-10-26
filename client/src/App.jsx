
import { Routes, Route, Link } from 'react-router-dom';
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
import ProtectedRoute from './context/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

function NotFound() {
  return (
    <main className="container page-loading">
      <h1>404</h1>
      <p>That page does not exist.</p>
      <Link to="/" className="btn">Go home</Link>
    </main>
  );
}

function PromptActions() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="container" style={{
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      paddingTop: '16px',
      paddingBottom: '8px'
    }}>
      <Link to="/prompts/new" className="btn btn-primary">
        + Create Prompt
      </Link>
      <Link to="/prompts/mine" className="btn">
        My Prompts
      </Link>
      <Link to="/dashboard" className="btn">
        Dashboard
      </Link>
    </nav>
  );
}

export default function App() {
  return (
    <div className="app">
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

        <Route
          path="/prompts/:id"
          element={<PromptDetails />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}
