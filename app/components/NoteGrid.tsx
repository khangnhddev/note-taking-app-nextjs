'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  sort_order: number;
}

interface NoteGridProps {
  notes: Note[];
  viewMode: 'grid' | 'list';
  onNoteClick: (note: Note) => void;
  onDragEnd: (result: DropResult) => void;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export default function NoteGrid({ 
  notes, 
  viewMode, 
  onNoteClick, 
  onDragEnd,
  onEdit,
  onDelete 
}: NoteGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const renderNoteActions = (note: Note) => (
    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(note);
        }}
        className="p-1 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
      >
        <PencilIcon className="w-4 h-4 text-gray-600" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(note.id);
        }}
        className="p-1 rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
      >
        <TrashIcon className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable 
        droppableId="notes" 
        direction={viewMode === 'list' ? 'vertical' : 'horizontal'}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={viewMode === 'list' 
              ? "space-y-4" 
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            }
          >
            {notes.map((note, index) => (
              <Draggable 
                key={note.id} 
                draggableId={note.id.toString()} 
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                      group relative
                      ${viewMode === 'list'
                        ? 'flex items-center space-x-4'
                        : 'h-[200px] flex flex-col'
                      }
                      bg-white rounded-lg shadow hover:shadow-md 
                      transition-all duration-200 cursor-move p-4
                      ${snapshot.isDragging ? 'ring-2 ring-blue-500 opacity-90' : ''}
                    `}
                    onClick={() => onNoteClick(note)}
                  >
                    {renderNoteActions(note)}
                    
                    {viewMode === 'list' ? (
                      <>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {note.title}
                          </h3>
                          <p className="text-gray-500 line-clamp-1">
                            {note.content}
                          </p>
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {note.title}
                        </h3>
                        <p className="text-gray-500 flex-1 line-clamp-4">
                          {note.content}
                        </p>
                        <div className="mt-4 text-sm text-gray-400">
                          {new Date(note.created_at).toLocaleDateString()}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
} 