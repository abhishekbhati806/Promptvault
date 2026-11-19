import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import PromptCard from '../components/PromptCard.jsx';
import CategoryPills from '../components/CategoryPills.jsx';
import { api } from '../api/client.js';
import { CATEGORIES } from '../data/categories.js';
import { PROMPTS } from '../data/prompts.js';
import { useAuth } from '../context/useAuth.js';

export default function Home() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [prompts, setPrompts] = useState(PROMPTS);

  useEffect(() => {
    let active = true;
    api
      .getPrompts({ limit: 100 })
      .then((data) => {
        if (active && Array.isArray(data) && data.length > 0) {
          setPrompts(data);
        }
      })
      .catch(() => {
        /* fall back to bundled starter prompts */
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSelectCategory = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    if (next === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', next);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handlePromptLiked = (id, likes) => {
    setPrompts((list) =>
      list.map((p) => (p.id === id ? { ...p, likes } : p))
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = prompts.filter((p) => {
      const matchesCategory = category === 'all' || p.category === category;
      const haystack = [p.title, p.description, p.prompt, ...(p.tags || [])]
        .join(' ')
        .toLowerCase();
      return matchesCategory && (!q || haystack.includes(q));
    });

    const sorted = [...list];
    if (sort === 'likes') {
      sorted.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    } else if (sort === 'title') {
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else {
      sorted.sort((a, b) =>
        String(b.created_at || '').localeCompare(String(a.created_at || ''))
      );
    }
    return sorted;
  }, [prompts, query, category, sort]);

  const counts = useMemo(() => {
    const map = {};
    prompts.forEach((p) => {
      map[p.category] = (map[p.category] || 0) + 1;
    });
    return map;
  }, [prompts]);

  const scrollTo = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="home">
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
            <a
              href="#prompts"
              className="btn btn-primary"
              onClick={(e) => scrollTo(e, 'prompts')}
            >
              Explore prompts
            </a>
            <Link to="/ai/generate" className="btn">
              🧪 Generate with AI
            </Link>
            <a
              href="#about"
              className="btn btn-ghost"
              onClick={(e) => scrollTo(e, 'about')}
            >
              How it works
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{prompts.length}</strong>
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

      <section className="section">
        <div className="container">
          <h2 className="section-title">Everything you need for better prompts</h2>
          <div className="features">
            <a
              href="#prompts"
              className="feature-card feature-card-link"
              onClick={(e) => scrollTo(e, 'prompts')}
            >
              <div className="feature-icon" aria-hidden="true">🔍</div>
              <h3>Discover</h3>
              <p>Browse the vault by category or search by topic, tag and wording.</p>
            </a>
            <Link
              to={user ? '/dashboard' : '/register'}
              className="feature-card feature-card-link"
            >
              <div className="feature-icon" aria-hidden="true">❤️</div>
              <h3>Save &amp; Publish</h3>
              <p>Create a free account to publish prompts and save favorites one click away.</p>
            </Link>
            <Link to="/ai/improve" className="feature-card feature-card-link">
              <div className="feature-icon" aria-hidden="true">🪄</div>
              <h3>Improve with AI</h3>
              <p>Polish weak prompts, generate new ones from scratch, and score quality out of 10.</p>
            </Link>
          </div>
        </div>
      </section>

      <section id="prompts" className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Explore the vault</h2>
            <div className="vault-controls">
              <SearchBar value={query} onChange={setQuery} />
              <select
                className="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort prompts"
              >
                <option value="newest">Sort: Newest</option>
                <option value="likes">Sort: Most liked</option>
                <option value="title">Sort: A–Z</option>
              </select>
            </div>
          </div>
          <CategoryPills
            categories={CATEGORIES}
            active={category}
            onSelect={handleSelectCategory}
          />
          <div className="prompt-grid">
            {filtered.map((p) => (
              <PromptCard key={p.id} prompt={p} onLiked={handlePromptLiked} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="empty-state">
              <p className="muted">
                No prompts match your search. Try a different keyword or reset your filters.
              </p>
              <button
                type="button"
                className="btn btn-small"
                onClick={() => {
                  setQuery('');
                  handleSelectCategory('all');
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="categories" className="section">
        <div className="container">
          <h2 className="section-title">Browse by category</h2>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cat-card ${category === c.id ? 'cat-card-active' : ''}`}
                onClick={() => {
                  handleSelectCategory(c.id);
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
              <h3>Copy &amp; Save</h3>
              <p>Copy any prompt in one click, like the best ones, and bookmark favorites.</p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Improve &amp; Share</h3>
              <p>Use AI Studio to improve, generate or score prompts, then publish your own.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
