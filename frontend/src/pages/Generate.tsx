import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useGenerateMultimodalMutation } from '../store/api/generationApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { systemLog } from '../utils/logger';

export const Generate = () => {
  const [topic, setTopic] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [generate, { isLoading, error }] = useGenerateMultimodalMutation();
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary border-t-accent rounded-full"
        />
        <div className="text-center">
          <h2 className="headline-lg animate-pulse mb-2">AI is typing...</h2>
          <p className="body-md text-on-surface/70">Synthesizing context and drafting your post.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="headline-display mb-2">Generate Post</h1>
      <p className="body-lg text-on-surface/80 mb-8">Feed the AI context to generate a high-quality blog draft.</p>
      
      <Card className="p-8 bg-surface">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Topic / Prompt"
            placeholder="e.g. The impact of Agentic AI on SaaS..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Input
            label="Website URL"
            type="url"
            placeholder="https://example.com/article"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />
          <Input
            label="YouTube Video URL"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <label className="label-md uppercase text-secondary tracking-widest font-semibold">
              Raw Text Context
            </label>
            <textarea
              className="input-field min-h-[120px] py-4 resize-y"
              placeholder="Paste any raw text notes here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="label-md uppercase text-secondary tracking-widest font-semibold">
              PDF Upload
            </label>
            <input
              type="file"
              accept=".pdf"
              className="bg-tertiary border border-muted p-4 rounded-sm text-sm"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
          </div>
          
          {error && <p className="text-error label-sm">Error generating draft. Please try again.</p>}
          
          <Button type="submit" className="mt-4" disabled={!topic && !websiteUrl && !youtubeUrl && !rawText && !pdfFile}>
            Generate Draft
          </Button>
        </form>
      </Card>
    </div>
  );
};
