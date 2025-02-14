'use client';

import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Modal from './components/Modal';
import dynamic from 'next/dynamic';
import { Note } from './types/note';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { 
  PlusIcon, 
  ClockIcon,
  TrashIcon,
  PencilIcon as EditIcon,
  ViewGridIcon as DragIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ViewModeProvider, useViewMode } from './contexts/ViewModeContext';
import ViewToggle from './components/ViewToggle';
import NoteGrid from './components/NoteGrid';
import SortOptions from './components/SortOptions';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CreateNoteModal from './components/CreateNoteModal';
import EditNoteModal from './components/EditNoteModal';
import ProfileMenu from './components/ProfileMenu';

// Dynamic imports
const NoteForm = dynamic(() => import('./components/NoteForm'), {
  ssr: false
});

const CategoryManager = dynamic(() => import('./components/CategoryManager'), {
  ssr: false
});

const SearchAndFilter = dynamic(() => import('./components/SearchAndFilter'), {
  ssr: false
});

const NotesStats = dynamic(() => import('./components/NotesStats'), {
  ssr: false
});

type SortField = 'title' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

interface Category {
  id: string;
  name: string;
}

export default function NotesPage() {
  const { viewMode } = useViewMode();
  const [session, setSession] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [displayedNotes, setDisplayedNotes] = useState<Note[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [sortedNotes, setSortedNotes] = useState<Note[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    order: SortOrder;
  }>({
    field: 'created_at',
    order: 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const supabase = createClientComponentClient();

  const router = useRouter();

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
      fetchCategories();
    }
  }, [session]);

  const fetchNotes = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .order(sortConfig.field, { ascending: sortConfig.order === 'asc' });

      if (error) throw error;

      const notesWithPositions = (data || []).map((note, index) => ({
        ...note,
        position: index,
      }));

      setNotes(notesWithPositions);
      setSortedNotes(notesWithPositions);
      setDisplayedNotes(notesWithPositions);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(displayedNotes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately
    setDisplayedNotes(items);

    // Update sort orders
    const updatedItems = items.map((item, index) => ({
      ...item,
      sort_order: index
    }));

    try {
      const { error } = await supabase
        .from('notes')
        .upsert(
          updatedItems.map(({ id, sort_order }) => ({
            id,
            sort_order
          }))
        );

      if (error) {
        console.error('Error updating sort order:', error);
        setDisplayedNotes(displayedNotes); // Revert on error
      }
    } catch (error) {
      console.error('Error updating sort order:', error);
      setDisplayedNotes(displayedNotes); // Revert on error
    }
  };

  const handleSubmitNote = async (noteData: Partial<Note>) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) return;

      if (selectedNote) {
        // Update note
        const { error } = await supabase
          .from('notes')
          .update({
            title: noteData.title,
            content: noteData.content,
            category_id: noteData.category_id,
            color: noteData.color,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedNote.id);

        if (error) throw error;

        // Update note tags
        if (noteData.tags) {
          // Delete existing tags
          await supabase
            .from('note_tags')
            .delete()
            .eq('note_id', selectedNote.id);

          // Insert new tags
          if (noteData.tags.length > 0) {
            await supabase
              .from('note_tags')
              .insert(
                noteData.tags.map(tagId => ({
                  note_id: selectedNote.id,
                  tag_id: tagId
                }))
              );
          }
        }
      } else {
        // Create new note
        const { data: note, error } = await supabase
          .from('notes')
          .insert([
            {
              title: noteData.title,
              content: noteData.content,
              category_id: noteData.category_id,
              color: noteData.color,
              user_id: session.session.user.id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Add tags if any
        if (noteData.tags && noteData.tags.length > 0) {
          await supabase
            .from('note_tags')
            .insert(
              noteData.tags.map(tagId => ({
                note_id: note.id,
                tag_id: tagId
              }))
            );
        }
      }

      // Refresh notes
      fetchNotes();
      setIsCreateModalOpen(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  useKeyboardShortcuts({
    onNewNote: () => setIsCreateModalOpen(true),
    onSearch: () => document.querySelector<HTMLInputElement>('input[type="text"]')?.focus(),
  });

  const handleCategoryUpdate = async () => {
    await fetchNotes();
  };

  const handleSort = (field: SortField) => {
    const newOrder = field === sortConfig.field && sortConfig.order === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, order: newOrder });

    // Also sort the current notes without fetching
    const sorted = [...notes].sort((a, b) => {
      if (field === 'title') {
        return newOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      const dateA = new Date(a[field]).getTime();
      const dateB = new Date(b[field]).getTime();
      return newOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setSortedNotes(sorted);
  };

  // Filter notes based on search query and other filters
  const filteredAndSortedNotes = useMemo(() => {
    return displayedNotes.filter(note => {
      const matchesSearch = searchQuery.trim() === '' || 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All Categories' ||
        note.category_id === selectedCategory;

      // Add time filter logic here if needed
      const matchesTime = true; // Implement time filtering based on your needs

      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [displayedNotes, searchQuery, selectedCategory, timeFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Add handler for creating note
  const handleCreateNote = async (noteData: {
    title: string;
    content: string;
    category_id?: string;
  }) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Log để debug
      console.log('Creating note with data:', {
        ...noteData,
        user_id: user.id,
      });

      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          content: noteData.content,
          category_id: noteData.category_id || null,
          user_id: user.id,
        })
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Created note:', data);

      // Update local state
      setNotes(prevNotes => [data, ...prevNotes]);
      
      // Close modal
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Failed to create note. Please check console for details.');
    }
  };

  // Thêm handlers cho edit và delete
  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditModalOpen(true);
  };

  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: updatedNote.title,
          content: updatedNote.content,
          category_id: updatedNote.category_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedNote.id)
        .select()
        .single();

      if (error) throw error;

      setNotes(prev =>
        prev.map(note => (note.id === updatedNote.id ? data : note))
      );
      
      setIsEditModalOpen(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', noteId);

        if (error) throw error;

        // Update local state
        setDisplayedNotes(prev => prev.filter(note => note.id !== noteId));
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
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
    <ViewModeProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="btn-secondary"
                >
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  {showStats ? 'Hide Stats' : 'Show Stats'}
                </button>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="btn-secondary"
                >
                  Manage Categories
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary"
                >
                  Create Note
                </button>
                <div className="ml-4 border-l pl-4">
                  <ProfileMenu />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="select-input"
              >
                <option>All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="select-input"
              >
                <option>All Time</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
              </select>

              {/* Sort Buttons */}
              <div className="flex rounded-lg shadow-sm bg-white">
                <button
                  onClick={() => handleSort('title')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    sortConfig.field === 'title'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300`}
                >
                  Title {sortConfig.field === 'title' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('created_at')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    sortConfig.field === 'created_at'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-l-0 border-gray-300`}
                >
                  Date {sortConfig.field === 'created_at' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                </button>
              </div>

              <ViewToggle />
            </div>
          </div>

          {/* Notes Grid with drag and drop */}
          <NoteGrid 
            notes={filteredAndSortedNotes} 
            viewMode={viewMode}
            onNoteClick={(note) => console.log('clicked note:', note)}
            onDragEnd={handleDragEnd}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
          />
        </main>

        {/* Create Modal */}
        {isCreateModalOpen && (
          <CreateNoteModal
            isOpen={true}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateNote}
            categories={categories}
          />
        )}

        {isEditModalOpen && (
          <EditNoteModal
            isOpen={true}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedNote(null);
            }}
            onSubmit={handleUpdateNote}
            note={selectedNote}
            categories={categories}
          />
        )}

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
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedNote(null);
                }}
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
            onUpdate={handleCategoryUpdate}
          />
        </Modal>
      </div>
    </ViewModeProvider>
  );
} 