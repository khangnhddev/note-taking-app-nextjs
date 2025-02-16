'use client';

import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EditNoteModal from './EditNoteModal';
import { Note } from '@/app/types/note';
import { ViewMode } from '@/app/contexts/ViewModeContext';
import { DropResult } from '@hello-pangea/dnd';

export interface NoteGridProps {
  notes: Note[];
  viewMode: ViewMode;
  onNoteClick: (note: Note) => void;
  onDragEnd: (result: DropResult) => Promise<void>;
  onEdit: (note: Note) => Promise<void>;
  onDelete: (noteId: string) => Promise<void>;
  onRefresh: () => void;
  searchQuery: string;
  categories: { id: string; name: string }[];
}

const NoteGrid = ({ notes, viewMode, ...props }: NoteGridProps) => {
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setFilteredNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!props.searchQuery.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const query = props.searchQuery.toLowerCase();
    const filtered = notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query) ||
      (note.category_id && props.categories.find(c => c.id === note.category_id)?.name.toLowerCase().includes(query))
    );
    setFilteredNotes(filtered);
  }, [props.searchQuery, notes, props.categories]);

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');
      
      await fetchNotes();
      if (props.onRefresh) props.onRefresh();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filteredNotes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFilteredNotes(items);
    // Có thể thêm API call để lưu thứ tự mới vào database
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="notes" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-wrap gap-4"
            >
              {filteredNotes.map((note, index) => (
                <Draggable key={note.id} draggableId={note.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        width: 'calc(33.333% - 1rem)',
                        minWidth: '300px',
                      }}
                      className={`
                        p-4 border rounded-lg
                        ${snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'}
                        relative group hover:shadow-md
                        transition-shadow
                        bg-white
                      `}
                    >
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

                      <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
                      <p className="text-gray-600 mb-4">{note.content}</p>
                      
                      <div className="flex justify-between items-center mt-auto">
                        {note.category_id && (
                          <span className="inline-block px-2 py-1 text-sm bg-gray-100 rounded">
                            {props.categories.find(c => c.id === note.category_id)?.name}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(note.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {editingNote && (
        <EditNoteModal
          note={editingNote}
          isOpen={!!editingNote}
          onSubmit={props.onEdit}
          onClose={() => {
            setEditingNote(null);
            fetchNotes();
            if (props.onRefresh) props.onRefresh();
          }}
          categories={[]}
        />
      )}
    </>
  );
};

export default NoteGrid; 