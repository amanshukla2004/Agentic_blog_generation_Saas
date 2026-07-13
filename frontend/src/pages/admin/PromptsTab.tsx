import React, { useState, useEffect } from 'react';
import { useGetPromptsQuery, useUpdatePromptMutation } from '../../store/api/masterApi';
import { Field, Button, TuiShimmer } from '../../components/tui/Primitives';

export const PromptsTab: React.FC = () => {
  const { data: prompts, isLoading } = useGetPromptsQuery();
  const [updatePrompt] = useUpdatePromptMutation();
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    if (prompts && prompts.length > 0) {
      setPromptText(prompts[0].promptText);
    }
  }, [prompts]);

  const handleSavePrompt = async () => {
    if (!promptText.trim()) return;
    const firstConfirm = window.confirm("WARNING: Are you sure you want to update the core system AI prompt? This will affect all future generations.");
    if (!firstConfirm) return;
    const secondConfirm = window.prompt("Type 'CONFIRM' to execute.");
    if (secondConfirm !== 'CONFIRM') return;
    
    if (prompts && prompts.length > 0) {
      await updatePrompt({ name: prompts[0].promptName, promptText });
      alert("System prompt updated.");
    }
  };

  return (
    <div className="w-full font-mono text-sm">
      {isLoading ? (
        <div className="py-8">
          <TuiShimmer width={60} />
          <p className="text-secondary mt-2 text-xs uppercase tracking-widest">Loading prompt configuration...</p>
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <Field label="System Prompt Configuration">
            <textarea
              className="tui-input min-h-[400px] resize-y mb-4"
              placeholder="Enter system prompt here..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </Field>
          <Button variant="danger" onClick={handleSavePrompt} icon="!">
            Save Configuration
          </Button>
        </div>
      )}
    </div>
  );
};
