import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetUserBlogsQuery, useUpdateBlogMutation, useReviseBlogMutation, usePublishMyBlogMutation, useRequestReviewMutation } from '../store/api/blogApi';
import { useGetProfileQuery } from '../store/api/userApi';
import { RootState } from '../store';
import { Button, Panel, Field, Input } from '../components/tui/Primitives';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Mermaid } from '../components/ui/Mermaid';

const ReviseModal = ({ isOpen, onClose, onRevise, isRevising }: any) => {
  const [instruction, setInstruction] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-bg/90 flex items-center justify-center z-50 p-4">
      <Panel title="Revise with AI" className="max-w-md w-full">
        <p className="text-secondary text-xs uppercase tracking-widest mb-6">Tell the AI how to rewrite this blog.</p>
        <Field label="Instructions">
          <textarea
            className="tui-input min-h-[100px] resize-none"
            placeholder="e.g. Make the tone more professional and add a conclusion section."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            disabled={isRevising}
          />
        </Field>
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button variant="ghost" onClick={onClose} disabled={isRevising}>Cancel</Button>
          <Button variant="accent" onClick={() => onRevise(instruction)} disabled={!instruction.trim() || isRevising}>
            {isRevising ? 'Revising...' : 'Submit'}
          </Button>
        </div>
      </Panel>
    </div>
  );
};

const PublishModal = ({ isOpen, onClose, onPublish, initialSeoDesc, initialKeywords, initialCategory }: any) => {
  const [seoDescInput, setSeoDescInput] = useState('');
  const [seoKeywordsInput, setSeoKeywordsInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSeoDescInput(initialSeoDesc || '');
      setSeoKeywordsInput(initialKeywords || '');
      setCategoryInput(initialCategory || 'Technology');
    }
  }, [isOpen, initialSeoDesc, initialKeywords, initialCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-bg/90 flex items-center justify-center z-50 p-4">
      <Panel title={initialSeoDesc ? "Update Metadata" : "Publish / Request Review"} className="max-w-md w-full">
        <p className="text-secondary text-xs uppercase tracking-widest mb-6">Review metadata before going live.</p>
        <Field label="SEO Description">
          <textarea
            className="tui-input min-h-[80px] resize-none"
            placeholder="e.g. Learn how AI is revolutionizing..."
            value={seoDescInput}
            onChange={(e) => setSeoDescInput(e.target.value)}
          />
        </Field>
        <Field label="SEO Keywords (Comma separated)">
          <Input
            placeholder="e.g. AI, Fast Food, 2026"
            value={seoKeywordsInput}
            onChange={(e: any) => setSeoKeywordsInput(e.target.value)}
          />
        </Field>
        <Field label="Category">
          <select className="tui-input cursor-pointer" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}>
            <option value="Technology">Technology</option>
            <option value="Food blogs">Food blogs</option>
            <option value="Travel blogs">Travel blogs</option>
            <option value="Health and fitness blogs">Health and fitness blogs</option>
            <option value="Lifestyle blogs">Lifestyle blogs</option>
            <option value="Fashion and beauty blogs">Fashion and beauty blogs</option>
            <option value="Photography blogs">Photography blogs</option>
            <option value="Personal blogs">Personal blogs</option>
            <option value="DIY craft blogs">DIY craft blogs</option>
            <option value="Parenting blogs">Parenting blogs</option>
            <option value="Music blogs">Music blogs</option>
            <option value="Business blogs">Business blogs</option>
            <option value="Art and design blogs">Art and design blogs</option>
            <option value="Book and writing blogs">Book and writing blogs</option>
            <option value="Personal finance blogs">Personal finance blogs</option>
            <option value="Interior design blogs">Interior design blogs</option>
            <option value="Sports blogs">Sports blogs</option>
            <option value="News blogs">News blogs</option>
            <option value="Movie blogs">Movie blogs</option>
            <option value="Religion blogs">Religion blogs</option>
            <option value="Political blogs">Political blogs</option>
            <option value="AI">AI</option>
            <option value="Engineering">Engineering</option>
          </select>
        </Field>
        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="accent" onClick={() => onPublish(seoDescInput, seoKeywordsInput, categoryInput)} disabled={!seoDescInput.trim() || !categoryInput.trim()}>
            {initialSeoDesc ? 'Update' : 'Confirm'}
          </Button>
        </div>
      </Panel>
    </div>
  );
};


export const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: blogs, isLoading } = useGetUserBlogsQuery();
  const draft = blogs?.find(b => b.id === id);
  
  const [updateBlog] = useUpdateBlogMutation();
  const [publishMyBlog] = usePublishMyBlogMutation();
  const [requestReview] = useRequestReviewMutation();
  const [reviseBlog] = useReviseBlogMutation();
  
  const { data: profile } = useGetProfileQuery();
  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'MASTER_ADMIN';

  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  
  const [showSeoModal, setShowSeoModal] = useState(false);

  const [showReviseModal, setShowReviseModal] = useState(false);
  const [revising, setRevising] = useState(false);

  useEffect(() => {
    if (draft && !content && !title) {
      setContent(draft.rawMarkdown || '');
      setTitle(draft.title || '');
    }
  }, [draft]);

  if (isLoading) return <div className="text-secondary tracking-widest text-sm text-center py-20 uppercase">Loading draft...</div>;
  if (!draft) return <div className="text-danger tracking-widest text-sm text-center py-20 uppercase">Draft not found</div>;

  const handleSaveDraft = async () => {
    setSaving(true);
    await updateBlog({ id: draft.id, rawMarkdown: content, title });
    setSaving(false);
    navigate('/dashboard');
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase() || 'blog'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRevise = async (instruction: string) => {
    setRevising(true);
    try {
      await updateBlog({ id: draft.id, rawMarkdown: content, title }).unwrap();
      const res = await reviseBlog({ id: draft.id, instruction }).unwrap();
      setContent(res.rawMarkdown);
      setShowReviseModal(false);
    } catch (e) {
      alert("Revision failed.");
    } finally {
      setRevising(false);
    }
  };

  const handlePublishClick = () => {
    setShowSeoModal(true);
  };

  const confirmPublish = async (desc: string, keywords: string, cat: string) => {
    if (!desc.trim() || !cat.trim()) return;
    try {
      await updateBlog({ id: draft.id, rawMarkdown: content, title }).unwrap();
      if (isAdmin) {
        await publishMyBlog({ id: draft.id, seoDescription: desc, seoKeywords: keywords, category: cat }).unwrap();
        alert(draft.status === 'PUBLISHED' ? 'Metadata updated!' : 'Blog published!');
      } else {
        await requestReview({ id: draft.id, seoDescription: desc, seoKeywords: keywords, category: cat }).unwrap();
        alert('Review requested successfully!');
      }
      setShowSeoModal(false);
      navigate(isAdmin ? '/author-dashboard' : '/dashboard');
    } catch (e: any) {
      console.error(e);
      alert('Failed to process request: ' + (e?.data?.message || 'Internal Server Error'));
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[95%] mx-auto h-[calc(100vh-64px)] px-4 font-mono text-sm [--tw-accent:theme(colors.warning)] py-4">
      <div className="flex justify-between items-center mb-2">
        <Button variant="ghost" onClick={() => navigate(-1)} icon="←">Back</Button>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleExport} icon="↓">Export</Button>
          <Button variant="ghost" onClick={() => setShowReviseModal(true)} icon="✧">Revise</Button>
          <Button variant="ghost" onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          {isAdmin ? (
            <Button variant="accent" onClick={handlePublishClick} icon="▸">
              {draft.status === 'PUBLISHED' ? 'Update Meta' : 'Publish'}
            </Button>
          ) : (
            (draft.status === 'DRAFT' || draft.status === 'REJECTED') && (
              <Button variant="accent" onClick={handlePublishClick} icon="▸">
                Request Review
              </Button>
            )
          )}
          {!isAdmin && draft.status === 'IN_REVIEW' && (
            <Button variant="ghost" disabled icon="⏳">In Review</Button>
          )}
        </div>
      </div>
      
      <div className="border-b border-border pb-2 w-full flex items-center">
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="text-xl font-bold text-fg uppercase tracking-widest w-full bg-transparent border-none focus:outline-none focus:ring-0 px-0" 
          placeholder="Untitled Draft"
        />
        <p className="text-secondary text-xs uppercase tracking-widest whitespace-nowrap ml-4">Topic: {draft.topic}</p>
      </div>
      
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="relative border border-border bg-surface h-full flex flex-col mt-4 min-h-0">
          <span className="absolute -top-2.5 left-4 bg-bg px-2 text-fg font-bold">Markdown Editor</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 min-h-0 w-full p-6 bg-bg text-fg font-mono text-sm resize-none focus:outline-none focus:border-accent border-none transition-all overflow-y-auto"
            placeholder="Start writing..."
          />
        </div>
        
        <div className="relative border border-border bg-surface h-full flex flex-col mt-4 min-h-0">
          <span className="absolute -top-2.5 left-4 bg-bg px-2 text-fg font-bold">Live Preview</span>
          <div className="flex-1 min-h-0 w-full p-6 overflow-y-auto prose prose-sm prose-invert prose-slate prose-headings:font-bold prose-headings:text-fg prose-a:text-accent prose-p:text-fg prose-img:max-w-full max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  if (!inline && match && match[1] === 'mermaid') {
                    return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                  }
                  return !inline && match ? (
                    <div className="border border-border my-6">
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ margin: 0, background: 'var(--color-bg)' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-bg border border-border px-1.5 py-0.5 rounded-sm text-sm" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content || '*Nothing to preview...*'}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <PublishModal 
        isOpen={showSeoModal} 
        onClose={() => setShowSeoModal(false)} 
        onPublish={confirmPublish} 
        initialSeoDesc={draft.seoDescription}
        initialKeywords={draft.seoKeywords}
        initialCategory={draft.category}
      />

      <ReviseModal 
        isOpen={showReviseModal} 
        onClose={() => setShowReviseModal(false)} 
        onRevise={handleRevise} 
        isRevising={revising} 
      />
    </div>
  );
};
