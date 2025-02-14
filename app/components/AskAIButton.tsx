'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface AskAIButtonProps {
  onAIResponse: (response: string) => void;
  prompt?: string;
}

export default function AskAIButton({ onAIResponse, prompt = '' }: AskAIButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt || 'Help me write a note' }),
      });

      if (!response.ok) throw new Error('AI request failed');

      const data = await response.json();
      onAIResponse(data.content);
    } catch (error) {
      console.error('Error asking AI:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAskAI}
      disabled={loading}
      className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
    >
      <SparklesIcon className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
      <span>{loading ? 'Thinking...' : 'Ask AI'}</span>
    </button>
  );
} 