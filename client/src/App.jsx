import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

function HomePlaceholder() {
  return (
    <main className="container page-loading">
      <h1>PromptVault 🗄️</h1>
      <p>Routing skeleton is up — the real homepage arrives on Day 4.</p>
      <Link to="/" className="btn">
        Home
      </Link>
    </main>
  );
}

function NotFound() {
  return (
    <main className="container page-loading">
      <h1>404</h1>
      <p>That page does not exist.</p>
      <Link to="/" className="btn">
        Go home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
