import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateMultimodalMutation } from '../store/api/generationApi';
import { useGetPublicSettingsQuery } from '../store/api/publicApi';
import { Panel } from '../components/tui/Primitives';
import { PolymorphicInput } from '../components/blog/PolymorphicInput';
import { systemLog } from '../utils/logger';
export const Generate = () => {
  const [generate, { isLoading, error }] = useGenerateMultimodalMutation();
  const { data: settings } = useGetPublicSettingsQuery();
  const navigate = useNavigate();

  const isMaintenanceMode = settings?.maintenanceMode === 'true';

  const handleSubmit = async (type: string, payload: any) => {
    systemLog('Generate.tsx', 'handleSubmit', `User initiated blog generation for type: ${type}`);
    const formData = new FormData();
    
    if (type === 'PROMPT') formData.append('topic', payload);
    else if (type === 'WEBSITE') formData.append('website_url', payload);
    else if (type === 'YOUTUBE') formData.append('youtube_url', payload);
    else if (type === 'RAW_TEXT') formData.append('raw_text', payload);
    else if (type === 'PDF') formData.append('pdf_file', payload);

    try {
      systemLog('Generate.tsx', 'handleSubmit', 'Awaiting generation API response');
      const draft = await generate(formData).unwrap();
      systemLog('Generate.tsx', 'handleSubmit', `Navigation to draft page for ID: ${draft.id}`);
      navigate(`/draft/${draft.id}`);
    } catch (err) {
      systemLog('Generate.tsx', 'handleSubmit', 'Failed to generate blog draft');
      console.error('Generation failed:', err);
    }
  };

  if (isMaintenanceMode) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 font-mono text-sm">
        <Panel title="System Maintenance" className="text-center py-12">
          <p className="text-secondary text-xs uppercase tracking-widest leading-relaxed">
            The AI engine is currently offline for scheduled maintenance. <br />
            Please check back later.
          </p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 font-mono text-sm [--tw-accent:theme(colors.warning)]">
      {error && <p className="text-danger text-xs uppercase tracking-widest text-center mb-4">Error generating draft. Please try again.</p>}
      <PolymorphicInput 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
      />
    </div>
  );
};
