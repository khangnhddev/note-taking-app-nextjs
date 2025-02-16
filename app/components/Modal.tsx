'use client';

interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function Modal({ children, isOpen, onClose, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-lg w-full max-w-2xl"
          onClick={e => e.stopPropagation()}
        >
          {title && (
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
} 