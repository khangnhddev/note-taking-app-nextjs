'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function TagManager({ selectedTags, onChange }: { 
  selectedTags: string[],
  onChange: (tags: string[]) => void 
}) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('*');
    if (data) setTags(data);
  };

  const addTag = async () => {
    if (!newTag.trim()) return;

    const { data, error } = await supabase
      .from('tags')
      .insert([{ name: newTag, color: newColor }])
      .select()
      .single();

    if (data) {
      setTags([...tags, data]);
      setNewTag('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => {
              const newSelection = selectedTags.includes(tag.id)
                ? selectedTags.filter(id => id !== tag.id)
                : [...selectedTags, tag.id];
              onChange(newSelection);
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all
              ${selectedTags.includes(tag.id) 
                ? 'opacity-100 scale-105' 
                : 'opacity-70 hover:opacity-100'}`}
            style={{ backgroundColor: tag.color, color: '#fff' }}
          >
            {tag.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder="New tag..."
          className="flex-1 px-3 py-2 border rounded-lg"
        />
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          className="w-10 h-10 rounded"
        />
        <button
          onClick={addTag}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Add
        </button>
      </div>
    </div>
  );
} 