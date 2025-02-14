'use client';

import { Note, Category } from '../types/note';

interface NotesStatsProps {
  notes: Note[];
  categories: Category[];
}

export default function NotesStats({ notes, categories }: NotesStatsProps) {
  const getTotalNotes = () => notes.length;

  const getNotesByCategory = () => {
    const categoryCount = categories.reduce((acc, cat) => {
      acc[cat.id] = notes.filter(note => note.category_id === cat.id).length;
      return acc;
    }, {} as Record<string, number>);
    return categoryCount;
  };

  const getRecentActivity = () => {
    const now = new Date();
    const weekAgo = new Date(now.setDate(now.getDate() - 7));
    return notes.filter(note => new Date(note.created_at) >= weekAgo).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Total Notes</h3>
        <p className="text-3xl font-bold text-blue-600">{getTotalNotes()}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">By Category</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex justify-between items-center">
              <span className="text-gray-600">{category.name}</span>
              <span className="font-semibold">{getNotesByCategory()[category.id] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <p className="text-3xl font-bold text-green-600">{getRecentActivity()}</p>
        <p className="text-sm text-gray-500">notes created in last 7 days</p>
      </div>
    </div>
  );
} 