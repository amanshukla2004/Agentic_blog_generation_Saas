import React from 'react';
import { Link } from 'react-router-dom';
import { useGetPublicBlogsQuery } from '../store/api/blogApi';
import { Card } from '../components/ui/Card';

export const PublicFeed = () => {
  const { data, isLoading, error } = useGetPublicBlogsQuery({ page: 0, size: 20 });

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto py-12">
      <div className="text-center">
        <h1 className="headline-display mb-4">Discover Amazing Content</h1>
        <p className="body-lg text-on-surface/80 max-w-2xl mx-auto">
          Read the latest AI-generated articles from our network. High-quality, insightful, and always fresh.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="w-full h-64 bg-muted rounded-lg" />
          <div className="w-full h-64 bg-muted rounded-lg" />
        </div>
      ) : error ? (
        <div className="text-error text-center label-lg">Failed to load public feed.</div>
      ) : data?.content && data.content.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.content.map((blog) => (
            <Link key={blog.id} to={`/blog/${blog.slug}`} className="block group">
              <Card className="h-full flex flex-col justify-between group-hover:border-primary transition-colors duration-300">
                <div>
                  <h2 className="headline-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="body-md text-on-surface/80 mb-6 line-clamp-3">
                    {blog.seoDescription}
                  </p>
                </div>
                <div className="flex justify-between items-center text-on-surface/50 label-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-on-surface">{blog.authorEmail}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="uppercase tracking-widest text-primary font-semibold">Read Article →</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-on-surface/50 headline-md">
          No published articles yet.
        </div>
      )}
    </div>
  );
};
