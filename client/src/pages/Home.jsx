import { useMemo, useState } from 'react';
import SearchBar from '../components/SearchBar.jsx';
import PromptCard from '../components/PromptCard.jsx';
import CategoryPills from '../components/CategoryPills.jsx';
import { CATEGORIES } from '../data/categories.js';
import { PROMPTS } from '../data/prompts.js';

export default function Home() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPTS.filter((p) => {
      const matchesCategory = category === 'all' || p.category === category;
      const haystack = [p.title, p.description, p.prompt, ...(p.tags || [])]
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });
  }, [query, category]);

  const counts = useMemo(() => {
    const map = {};
    PROMPTS.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, []);

  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero-badge">✨ Your AI prompt library</span>
          <h1>
            Discover, save &amp; improve <span className="grad-text">AI prompts</span>
          </h1>
          <p className="hero-sub">
            PromptVault is a community vault of battle-tested prompts for ChatGPT, Claude,
            Gemini and every other LLM you use.
          </p>
          <div className="hero-actions">
            <a href="#prompts" className="btn btn-primary">
              Explore prompts
            </a>
            <a href="#about" className="btn btn-ghost">
              How it works
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{PROMPTS.length}</strong>
              <span>prompts</span>
            </div>
            <div>
              <strong>{CATEGORIES.length}</strong>
              <span>categories</span>
            </div>
            <div>
              <strong>3</strong>
              <span>AI tools</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Everything you need for better prompts</h2>
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Discover</h3>
              <p>Browse the vault by category or search by topic, tag and wording.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h3>Save</h3>
              <p>Create an account and keep your favorite prompts one click away.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🪄</div>
              <h3>Improve</h3>
              <p>AI tools to polish weak prompts, generate new ones and score quality.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prompt library */}
      <section id="prompts" className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Explore the vault</h2>
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <CategoryPills categories={CATEGORIES} active={category} onSelect={setCategory} />
          <div className="prompt-grid">
            {filtered.map((p) => (
              <PromptCard key={p.id} prompt={p} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="muted center">No prompts match your search. Try a different word or category.</p>
          )}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="section">
        <div className="container">
          <h2 className="section-title">Browse by category</h2>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className="cat-card"
                onClick={() => {
                  setCategory(c.id);
                  document.getElementById('prompts')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="cat-icon" aria-hidden="true">
                  {c.icon}
                </span>
                <span className="cat-name">{c.name}</span>
                <span className="muted cat-desc">{c.description}</span>
                <span className="tag">{counts[c.id] || 0} prompts</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="section section-alt">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Browse</h3>
              <p>Explore prompts by category or search for exactly what you need.</p>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <h3>Copy</h3>
              <p>Open a prompt, read it, and copy it to your clipboard with one click.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Improve</h3>
              <p>Use the AI tools to polish, generate or score any prompt.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
