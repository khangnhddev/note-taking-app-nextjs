'use client';

import { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

type SortField = 'title' | 'created_at' | 'updated_at';
type SortOrder = 'asc' | 'desc';

interface SortOptionsProps {
  onSort: (field: SortField, order: SortOrder) => void;
}

export default function SortOptions({ onSort }: SortOptionsProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    const newOrder = field === sortField && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    return sortOrder === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  return (
    <div className="flex items-center space-x-4 bg-white rounded-lg shadow p-2">
      <button
        onClick={() => handleSort('title')}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
          sortField === 'title' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
        }`}
      >
        <span>Title</span>
        {getSortIcon('title')}
      </button>
      <button
        onClick={() => handleSort('created_at')}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
          sortField === 'created_at' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
        }`}
      >
        <span>Created</span>
        {getSortIcon('created_at')}
      </button>
      <button
        onClick={() => handleSort('updated_at')}
        className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
          sortField === 'updated_at' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
        }`}
      >
        <span>Updated</span>
        {getSortIcon('updated_at')}
      </button>
    </div>
  );
} 