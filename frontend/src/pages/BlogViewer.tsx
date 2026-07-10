import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useGetBlogBySlugQuery } from '../store/api/blogApi';
import { Button } from '../components/ui/Button';
import { Mermaid } from '../components/ui/Mermaid';

export const BlogViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading, error } = useGetBlogBySlugQuery(slug || '');

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
    return <div className="text-center py-20 animate-pulse headline-md">Loading article...</div>;
  }

  if (error || !blog) {
    return (
      <div className="text-center py-20">
        <h1 className="headline-lg text-error mb-4">Article Not Found</h1>
        <Link to="/">
          <Button variant="secondary">Back to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 bg-surface rounded-xl border border-muted my-8">
      <header className="mb-12 border-b border-muted pb-8 text-center">
        <h1 className="headline-display mb-4">{blog.title}</h1>
        <p className="body-lg text-on-surface/70 mb-4">{blog.seoDescription}</p>
        <div className="label-sm text-on-surface/50 uppercase tracking-widest flex items-center justify-center gap-2">
          <span className="font-medium text-on-surface">{blog.authorEmail}</span>
          <span>•</span>
          <span>Published on {new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
      </header>
      
      <div className="prose prose-lg prose-slate prose-headings:font-display prose-a:text-primary max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              
              if (!inline && match && match[1] === 'mermaid') {
                return <Mermaid chart={String(children).replace(/\n$/, '')} />;
              }
              
              return !inline && match ? (
                <SyntaxHighlighter
                  style={oneLight as any}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
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
