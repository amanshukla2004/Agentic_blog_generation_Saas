import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useGetBlogBySlugQuery } from '../store/api/blogApi';
import { Button } from '../components/tui/Primitives';
import { Mermaid } from '../components/ui/Mermaid';

export const BlogViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading, error } = useGetBlogBySlugQuery(slug || '');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (blog) {
      document.title = `${blog.title} | AgenticBlog.`;
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', blog.seoDescription || 'AI Generated Blog');
    }
  }, [blog]);

  if (isLoading) {
    return <div className="text-center py-20 text-secondary uppercase tracking-widest text-sm">Loading article...</div>;
  }

  if (error || !blog) {
    return (
      <div className="text-center py-20 font-mono">
        <h1 className="text-danger text-xl mb-6 uppercase tracking-widest">Article Not Found</h1>
        <Link to="/">
          <Button variant="ghost">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-12 px-4 font-mono [--tw-accent:theme(colors.accent)]">
      <div className="mb-10">
        <Button variant="ghost" onClick={() => navigate(-1)} icon="←">Back</Button>
      </div>
      
      <header className="mb-12 border-b border-border pb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-fg mb-6 leading-tight">{blog.title}</h1>
        <p className="text-lg text-secondary mb-8">{blog.seoDescription}</p>
        
        <div className="flex flex-wrap gap-4 text-xs text-secondary uppercase tracking-widest items-center">
          <span className="font-bold text-fg">{blog.authorUsername || blog.authorEmail?.split('@')[0]}</span>
          <span>•</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          {blog.category && (
            <>
              <span>•</span>
              <span className="text-accent">{blog.category}</span>
            </>
          )}
        </div>
      </header>
      
      <div className="prose prose-lg prose-invert prose-slate prose-headings:font-bold prose-headings:text-fg prose-a:text-accent prose-p:text-fg max-w-none">
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
                    customStyle={{ margin: 0, background: 'var(--color-surface)' }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="bg-surface border border-border px-1.5 py-0.5 rounded-sm text-sm" {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {blog.rawMarkdown}
        </ReactMarkdown>
      </div>
    </article>
  );
};
