'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface AskAIButtonProps {
  onAIResponse: (content: string) => void;
  prompt: string;
}

export default function AskAIButton({ onAIResponse, prompt }: AskAIButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAskAI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data = await response.json();
      onAIResponse(data.content);
    } catch (error) {
      console.error('Error asking AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAskAI}
      disabled={isLoading}
      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
    >
      <SparklesIcon className="w-4 h-4" />
      <span>{isLoading ? 'Generating...' : 'Ask AI'}</span>
    </button>
  );
} 