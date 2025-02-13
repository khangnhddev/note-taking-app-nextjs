'use client';

import { useState, useEffect } from 'react';
import { Note, Category } from '../types/note';
import { supabase } from '../lib/supabase';

interface NoteFormProps {
  onSubmit: (note: Partial<Note>) => void;
  initialData?: Note;
  onClose: () => void;
}

export default function NoteForm({ onSubmit, initialData, onClose }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [color, setColor] = useState(initialData?.color || '#ffffff');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find selected category to get its color
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    
    onSubmit({
      title,
      content,
      category_id: categoryId,
      color: selectedCategory?.color || color,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <div className="flex gap-2">
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              // Automatically set color based on category
              const category = categories.find(cat => cat.id === e.target.value);
              if (category) {
                setColor(category.color);
              }
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <button
            type="button"
            onClick={() => {
              // Open category manager modal
              // You'll need to implement this
            }}
            className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Manage
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 resize-none"
          required
        />
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          {initialData ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
} 