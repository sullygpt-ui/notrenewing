'use client';

import { useState } from 'react';
import { Lightbulb, Pencil, Check, X, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface UseCaseEditorProps {
  listingId: string;
  domainName: string;
  initialUseCase: string | null;
}

const MAX_CHARS = 80;

export function UseCaseEditor({ listingId, domainName, initialUseCase }: UseCaseEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [useCase, setUseCase] = useState(initialUseCase || '');
  const [savedUseCase, setSavedUseCase] = useState(initialUseCase || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/use-case', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, useCase: useCase.trim() }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }
      
      setSavedUseCase(useCase.trim());
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/use-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate');
      }
      
      const data = await response.json();
      setUseCase(data.useCase);
      setSavedUseCase(data.useCase);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    setUseCase(savedUseCase);
    setIsEditing(false);
    setError(null);
  };

  const charsRemaining = MAX_CHARS - useCase.length;

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 text-sm group/usecase">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        {savedUseCase ? (
          <span className="text-gray-600 truncate max-w-[250px]" title={savedUseCase}>
            {savedUseCase}
          </span>
        ) : (
          <span className="text-gray-400 italic">No use-case set</span>
        )}
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-primary-600 opacity-0 group-hover/usecase:opacity-100 transition-opacity"
          title="Edit use-case"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        {!savedUseCase && (
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="p-1 text-gray-400 hover:text-primary-600 opacity-0 group-hover/usecase:opacity-100 transition-opacity"
            title="Generate with AI"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <input
          type="text"
          value={useCase}
          onChange={(e) => setUseCase(e.target.value.slice(0, MAX_CHARS))}
          placeholder="e.g., Launch your next SaaS"
          className="flex-1 text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          autoFocus
          disabled={isSaving}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
          title="Save"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={handleRegenerate}
          disabled={isGenerating || isSaving}
          className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
          title="Regenerate with AI"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`${charsRemaining < 10 ? 'text-red-500' : 'text-gray-400'}`}>
          {charsRemaining} characters remaining
        </span>
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </div>
  );
}
