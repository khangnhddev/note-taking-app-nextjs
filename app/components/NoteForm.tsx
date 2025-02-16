'use client';

import { useState } from 'react';

interface NoteFormProps {
  initialData?: {
    title: string;
    content: string;
    categoryId: string | null;
  };
  onSubmit: (data: { title: string; content: string; categoryId: string | null }) => Promise<void>;
  categories: { id: string; name: string }[];
  submitLabel: string;
  isLoading: boolean;
  error: string | null;
}

export default function NoteForm({
  initialData = { title: '', content: '', categoryId: null },
  onSubmit,
  categories,
  submitLabel,
  isLoading,
  error,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialData.title);
  const [content, setContent] = useState(initialData.content);
  const [categoryId, setCategoryId] = useState(initialData.categoryId || '');

  const handleAskAI = async () => {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: title }),
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      setContent(data.content);
    } catch (error) {
      console.error('Error asking AI:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, content, categoryId: categoryId || null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <div className="flex justify-between items-center">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <button
            type="button"
            onClick={handleAskAI}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Ask AI
          </button>
        </div>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">No Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}