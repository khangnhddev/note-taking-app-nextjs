'use client';

import { useState, useEffect } from 'react';
import { Note, Category } from '../types/note';
import { HexColorPicker } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from './RichTextEditor';
import TagManager from './TagManager';
import TemplateManager from './TemplateManager';
import { 
  PlusIcon, 
  DocumentDuplicateIcon, 
  TagIcon 
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface NoteFormProps {
  onSubmit: (note: Partial<Note>) => void;
  initialData?: Note;
  onClose: () => void;
  onOpenCategoryManager: () => void;
}

export default function NoteForm({ onSubmit, initialData, onClose, onOpenCategoryManager }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [color, setColor] = useState(initialData?.color || '#ffffff');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', session.session.user.id)
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
    onSubmit({ 
      title, 
      content, 
      category_id: categoryId, 
      color,
      tags: selectedTags 
    });
  };

  const handleTemplateSelect = (template: any) => {
    setTitle(template.name);
    setContent(template.content);
    setCategoryId(template.category_id || '');
    setShowTemplates(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <DocumentDuplicateIcon className="w-5 h-5" />
          Templates
        </button>
        <button
          type="button"
          onClick={() => setShowTags(!showTags)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <TagIcon className="w-5 h-5" />
          Tags
        </button>
      </div>

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <TemplateManager onSelect={handleTemplateSelect} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags Panel */}
      <AnimatePresence>
        {showTags && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <TagManager 
              selectedTags={selectedTags}
              onChange={setSelectedTags}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-colors duration-200"
          placeholder="Enter note title..."
          required
        />
      </div>

      {/* Category Select with Add Button */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <div className="flex gap-2">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-colors duration-200"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onOpenCategoryManager}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                     text-gray-700 dark:text-gray-200 font-medium rounded-lg
                     transition-all duration-200 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Note Color
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-colors duration-200 flex items-center space-x-2"
            style={{ backgroundColor: color }}
          >
            <div 
              className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-700 dark:text-gray-300">
              {color.toUpperCase()}
            </span>
          </button>

          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-10 mt-2"
              >
                <HexColorPicker color={color} onChange={setColor} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Content
        </label>
        <RichTextEditor 
          content={content}
          onChange={setContent}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                   text-white font-medium rounded-lg shadow-sm hover:shadow
                   transform hover:-translate-y-0.5 transition-all duration-200"
        >
          {initialData ? 'Update Note' : 'Create Note'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
                   text-gray-700 dark:text-gray-200 font-medium rounded-lg
                   transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
} 