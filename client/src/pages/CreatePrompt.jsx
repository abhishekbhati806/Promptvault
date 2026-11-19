import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PromptForm from '../components/PromptForm.jsx';
import { api } from '../api/client.js';
import { getErrorMessage } from '../utils/helpers.js';

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
        getErrorMessage(err, 'Could not create prompt. Please check your inputs and try again.')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container form-page">
      <Link to="/prompts/mine" className="back-link">
        ← Back to My Prompts
      </Link>
      <h1>✍️ Create a Prompt</h1>
      <p className="muted">
        Publish a prompt to the community vault and manage it anytime from My Prompts.
      </p>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <PromptForm
        onSubmit={submit}
        loading={loading}
        submitLabel="Publish Prompt"
      />
    </main>
  );
}
