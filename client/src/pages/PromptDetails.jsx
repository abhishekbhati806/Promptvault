import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/useAuth.js';
import { PROMPTS } from '../data/prompts.js';
import { categoryMeta } from '../data/categories.js';
import { copyText, formatDate } from '../utils/helpers.js';

export default function PromptDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const localPrompt = PROMPTS.find((p) => p.id === id) || null;
  const [fetched, setFetched] = useState({ id: null, data: null, done: false });
  const [copiedId, setCopiedId] = useState(null);
  const [liking, setLiking] = useState(false);
  const [likedIds, setLikedIds] = useState({});
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favBusy, setFavBusy] = useState(false);

  const prompt = fetched.id === id && fetched.data ? fetched.data : localPrompt;
  const loading = !prompt && !(fetched.id === id && fetched.done);
  const copied = copiedId === id;
  const liked = Boolean(likedIds[id]);
  const favorited = Boolean(user && favoriteIds.includes(id));

  useEffect(() => {
    let active = true;
    api
      .getPrompt(id)
      .then((data) => {
        if (active) setFetched({ id, data: data || null, done: true });
      })
      .catch(() => {
        if (active) setFetched({ id, data: null, done: true });
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    api
      .getFavorites()
      .then((list) => {
        if (active && Array.isArray(list)) {
          setFavoriteIds(list.map((p) => p.id));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);

  if (loading) {
    return (
      <main className="container page-loading">
        <p className="muted">Loading prompt…</p>
      </main>
    );
  }

  if (!prompt) {
    return (
      <main className="container page-loading">
        <h1>Prompt not found</h1>
        <p className="muted" style={{ marginBottom: '1.25rem' }}>
          This prompt does not exist or has been removed.
        </p>
        <Link to="/" className="btn btn-primary">
          ← Back to vault
        </Link>
      </main>
    );
  }

  const meta = categoryMeta(prompt.category);
  const isOwner = Boolean(user && prompt.owner_id && prompt.owner_id === user.id);

  const handleCopy = async () => {
    const ok = await copyText(prompt.prompt);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1800);
    }
  };

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      const res = await api.likePrompt(prompt.id);
      setFetched({ id, data: { ...prompt, likes: res.likes }, done: true });
      setLikedIds((cur) => ({ ...cur, [id]: true }));
    } catch {
      /* ignore */
    } finally {
      setLiking(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/prompts/${prompt.id}` } });
      return;
    }
    if (favBusy) return;
    setFavBusy(true);
    try {
      if (favorited) {
        await api.removeFavorite(prompt.id);
        setFavoriteIds((list) => list.filter((x) => x !== prompt.id));
      } else {
        await api.addFavorite(prompt.id);
        setFavoriteIds((list) => [...list, prompt.id]);
      }
    } catch {
      /* ignore */
    } finally {
      setFavBusy(false);
    }
  };

  return (
    <main className="container details">
      <Link to="/#prompts" className="back-link">
        ← Back to vault
      </Link>

      <div className="details-head">
        <div>
          <div className="details-tags">
            <span className="tag">
              {meta.icon} {meta.name}
            </span>
            {prompt.difficulty && (
              <span className="tag tag-alt">{prompt.difficulty}</span>
            )}
            <button
              type="button"
              className={`like-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              disabled={liking}
              title="Like this prompt"
            >
              ❤ {prompt.likes ?? 0}
            </button>
          </div>
          <h1 className="details-title">{prompt.title}</h1>
          <p className="muted details-meta">
            by <strong>{prompt.author}</strong>
            {prompt.created_at ? ` · ${formatDate(prompt.created_at)}` : ''}
          </p>
        </div>

        <div className="details-actions">
          <button type="button" className="btn btn-primary" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy prompt'}
          </button>
          <button
            type="button"
            className={`btn ${favorited ? 'btn-saved' : ''}`}
            onClick={handleToggleFavorite}
            disabled={favBusy}
          >
            {favorited ? '★ Saved' : '☆ Save'}
          </button>
          {isOwner && (
            <Link to={`/prompts/${prompt.id}/edit`} className="btn">
              ✏️ Edit
            </Link>
          )}
        </div>
      </div>

      <p className="details-desc">{prompt.description}</p>

      <pre className="details-prompt">{prompt.prompt}</pre>

      <div className="details-footer-row">
        {(prompt.tags || []).length > 0 && (
          <div className="details-tags">
            {prompt.tags.map((t) => (
              <span key={t} className="tag">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="details-ai-links">
          <Link
            to="/ai/improve"
            state={{ prompt: prompt.prompt, category: prompt.category }}
            className="btn btn-small"
          >
            ✨ Improve with AI
          </Link>
          <Link
            to="/ai/score"
            state={{ prompt: prompt.prompt }}
            className="btn btn-small"
          >
            🎯 Score quality
          </Link>
        </div>
      </div>
    </main>
  );
}
