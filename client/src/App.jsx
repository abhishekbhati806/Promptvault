import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import PromptDetails from './pages/PromptDetails.jsx';

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
        <Route path="/" element={<Home />} />
        <Route path="/prompts/:id" element={<PromptDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
