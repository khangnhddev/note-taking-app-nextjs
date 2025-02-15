'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditNoteModal from './EditNoteModal';

interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

interface NoteGridProps {
  onRefresh?: () => void;
  searchQuery?: string;
}

const NoteGrid: React.FC<NoteGridProps> = ({ onRefresh, searchQuery = '' }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const router = useRouter();

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
      setFilteredNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notes when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query) ||
      note.category?.name.toLowerCase().includes(query)
    );
    setFilteredNotes(filtered);
  }, [searchQuery, notes]);

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');
      
      await fetchNotes();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  if (isLoading) return <div>Loading notes...</div>;
  if (error) return <div>Error: {error}</div>;
  if (notes.length === 0) return <div>No notes found. Create your first note!</div>;
  if (filteredNotes.length === 0) return <div>No notes found matching your search.</div>;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="p-4 border rounded-lg shadow-sm relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditingNote(note)}
                className="text-blue-600 hover:text-blue-800 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
            <h3 className="font-semibold text-lg">{note.title}</h3>
            <p className="text-gray-600 mt-2">{note.content}</p>
            {note.category && (
              <span className="inline-block mt-2 px-2 py-1 text-sm bg-gray-100 rounded">
                {note.category.name}
              </span>
            )}
          </div>
        ))}
      </div>

      {editingNote && (
        <EditNoteModal
          note={editingNote}
          isOpen={!!editingNote}
          onClose={() => {
            setEditingNote(null);
            fetchNotes();
            if (onRefresh) onRefresh();
          }}
          categories={[]} // Pass your categories here
        />
      )}
    </>
  );
};

export default NoteGrid; 