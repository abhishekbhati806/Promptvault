import { useState } from 'react';
import { CATEGORIES } from '../data/categories.js';

const initialValues = {
  title: '',
  description: '',
  prompt: '',
  category: 'general',
  difficulty: 'beginner',
  tags: '',
};

export default function PromptForm({
  initial = {},
  onSubmit,
  loading = false,
  submitLabel = 'Publish Prompt',
}) {
  const [form, setForm] = useState({
    ...initialValues,
    ...initial,
    tags: Array.isArray(initial.tags)
      ? initial.tags.join(', ')
      : initial.tags || '',
  });
  const [validationError, setValidationError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setValidationError('');
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const title = form.title.trim();
    const description = form.description.trim();
    const prompt = form.prompt.trim();

    if (title.length < 3) {
      setValidationError('Title must be at least 3 characters.');
      return;
    }
    if (description.length < 10) {
      setValidationError('Description must be at least 10 characters.');
      return;
    }
    if (prompt.length < 10) {
      setValidationError('Prompt text must be at least 10 characters.');
      return;
    }

    const tags = form.tags
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean)
      .slice(0, 10);

    onSubmit({
      title,
      description,
      prompt,
      category: form.category,
      difficulty: form.difficulty,
      tags,
    });
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
      {validationError && (
        <div className="alert alert-error" role="alert">
          {validationError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={updateField}
          placeholder="e.g. SQL Query Optimizer"
          minLength={3}
          maxLength={100}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Short description</label>
        <input
          id="description"
          name="description"
          value={form.description}
          onChange={updateField}
          placeholder="One or two lines describing what this prompt helps achieve"
          minLength={10}
          maxLength={300}
          required
        />
        <span className="field-hint">{form.description.length}/300 characters (min 10)</span>
      </div>

      <div className="form-group">
        <label htmlFor="prompt">Prompt text</label>
        <textarea
          id="prompt"
          name="prompt"
          value={form.prompt}
          onChange={updateField}
          placeholder={'You are an expert...\n1. Do this...\n2. Return that...'}
          rows={8}
          minLength={10}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={updateField}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            value={form.difficulty}
            onChange={updateField}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma separated, optional)</label>
        <input
          id="tags"
          name="tags"
          value={form.tags}
          onChange={updateField}
          placeholder="sql, optimization, database"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
