'use client';

import { useViewMode } from '../contexts/ViewModeContext';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

export default function ViewToggle() {
  const { viewMode, setViewMode } = useViewMode();

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode); // This will trigger re-render immediately
  };

  return (
    <div className="inline-flex rounded-lg shadow-sm bg-white p-1">
      <button
        onClick={() => handleViewChange('grid')}
        className={`p-2 rounded-l-lg transition-all duration-200 ${
          viewMode === 'grid'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-500 hover:bg-gray-50'
        }`}
        title="Grid View"
      >
        <Squares2X2Icon className="w-5 h-5" />
      </button>
      <button
        onClick={() => handleViewChange('list')}
        className={`p-2 rounded-r-lg transition-all duration-200 ${
          viewMode === 'list'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'text-gray-500 hover:bg-gray-50'
        }`}
        title="List View"
      >
        <ListBulletIcon className="w-5 h-5" />
      </button>
    </div>
  );
} 