
import { useState } from 'react';

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

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      prompt: form.prompt.trim(),
      category: form.category,
      difficulty: form.difficulty,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  }

  return (
    <form className="prompt-form" onSubmit={handleSubmit}>
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
        <label htmlFor="description">Description</label>
        <input
          id="description"
          name="description"
          value={form.description}
          onChange={updateField}
          placeholder="One or two lines describing the prompt"
          maxLength={500}
          required
        />
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
            <option value="general">General</option>
            <option value="coding">Coding</option>
            <option value="business">Business</option>
            <option value="writing">Writing</option>
            <option value="education">Education</option>
            <option value="marketing">Marketing</option>
            <option value="productivity">Productivity</option>
            <option value="design">Design</option>
            <option value="data">Data Science</option>
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
        <label htmlFor="tags">Tags (comma separated)</label>
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
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
