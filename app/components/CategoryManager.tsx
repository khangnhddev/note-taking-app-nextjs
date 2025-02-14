'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Category } from '../types/note';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CategoryManagerProps {
  onClose: () => void;
  onUpdate: () => void;
}

export default function CategoryManager({ onClose, onUpdate }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#3B82F6',
    description: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        console.log('No user session found');
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('name');

      if (error) throw error;
      console.log('Fetched categories:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        console.log('No user session found');
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategory.name,
            color: newCategory.color,
            description: newCategory.description,
            user_id: session.session.user.id
          }
        ])
        .select();

      if (error) throw error;

      console.log('Created category:', data);
      setNewCategory({ name: '', color: '#3B82F6', description: '' });
      fetchCategories();
      onUpdate();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setCategories(
        categories.map((cat) =>
          cat.id === id ? { ...cat, name } : cat
        )
      );
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? Notes in this category will become uncategorized.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(categories.filter((cat) => cat.id !== id));
      onUpdate();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Category Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="New category name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </form>

      {/* Categories List */}
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
          >
            {editingId === category.id ? (
              <div className="flex gap-2 flex-1">
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) =>
                    setCategories(
                      categories.map((cat) =>
                        cat.id === category.id
                          ? { ...cat, name: e.target.value }
                          : cat
                      )
                    )
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => handleUpdateCategory(category.id, category.name)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <span>{category.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(category.id)}
                    className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 