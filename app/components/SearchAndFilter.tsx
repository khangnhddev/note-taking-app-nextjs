'use client';

import { useState, useEffect } from 'react';
import { Note, Category } from '../types/note';
import { supabase } from '../lib/supabase';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchAndFilterProps {
  notes: Note[];
  categories: Category[];
  onFilteredNotesChange: (notes: Note[]) => void;
}

export default function SearchAndFilter({ notes, categories, onFilteredNotesChange }: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  useEffect(() => {
    let filtered = [...notes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category_id === selectedCategory);
    }

    // Time filter
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        filtered = filtered.filter(note => {
          const noteDate = new Date(note.created_at);
          return noteDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(note => new Date(note.created_at) > weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(note => new Date(note.created_at) > monthAgo);
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredNotes(filtered);
  }, [notes, searchTerm, selectedCategory, timeFilter, sortOrder]);

  useEffect(() => {
    if (onFilteredNotesChange) {
      onFilteredNotesChange(filteredNotes);
    }
  }, [filteredNotes, onFilteredNotesChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        <option value="all">All Categories</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {/* Time Filter */}
      <select
        value={timeFilter}
        onChange={(e) => setTimeFilter(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>

      {/* Sort Order */}
      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        <option value="latest">Latest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>
  );
} 