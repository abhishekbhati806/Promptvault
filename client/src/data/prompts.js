// Initial prompt dataset (3 of 12 — the full set lands on Day 10).
export const PROMPTS = [
  {
    id: 'p-01',
    title: 'Senior Code Reviewer',
    description: 'Get a rigorous, production-grade review of any code snippet with security and performance notes.',
    prompt:
      'You are a senior software engineer at a top tech company. Review the code below.\n1. Summarize what the code does in two sentences.\n2. List bugs, security risks and performance issues, ordered by severity.\n3. Rewrite the code with the fixes applied.\n4. Suggest two tests I should add.\nKeep the tone direct. Here is the code:',
    category: 'coding',
    tags: ['code-review', 'debugging', 'best-practices'],
    author: 'Aarav S.',
    difficulty: 'advanced',
    likes: 214,
    featured: true,
    created_at: '2026-07-14T09:30:00',
  },
  {
    id: 'p-02',
    title: 'Blog Post Writer',
    description: 'A structured 900-word blog post with hook, subheads, examples and a call to action.',
    prompt:
      'Act as an expert content writer. Write a 900-word blog post about {topic}.\nRequirements:\n- Hook: open with a surprising fact or question.\n- Use H2 subheadings and short paragraphs.\n- Include one real-world example and one statistic (mark invented stats with [verify]).\n- End with a 3-point summary and a call to action.\nTone: friendly but authoritative.',
    category: 'writing',
    tags: ['blog', 'content', 'seo'],
    author: 'Meera K.',
    difficulty: 'intermediate',
    likes: 342,
    featured: true,
    created_at: '2026-07-28T14:05:00',
  },
  {
    id: 'p-03',
    title: 'Socratic Tutor',
    description: 'Learn any topic by being guided with questions instead of getting answers handed over.',
    prompt:
      'You are a Socratic tutor. I want to learn: {topic}.\nRules:\n- Never give the full answer directly.\n- Ask one guiding question at a time.\n- If I am stuck, give a hint, then a smaller hint, then the answer.\n- After each round, tell me my current level (guessing / understanding / confident).',
    category: 'education',
    tags: ['learning', 'tutoring', 'questions'],
    author: 'Ravi T.',
    difficulty: 'beginner',
    likes: 289,
    featured: true,
    created_at: '2026-08-09T18:40:00',
  },
];
