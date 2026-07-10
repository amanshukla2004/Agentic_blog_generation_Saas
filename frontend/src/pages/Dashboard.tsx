import React from 'react';
import { Link } from 'react-router-dom';
import { useGetUserBlogsQuery, useDeleteBlogMutation } from '../store/api/blogApi';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const Dashboard = () => {
  const { data: blogs, isLoading, error, refetch } = useGetUserBlogsQuery();
  const [deleteBlog] = useDeleteBlogMutation();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to draft
    if (window.confirm('Are you sure you want to delete this draft?')) {
      await deleteBlog(id);
      refetch();
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex justify-between items-center w-full">
        <div>
          <h1 className="headline-display mb-2">Dashboard</h1>
          <p className="body-lg text-on-surface/80">Manage your generated AI drafts.</p>
        </div>
        <Link to="/generate">
          <Button variant="primary">Generate New Draft</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4 animate-pulse">
          <div className="w-1/3 h-48 bg-muted rounded-lg" />
          <div className="w-1/3 h-48 bg-muted rounded-lg" />
        </div>
      ) : error ? (
        <div className="text-error label-lg">Failed to load drafts.</div>
      ) : blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} className="flex flex-col justify-between hover:border-secondary transition-colors cursor-pointer group">
              <div>
                <h3 className="headline-sm mb-2 group-hover:text-primary transition-colors">{blog.title || 'Untitled Draft'}</h3>
                <p className="body-sm text-on-surface/70 mb-2 font-mono">{blog.topic}</p>
                <p className="body-sm text-on-surface/70 mb-4 line-clamp-2">{blog.seoDescription || 'No description generated yet.'}</p>
                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 label-sm uppercase tracking-widest rounded-sm ${blog.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-surface border border-muted'}`}>
                    {blog.status}
                  </span>
                  <span className="bg-surface border border-muted px-2 py-1 label-sm uppercase tracking-widest rounded-sm">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/draft/${blog.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full h-12">Edit Draft</Button>
                </Link>
                <Button variant="secondary" onClick={(e) => handleDelete(blog.id, e)} className="h-12 px-4 border-error text-error hover:bg-error/10">Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-muted rounded-lg bg-surface">
          <p className="headline-md text-on-surface/50 mb-4">No drafts found.</p>
          <Link to="/generate">
            <Button variant="secondary">Start Generating</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
