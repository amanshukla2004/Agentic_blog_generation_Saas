import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetUserBlogsQuery, useUpdateBlogMutation } from '../store/api/blogApi';
import { usePublishBlogMutation } from '../store/api/adminApi';
import { RootState } from '../store';
import { Button } from '../components/ui/Button';

// TipTap imports
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import Placeholder from '@tiptap/extension-placeholder';

export const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: blogs, isLoading } = useGetUserBlogsQuery();
  const draft = blogs?.find(b => b.id === id);
  
  const [updateBlog] = useUpdateBlogMutation();
  const [publishBlog] = usePublishBlogMutation();
  
  const userRole = useSelector((state: RootState) => state.auth.role);
  const isAdmin = userRole?.includes('ADMIN') || userRole?.includes('MASTER_ADMIN');

  const [saving, setSaving] = useState(false);
  
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [seoDescInput, setSeoDescInput] = useState('');
  const [seoKeywordsInput, setSeoKeywordsInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Placeholder.configure({
        placeholder: 'Start writing your epic blog post...',
      }),
    ],
    content: draft?.rawMarkdown || '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none w-full min-h-[500px] focus:outline-none bg-surface text-on-surface p-8',
      },
    },
  });

  useEffect(() => {
    if (draft && editor && editor.getHTML() === '<p></p>' && draft.rawMarkdown) {
      editor.commands.setContent(draft.rawMarkdown);
    }
  }, [draft, editor]);

  if (isLoading) return <div className="animate-pulse text-center mt-20 headline-md">Loading draft...</div>;
  if (!draft) return <div className="text-center mt-20 headline-lg text-error">Draft not found</div>;

  const handleSaveDraft = async () => {
    if (!editor) return;
    setSaving(true);
    const rawMarkdown = (editor.storage as any).markdown.getMarkdown();
    await updateBlog({ id: draft.id, rawMarkdown });
    setSaving(false);
    alert('Draft saved successfully!');
  };

  const handlePublishClick = () => {
    if (!isAdmin) return;
    setSeoDescInput(draft.seoDescription || '');
    setSeoKeywordsInput(draft.seoKeywords || '');
    setCategoryInput(draft.category || 'Technology');
    setShowSeoModal(true);
  };

  const confirmPublish = async () => {
    if (!isAdmin || !seoDescInput.trim() || !categoryInput.trim()) return;
    await publishBlog({ id: draft.id, seoDescription: seoDescInput, seoKeywords: seoKeywordsInput, category: categoryInput });
    setShowSeoModal(false);
    alert('Blog published!');
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto h-[calc(100vh-140px)] px-4">
      <div className="flex justify-between items-center py-4 border-b border-muted">
        <div>
          <h1 className="headline-lg text-zinc-900">{draft.title || 'Untitled Draft'}</h1>
          <p className="text-sm text-zinc-500 font-mono mt-1">{draft.topic}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          {isAdmin && draft.status === 'DRAFT' && (
            <Button variant="primary" onClick={handlePublishClick}>
              Publish
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="w-full h-full border border-muted rounded-xl bg-surface overflow-hidden shadow-sm flex flex-col">
          <div className="bg-tertiary px-4 py-2 border-b border-muted label-sm uppercase tracking-widest text-secondary flex justify-between">
            <span>WYSIWYG Editor (Markdown Output)</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} className="w-full h-full" />
          </div>
        </div>
      </div>

      {showSeoModal && (
        <div className="fixed inset-0 bg-secondary/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl p-8 max-w-md w-full shadow-2xl border border-muted">
            <h2 className="headline-md mb-2">Publish Article</h2>
            <p className="body-sm text-on-surface/70 mb-6">Provide a short, catchy SEO description. This will be used in meta tags and public feeds.</p>
            
            <textarea
              className="w-full bg-tertiary text-on-surface border border-muted rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary focus:border-secondary transition-shadow mb-4 resize-none"
              rows={3}
              placeholder="e.g. Learn how AI is revolutionizing the fast-food industry in 2026..."
              value={seoDescInput}
              onChange={(e) => setSeoDescInput(e.target.value)}
            />
            
            <p className="body-sm text-on-surface/70 mb-2">SEO Keywords (Comma separated)</p>
            <input
              type="text"
              className="w-full bg-tertiary text-on-surface border border-muted rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary focus:border-secondary transition-shadow mb-4"
              placeholder="e.g. AI, Fast Food, 2026"
              value={seoKeywordsInput}
              onChange={(e) => setSeoKeywordsInput(e.target.value)}
            />

            <p className="body-sm text-on-surface/70 mb-2">Category</p>
            <select
              className="w-full bg-tertiary text-on-surface border border-muted rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary focus:border-secondary transition-shadow mb-6"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
            >
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
            
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowSeoModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmPublish} disabled={!seoDescInput.trim()}>
                Confirm Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
