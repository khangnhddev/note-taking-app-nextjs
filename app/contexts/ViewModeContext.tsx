'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type ViewMode = 'grid' | 'list';

export const ViewModeContext = createContext<{
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}>({
  viewMode: 'grid',
  setViewMode: () => {},
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with localStorage value or default to 'grid'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewMode') as ViewMode;
      return saved || 'grid';
    }
    return 'grid';
  });

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('viewMode', mode);
    }
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode: handleSetViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}; 