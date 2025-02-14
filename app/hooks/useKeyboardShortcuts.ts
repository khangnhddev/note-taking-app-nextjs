import { useEffect } from 'react';

interface ShortcutHandlers {
  onNewNote?: () => void;
  onSearch?: () => void;
  onSave?: () => void;
}

export function useKeyboardShortcuts({ onNewNote, onSearch, onSave }: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + N: New Note
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        onNewNote?.();
      }
      
      // Ctrl/Cmd + F: Search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        onSearch?.();
      }

      // Ctrl/Cmd + S: Save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        onSave?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewNote, onSearch, onSave]);
} 