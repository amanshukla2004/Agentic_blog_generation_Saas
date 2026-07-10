import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useGetBlogBySlugQuery, useGetTrendingBlogsQuery, useGetStaffPicksQuery } from '../store/api/blogApi';
import { Button, Panel } from '../components/tui/Primitives';
import { Mermaid } from '../components/ui/Mermaid';

export const BlogViewer = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading, error } = useGetBlogBySlugQuery(slug || '');
  const { data: trendingData } = useGetTrendingBlogsQuery({ page: 0, size: 20 });
  const { data: staffPicksData } = useGetStaffPicksQuery({ page: 0, size: 5 });
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
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 py-8 font-mono text-sm [--tw-accent:theme(colors.accent)]">
      
      {/* Left Sidebar - Discovery Widgets */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-24 space-y-8">
          <div className="mb-4">
            <Button variant="ghost" onClick={() => navigate(-1)} icon="←">Back</Button>
          </div>
          
          <Panel title="Trending Now">
            <ul className="space-y-4">
              {trendingData?.content.slice(0, 3).map((b: any, idx: number) => (
                <li key={b.id} className="group cursor-pointer">
                  <span className="text-xs font-bold text-secondary mb-1 block">0{idx + 1}</span>
                  <Link to={`/blog/${b.slug}`}>
                    <h4 className="text-sm font-bold text-fg leading-tight group-hover:text-accent transition-colors line-clamp-2">{b.title}</h4>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Staff Picks">
            <ul className="space-y-4">
              {staffPicksData?.content.map((b: any) => (
                <li key={b.id} className="group cursor-pointer">
                  <Link to={`/blog/${b.slug}`}>
                    <h4 className="text-sm font-bold text-fg leading-tight group-hover:text-accent transition-colors line-clamp-2">{b.title}</h4>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </aside>

      {/* Main Content */}
      <main className="col-span-1 lg:col-span-9 lg:pl-8">
        <article className="max-w-3xl">
          <div className="mb-10 lg:hidden">
            <Button variant="ghost" onClick={() => navigate(-1)} icon="←">Back</Button>
          </div>
          
          <header className="mb-12 border-b border-border pb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-fg mb-6 leading-tight">{blog.title}</h1>
        <p className="text-lg text-secondary mb-8">{blog.seoDescription}</p>
        
        <div className="flex flex-wrap gap-4 text-xs text-secondary uppercase tracking-widest items-center">
          <Link to={`/author/${blog.authorUsername || 'unknown'}`} className="font-bold text-fg hover:text-accent transition-colors">
            {blog.authorUsername || blog.authorEmail?.split('@')[0]}
          </Link>
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
      
      <div className="mt-16 pt-8 border-t border-border">
        <h3 className="text-secondary text-xs uppercase tracking-widest mb-4">Article Tags</h3>
        <div className="flex gap-2 flex-wrap mb-10">
          <Link to={`/?category=${encodeURIComponent(blog.category || 'Technology')}`} className="border border-border text-accent hover:bg-accent hover:text-bg transition-colors px-3 py-1 uppercase tracking-widest text-xs">
            {blog.category || 'Technology'}
          </Link>
          {blog.tags?.map((tag: string, idx: number) => (
            <span key={idx} className="border border-border text-secondary px-3 py-1 uppercase tracking-widest text-xs">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-secondary text-xs uppercase tracking-widest mb-4 border-t border-border pt-8">Explore All Categories</h3>
        <div className="flex gap-2 flex-wrap">
          {['Technology', 'Food blogs', 'Travel blogs', 'Health and fitness blogs', 'Lifestyle blogs', 'Fashion and beauty blogs', 'Photography blogs', 'Personal blogs', 'DIY craft blogs', 'Parenting blogs', 'Music blogs', 'Business blogs', 'Art and design blogs', 'Book and writing blogs', 'Personal finance blogs', 'Interior design blogs', 'Sports blogs', 'News blogs', 'Movie blogs', 'Religion blogs', 'Political blogs', 'AI', 'Engineering'].map(cat => (
            <Link key={cat} to={`/?category=${encodeURIComponent(cat)}`} className="text-secondary hover:text-accent transition-colors px-2 py-1 text-xs font-bold">
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </article>
  </main>
</div>
  );
};
