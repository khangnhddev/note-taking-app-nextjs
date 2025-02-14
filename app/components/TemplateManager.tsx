'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Template {
  id: string;
  name: string;
  content: string;
  category_id?: string;
}

export default function TemplateManager({ onSelect }: { onSelect: (template: Template) => void }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase.from('templates').select('*');
    if (data) setTemplates(data);
  };

  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) return;

    const { data, error } = await supabase
      .from('templates')
      .insert([newTemplate])
      .select()
      .single();

    if (data) {
      setTemplates([...templates, data]);
      setNewTemplate({ name: '', content: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {templates.map(template => (
          <div
            key={template.id}
            className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelect(template)}
          >
            <h3 className="font-medium mb-2">{template.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{template.content}</p>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-medium mb-4">Create New Template</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={newTemplate.name}
            onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
            placeholder="Template name"
            className="w-full px-4 py-2 border rounded-lg"
          />
          <textarea
            value={newTemplate.content}
            onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
            placeholder="Template content"
            rows={4}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <button
            onClick={saveTemplate}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
} 