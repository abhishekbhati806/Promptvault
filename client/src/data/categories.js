// Prompt categories used across the app (keep in sync with server/schemas/prompt.py)
export const CATEGORIES = [
  { id: 'writing', name: 'Writing', icon: '✍️', description: 'Blogs, stories, emails and marketing copy.' },
  { id: 'coding', name: 'Coding', icon: '💻', description: 'Code generation, debugging and reviews.' },
  { id: 'business', name: 'Business', icon: '📈', description: 'Strategy, finance and product thinking.' },
  { id: 'marketing', name: 'Marketing', icon: '📣', description: 'Campaigns, SEO and social media.' },
  { id: 'education', name: 'Education', icon: '🎓', description: 'Learning, teaching and exam prep.' },
  { id: 'creative', name: 'Creative', icon: '🎨', description: 'Ideas, brainstorming and worldbuilding.' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', description: 'Planning, focus and daily workflows.' },
  { id: 'general', name: 'General', icon: '🧰', description: 'Everyday questions and helpers.' },
];

export function categoryMeta(id) {
  return CATEGORIES.find((c) => c.id === id) || { id, name: id, icon: '🧰', description: '' };
}
