import React from 'react';
import { Link } from 'react-router-dom';
import { useGetUserBlogsQuery, useDeleteBlogMutation } from '../store/api/blogApi';
import { useGetProfileQuery } from '../store/api/userApi';
import { Button, Panel, StatusBadge, Progress } from '../components/tui/Primitives';

export const Dashboard = () => {
  const { data: blogs, isLoading, error, refetch } = useGetUserBlogsQuery();
  const { data: profile } = useGetProfileQuery();
  const [deleteBlog] = useDeleteBlogMutation();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to draft
    if (window.confirm('Are you sure you want to delete this draft?')) {
      await deleteBlog(id);
      refetch();
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 py-8 font-mono text-sm [--tw-accent:theme(colors.warning)]">
      <div className="flex justify-between items-end border-b border-border pb-4 w-full">
        <div>
          <h1 className="text-xl font-bold text-fg uppercase tracking-widest mb-1">Publisher Dashboard</h1>
          <p className="text-secondary text-xs uppercase tracking-widest">Manage your generated AI drafts</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {profile && (
            <div className="text-[10px] uppercase tracking-widest flex items-center gap-2">
              <span className="text-secondary">Generations:</span>
              <span className={profile.generationsCount >= (profile.generationsLimit || 6) ? "text-danger font-bold" : "text-accent"}>
                {profile.generationsCount} / {profile.generationsLimit || 6}
              </span>
            </div>
          )}
          <Link to="/generate">
            <Button variant="accent" icon="▸">Generate New Draft</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4">
          <div className="w-1/3 h-48 bg-surface border border-border animate-pulse" />
          <div className="w-1/3 h-48 bg-surface border border-border animate-pulse" />
        </div>
      ) : error ? (
        <div className="text-danger text-xs uppercase tracking-widest">Failed to load drafts.</div>
      ) : blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Panel key={blog.id} className="flex flex-col justify-between h-full group hover:border-accent transition-colors cursor-pointer">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-base font-bold text-fg leading-tight group-hover:text-accent transition-colors line-clamp-2 pr-4">{blog.title || 'Untitled Draft'}</h3>
                  <StatusBadge status={blog.status}>{blog.status}</StatusBadge>
                </div>
                <p className="text-xs text-secondary uppercase tracking-widest mb-4">Topic: {blog.topic}</p>
                <p className="text-sm text-secondary line-clamp-2">{blog.seoDescription || 'No description generated yet.'}</p>
                <div className="flex justify-between items-end mt-4">
                  <div className="text-[10px] text-muted uppercase tracking-widest">
                    {blog.status === 'PUBLISHED' ? 'PUBLISHED: ' : 'CREATED: '} 
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {blog.status === 'PUBLISHED' && (
                    <div className="text-[10px] text-accent uppercase tracking-widest font-bold flex gap-3">
                      <span>{blog.viewCount || 0} VIEWS</span>
                      <span>{blog.likesCount || 0} LIKES</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-auto pt-4 border-t border-border">
                <Link to={`/draft/${blog.id}`} className="flex-1">
                  <Button variant="ghost" className="w-full">Edit Draft</Button>
                </Link>
                <Button variant="danger" onClick={(e: React.MouseEvent) => handleDelete(blog.id, e)}>Delete</Button>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-border bg-surface">
          <p className="text-secondary uppercase tracking-widest text-sm mb-6">No drafts found.</p>
          <Link to="/generate">
            <Button variant="ghost" icon="▸">Start Generating</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
