import React, { useState, useRef } from 'react';
import { FileText, Link, FileOutput, UploadCloud, AlertCircle } from 'lucide-react';
import { YoutubeLogo } from '@phosphor-icons/react';
import { PDFDocument } from 'pdf-lib';
import { TuiCheckbox } from '../tui/Primitives';

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
        <span className="text-secondary text-xs uppercase tracking-widest font-bold">Generation_Input_Terminal_v2.0</span>
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-border"></div>
          <div className="w-2 h-2 bg-border"></div>
          <div className="w-2 h-2 bg-accent"></div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-10">
        
        {/* PROMPT (Full Width) */}
        <div className={`transition-opacity duration-300 ${activeTab !== 'PROMPT' ? 'opacity-40 grayscale' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-3">
            <TuiCheckbox checked={activeTab === 'PROMPT'} onChange={() => setActiveTab('PROMPT')} />
            <label className="text-secondary text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('PROMPT')}>
              <FileText size={14} /> Text Prompt
            </label>
          </div>
          <textarea
            className="tui-input min-h-[120px] resize-y font-mono text-fg bg-surface/50 leading-relaxed w-full"
            placeholder="e.g. Write a technical deep dive into React Server Components..."
            value={inputs.prompt}
            onChange={(e) => handleInputChange('prompt', e.target.value)}
            disabled={activeTab !== 'PROMPT'}
            onFocus={() => setActiveTab('PROMPT')}
          />
        </div>

        {/* 2x2 GRID for remaining inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
          
          {/* WEBSITE URL */}
          <div className={`transition-opacity duration-300 ${activeTab !== 'WEBSITE' ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <TuiCheckbox checked={activeTab === 'WEBSITE'} onChange={() => setActiveTab('WEBSITE')} />
              <label className="text-secondary text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('WEBSITE')}>
                <Link size={14} /> Target Website URL
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                type="url"
                className="tui-input w-full font-mono text-fg bg-surface/50"
                placeholder="https://example.com/article"
                value={inputs.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={activeTab !== 'WEBSITE'}
                onFocus={() => setActiveTab('WEBSITE')}
              />
            </div>
          </div>

          {/* YOUTUBE URL */}
          <div className={`transition-opacity duration-300 ${activeTab !== 'YOUTUBE' ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <TuiCheckbox checked={activeTab === 'YOUTUBE'} onChange={() => setActiveTab('YOUTUBE')} />
              <label className="text-secondary text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('YOUTUBE')}>
                <YoutubeLogo size={14} className={activeTab === 'YOUTUBE' ? 'text-danger' : ''} /> Target YouTube URL
              </label>
            </div>
            <div className="relative flex items-center">
              <input
                type="url"
                className="tui-input w-full font-mono text-fg bg-surface/50"
                placeholder="https://youtube.com/watch?v=..."
                value={inputs.youtube}
                onChange={(e) => handleInputChange('youtube', e.target.value)}
                disabled={activeTab !== 'YOUTUBE'}
                onFocus={() => setActiveTab('YOUTUBE')}
              />
            </div>
          </div>

          {/* RAW TEXT */}
          <div className={`transition-opacity duration-300 ${activeTab !== 'RAW_TEXT' ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 mb-3">
              <TuiCheckbox checked={activeTab === 'RAW_TEXT'} onChange={() => setActiveTab('RAW_TEXT')} />
              <label className="text-secondary text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('RAW_TEXT')}>
                <FileOutput size={14} /> Paste Raw Text
              </label>
            </div>
            <textarea
              className="tui-input min-h-[140px] resize-y font-mono text-fg bg-surface/50 leading-relaxed w-full"
              placeholder="Paste raw text here..."
              value={inputs.rawText}
              onChange={(e) => handleInputChange('rawText', e.target.value)}
              disabled={activeTab !== 'RAW_TEXT'}
              onFocus={() => setActiveTab('RAW_TEXT')}
            />
          </div>

          {/* PDF UPLOAD */}
          <div className={`transition-opacity duration-300 flex flex-col ${activeTab !== 'PDF' ? 'opacity-40 grayscale' : 'opacity-100'}`}>
            <div className="flex items-center gap-3 mb-3 justify-between">
              <div className="flex items-center gap-3">
                <TuiCheckbox checked={activeTab === 'PDF'} onChange={() => setActiveTab('PDF')} />
                <label className="text-secondary text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('PDF')}>
                  <UploadCloud size={14} /> Upload PDF
                </label>
              </div>
              <span className="text-danger font-bold text-xs">MAX 2 PAGES</span>
            </div>
            
            <div
              onDragOver={(e) => { if (activeTab === 'PDF') onDragOver(e); }}
              onDragLeave={onDragLeave}
              onDrop={(e) => { if (activeTab === 'PDF') onDrop(e); }}
              onClick={() => { if (activeTab === 'PDF') fileInputRef.current?.click(); else setActiveTab('PDF'); }}
              className={`
                border border-dashed p-6 flex flex-col items-center justify-center flex-1 cursor-pointer transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-surface/30'}
                ${activeTab === 'PDF' && !isDragging ? 'hover:border-secondary hover:bg-surface/50' : ''}
                ${pdfError ? 'border-danger/50' : ''}
              `}
            >
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => e.target.files && processPDF(e.target.files[0])}
                disabled={activeTab !== 'PDF'}
              />

              <UploadCloud size={24} className={`mb-3 ${isDragging ? 'text-primary' : 'text-secondary'}`} />

              {inputs.pdfFile ? (
                <div className="text-center">
                  <p className="text-success font-bold mb-1 text-xs">[ FILE ATTACHED ]</p>
                  <p className="text-fg text-xs">{inputs.pdfFile.name}</p>
                </div>
              ) : (
                <div className="text-center font-mono">
                  <p className="text-fg text-xs mb-1">Drag PDF here or click</p>
                </div>
              )}
            </div>
            
            {pdfError && activeTab === 'PDF' && (
              <div className="mt-2 p-2 border border-danger/30 bg-danger/10 text-danger flex items-start gap-2 text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span className="leading-tight">{pdfError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-4 pt-6 border-t border-border flex justify-end">
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
