import React, { useState, useRef } from 'react';
import { FileText, Link, FileOutput, UploadCloud, AlertCircle } from 'lucide-react';
import { YoutubeLogo } from '@phosphor-icons/react';
import { PDFDocument } from 'pdf-lib';

type TabType = 'PROMPT' | 'WEBSITE' | 'YOUTUBE' | 'RAW_TEXT' | 'PDF';

interface InputState {
  prompt: string;
  website: string;
  youtube: string;
  rawText: string;
  pdfFile: File | null;
}

interface PolymorphicInputProps {
  onSubmit: (type: TabType, payload: any) => void;
  isLoading?: boolean;
}

export const PolymorphicInput: React.FC<PolymorphicInputProps> = ({ onSubmit, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('PROMPT');
  const [inputs, setInputs] = useState<InputState>({
    prompt: '',
    website: '',
    youtube: '',
    rawText: '',
    pdfFile: null,
  });

  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'PROMPT', label: 'Prompt', icon: <FileText size={14} /> },
    { id: 'WEBSITE', label: 'Website URL', icon: <Link size={14} /> },
    { id: 'YOUTUBE', label: 'YouTube URL', icon: <YoutubeLogo size={14} /> },
    { id: 'RAW_TEXT', label: 'Raw Text', icon: <FileOutput size={14} /> },
    { id: 'PDF', label: 'PDF Upload', icon: <UploadCloud size={14} /> },
  ];

  const handleInputChange = (key: keyof InputState, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const processPDF = async (file: File) => {
    setPdfError(null);
    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a valid PDF file.');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();

      if (pageCount > 2) {
        setPdfError(`Error: PDF is ${pageCount} pages. Maximum allowed is 2 pages.`);
        handleInputChange('pdfFile', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        handleInputChange('pdfFile', file);
      }
    } catch (err) {
      console.error("Error parsing PDF:", err);
      setPdfError('Could not read PDF. Please ensure it is not corrupted or encrypted.');
      handleInputChange('pdfFile', null);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPDF(e.dataTransfer.files[0]);
    }
  };

  const getPayloadKey = (tab: TabType): keyof InputState => {
    switch (tab) {
      case 'PROMPT': return 'prompt';
      case 'WEBSITE': return 'website';
      case 'YOUTUBE': return 'youtube';
      case 'RAW_TEXT': return 'rawText';
      case 'PDF': return 'pdfFile';
    }
  };

  const handleSubmit = () => {
    const payload = inputs[getPayloadKey(activeTab)];
    onSubmit(activeTab, payload);
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-mono text-sm border border-border bg-bg shadow-2xl relative">
      {/* Decorative Terminal Header */}
      <div className="bg-surface border-b border-border px-4 py-2 flex justify-between items-center select-none">
        <span className="text-secondary text-xs uppercase tracking-widest font-bold">Generation_Input_Terminal_v1.0</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-border"></div>
          <div className="w-2 h-2 bg-border"></div>
          <div className="w-2 h-2 bg-accent"></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto select-none">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-6 py-3 transition-colors outline-none whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-bg text-primary border-t-2 border-t-primary'
                : 'bg-surface text-secondary hover:text-fg hover:bg-bg border-t-2 border-t-transparent'}
              ${i !== 0 ? 'border-l border-border' : ''}
            `}
          >
            <span className={activeTab === tab.id ? 'text-primary' : 'text-secondary'}>
              {tab.icon}
            </span>
            <span className="font-bold tracking-wider uppercase text-xs">
              {activeTab === tab.id ? `[ ${tab.label} ]` : tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Dynamic Input Area */}
      <div className="p-6">

        {/* PROMPT / RAW TEXT */}
        {(activeTab === 'PROMPT' || activeTab === 'RAW_TEXT') && (
          <div className="flex flex-col gap-2">
            <label className="text-secondary text-xs uppercase tracking-widest">
              {activeTab === 'PROMPT' ? 'Enter a detailed prompt to generate blog' : 'Paste raw source material'}
            </label>
            <textarea
              className="tui-input min-h-[160px] resize-y font-mono text-fg bg-surface/50 leading-relaxed"
              placeholder={activeTab === 'PROMPT' ? 'e.g. Write a technical deep dive into React Server Components...' : 'Paste raw text here...'}
              value={activeTab === 'PROMPT' ? inputs.prompt : inputs.rawText}
              onChange={(e) => handleInputChange(activeTab === 'PROMPT' ? 'prompt' : 'rawText', e.target.value)}
            />
          </div>
        )}

        {/* WEBSITE URL */}
        {activeTab === 'WEBSITE' && (
          <div className="flex flex-col gap-2">
            <label className="text-secondary text-xs uppercase tracking-widest">Target Website URL</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-primary">
                <Link size={16} />
              </span>
              <input
                type="url"
                className="tui-input w-full pl-12 font-mono text-fg bg-surface/50"
                placeholder="https://example.com/article"
                value={inputs.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* YOUTUBE URL */}
        {activeTab === 'YOUTUBE' && (
          <div className="flex flex-col gap-2">
            <label className="text-secondary text-xs uppercase tracking-widest">Target YouTube Video URL</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-danger">
                <YoutubeLogo size={16} />
              </span>
              <input
                type="url"
                className="tui-input w-full pl-12 font-mono text-fg bg-surface/50"
                placeholder="https://youtube.com/watch?v=..."
                value={inputs.youtube}
                onChange={(e) => handleInputChange('youtube', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* PDF UPLOAD */}
        {activeTab === 'PDF' && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end mb-1">
              <label className="text-secondary text-xs uppercase tracking-widest">Upload Source PDF</label>
              <span className="text-danger font-bold text-xs">MAX 2 PAGES</span>
            </div>

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-surface/30 hover:border-secondary hover:bg-surface/50'}
                ${pdfError ? 'border-danger/50' : ''}
              `}
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => e.target.files && processPDF(e.target.files[0])}
              />

              <UploadCloud size={32} className={`mb-4 ${isDragging ? 'text-primary' : 'text-secondary'}`} />

              {inputs.pdfFile ? (
                <div className="text-center">
                  <p className="text-success font-bold mb-1">[ FILE ATTACHED ]</p>
                  <p className="text-fg">{inputs.pdfFile.name}</p>
                  <p className="text-secondary text-xs mt-1">{(inputs.pdfFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="text-center font-mono">
                  <p className="text-fg mb-1">Drag and drop PDF here, or click to select</p>
                  <p className="text-secondary text-xs">Only .pdf files are accepted</p>
                </div>
              )}
            </div>

            {pdfError && (
              <div className="mt-2 p-3 border border-danger/30 bg-danger/10 text-danger flex items-start gap-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span className="leading-tight">{pdfError}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Footer */}
        <div className="mt-6 flex justify-end">
          <button
            className="tui-btn tui-btn-accent px-8 py-3 group flex items-center"
            onClick={handleSubmit}
            disabled={isLoading || !inputs[getPayloadKey(activeTab)]}
          >
            <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2">▸</span>
            {isLoading ? 'Processing...' : 'EXECUTE_GENERATION'}
          </button>
        </div>

      </div>
    </div>
  );
};
