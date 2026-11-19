import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PromptForm from '../components/PromptForm.jsx';
import { api } from '../api/client.js';
import { getErrorMessage } from '../utils/helpers.js';

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
      .catch((err) => setError(getErrorMessage(err, 'Could not load this prompt.')))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async (payload) => {
    setSaving(true);
    setError('');
    try {
      await api.updatePrompt(id, payload);
      navigate(`/prompts/${id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save changes.'));
      setSaving(false);
    }
  };

  return (
    <main className="container form-page">
      <Link to="/prompts/mine" className="back-link">
        ← Back to My Prompts
      </Link>
      <h1>✏️ Edit Prompt</h1>
      <p className="muted">Update your prompt details and save changes to the vault.</p>
      {loading && <p className="muted" style={{ marginTop: '1rem' }}>Loading…</p>}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {prompt && (
        <PromptForm
          initial={prompt}
          onSubmit={submit}
          loading={saving}
          submitLabel="Save Changes"
        />
      )}
    </main>
  );
}
