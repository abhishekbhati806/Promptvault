
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PromptForm from '../components/PromptForm.jsx';
import { api } from '../api/client.js';

export default function CreatePrompt() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(payload) {
    setLoading(true);
    setError('');

    try {
      await api.createPrompt(payload);
      navigate('/prompts/mine');
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Could not create prompt. Check that the backend is running and you are logged in.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container form-page">
      <h1>Create a Prompt</h1>
      <p className="muted">
        Publish a prompt and manage it later from My Prompts.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <PromptForm
        onSubmit={submit}
        loading={loading}
        submitLabel="Publish Prompt"
      />

      <p>
        <Link to="/prompts/mine">Back to My Prompts</Link>
      </p>
    </main>
  );
}
