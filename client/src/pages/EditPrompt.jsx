import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PromptForm from '../components/PromptForm.jsx';
import { api } from '../api/client.js';

export default function EditPrompt() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getPrompt(id)
      .then(setPrompt)
      .catch(() => setError('Could not load this prompt.'))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (payload) => {
    setSaving(true);
    setError('');
    try {
      await api.updatePrompt(id, payload);
      navigate(`/prompts/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save changes.');
      setSaving(false);
    }
  };

  return (
    <main className="container form-page">
      <h1>✏️ Edit prompt</h1>
      <p className="muted">Only you (or an admin) can change your prompts.</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {prompt && <PromptForm initial={prompt} onSubmit={submit} loading={saving} submitLabel="Save changes" />}
    </main>
  );
}
