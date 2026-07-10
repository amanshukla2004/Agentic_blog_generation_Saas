import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateMultimodalMutation } from '../store/api/generationApi';
import { useGetPublicSettingsQuery } from '../store/api/publicApi';
import { Button, Panel, Field, Input, ThinkingDots } from '../components/tui/Primitives';
import { systemLog } from '../utils/logger';

export const Generate = () => {
  const [topic, setTopic] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [generate, { isLoading, error }] = useGenerateMultimodalMutation();
  const { data: settings } = useGetPublicSettingsQuery();
  const navigate = useNavigate();

  const isMaintenanceMode = settings?.maintenanceMode === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    systemLog('Generate.tsx', 'handleSubmit', 'User initiated blog generation form submission');
    const formData = new FormData();
    if (topic) formData.append('topic', topic);
    if (websiteUrl) formData.append('website_url', websiteUrl);
    if (youtubeUrl) formData.append('youtube_url', youtubeUrl);
    if (rawText) formData.append('raw_text', rawText);
    if (pdfFile) formData.append('pdf_file', pdfFile);

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
      <Panel title="Generate Post">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
          <Field label="Topic / Prompt">
            <Input
              placeholder="e.g. The impact of Agentic AI on SaaS..."
              value={topic}
              onChange={(e: any) => setTopic(e.target.value)}
              disabled={isLoading}
            />
          </Field>
          
          <Field label="Website URL">
            <Input
              type="url"
              placeholder="https://example.com/article"
              value={websiteUrl}
              onChange={(e: any) => setWebsiteUrl(e.target.value)}
              disabled={isLoading}
            />
          </Field>
          
          <Field label="YouTube Video URL">
            <Input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e: any) => setYoutubeUrl(e.target.value)}
              disabled={isLoading}
            />
          </Field>
          
          <Field label="Raw Text Context">
            <textarea
              className="tui-input min-h-[120px] resize-y"
              placeholder="Paste any raw text notes here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              disabled={isLoading}
            />
          </Field>
          
          <Field label="PDF Upload">
            <label className={`tui-input flex items-center gap-2 ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-accent'}`}>
              <span className="text-secondary">▸ Choose File</span>
              <span className="text-fg truncate flex-1">{pdfFile ? pdfFile.name : 'No file selected'}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                disabled={isLoading}
              />
            </label>
          </Field>
          
          {error && <p className="text-danger text-xs uppercase tracking-widest mt-2">Error generating draft. Please try again.</p>}
          
          <div className="pt-4 border-t border-border mt-2">
            <Button 
              type="submit" 
              variant="accent" 
              disabled={isLoading || (!topic && !websiteUrl && !youtubeUrl && !rawText && !pdfFile)}
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <ThinkingDots />
                  <span>Generating draft...</span>
                </span>
              ) : (
                'Generate Draft'
              )}
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
};
