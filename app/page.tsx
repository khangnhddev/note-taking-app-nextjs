'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Modal from './components/Modal';
import NoteForm from './components/NoteForm';
import { Note } from './types/note';
import CategoryManager from './components/CategoryManager';

export default function NotesPage() {
  const [session, setSession] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotes();
    }
  }, [session]);

  const fetchNotes = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('position')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notesWithPositions = (data || []).map((note, index) => ({
        ...note,
        position: index,
      }));

      setNotes(notesWithPositions);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !session?.user?.id) return;

    const { source, destination } = result;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    try {
      const newNotes = Array.from(notes);
      const [movedNote] = newNotes.splice(source.index, 1);
      newNotes.splice(destination.index, 0, movedNote);

      const updatedNotes = newNotes.map((note, index) => ({
        ...note,
        position: index,
      }));
      setNotes(updatedNotes);

      const updates = updatedNotes.map((note) => ({
        id: note.id,
        position: note.position,
        user_id: session.user.id,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('notes')
          .update({ position: update.position })
          .eq('id', update.id)
          .eq('user_id', update.user_id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating note positions:', error);
      setNotes(notes);
      alert('Failed to update note positions. Please try again.');
    }
  };

  const handleCreate = async (noteData: Partial<Note>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            ...noteData,
            position: notes.length,
            user_id: session?.user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setNotes([...notes, data]);
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleEdit = async (noteData: Partial<Note>) => {
    if (!selectedNote) return;

    try {
      const { data, error } = await supabase
        .from('notes')
        .update(noteData)
        .eq('id', selectedNote.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setNotes(notes.map((note) => (note.id === data.id ? data : note)));
        setIsEditModalOpen(false);
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', selectedNote.id);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== selectedNote.id));
      setIsDeleteModalOpen(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your notes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">My Notes</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-end gap-4 mb-6">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          >
            Manage Categories
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Note
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="notes">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {notes.map((note, index) => (
                  <Draggable 
                    key={note.id} 
                    draggableId={note.id} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          backgroundColor: note.color || '#ffffff',
                        }}
                        className={`rounded-xl shadow-lg p-6 transition-all duration-200 
                          ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500' : 'hover:shadow-xl'}`}
                      >
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="w-full h-6 flex items-center justify-center mb-2 cursor-grab active:cursor-grabbing"
                        >
                          <div className="w-8 h-1 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
                        </div>

                        {/* Note Content */}
                        <div className="relative group">
                          <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedNote(note);
                                setIsEditModalOpen(true);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedNote(note);
                                setIsDeleteModalOpen(true);
                              }}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              Delete
                            </button>
                          </div>

                          <div className="pt-8"> {/* Added padding-top to account for absolute buttons */}
                            {note.category_id && (
                              <span className="inline-block px-2 py-1 bg-white bg-opacity-50 text-gray-600 text-sm rounded-full mb-2">
                                {categories.find(cat => cat.id === note.category_id)?.name || 'Uncategorized'}
                              </span>
                            )}
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                              {note.title}
                            </h3>
                            <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                              {note.content}
                            </p>
                            <div className="text-sm text-gray-400">
                              {new Date(note.created_at).toLocaleString()}
                            </div>
                          </div>
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

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Note"
        >
          <NoteForm
            onSubmit={handleCreate}
            onClose={() => setIsCreateModalOpen(false)}
          />
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedNote(null);
          }}
          title="Edit Note"
        >
          <NoteForm
            initialData={selectedNote!}
            onSubmit={handleEdit}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedNote(null);
            }}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedNote(null);
          }}
          title="Delete Note"
        >
          <div className="space-y-4">
            <p>Are you sure you want to delete this note?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedNote(null);
                }}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Category Manager Modal */}
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title="Manage Categories"
        >
          <CategoryManager
            onClose={() => setIsCategoryModalOpen(false)}
            onUpdate={fetchNotes}
          />
        </Modal>
      </main>
    </div>
  );
} 