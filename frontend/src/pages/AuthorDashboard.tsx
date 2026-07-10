import React from 'react';
import { useGetUserBlogsQuery } from '../store/api/blogApi';
import { Table, StatusBadge, Button } from '../components/tui/Primitives';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery } from '../store/api/userApi';

export const AuthorDashboard = () => {
  const { data: blogs, isLoading } = useGetUserBlogsQuery();
  const { data: profile } = useGetProfileQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="text-secondary tracking-widest text-sm text-center py-20 uppercase">Loading Author Stats...</div>;
  }

  const publishedBlogs = blogs?.filter(b => b.status === 'PUBLISHED') || [];
  const totalViews = publishedBlogs.reduce((acc, blog) => acc + (blog.viewCount || 0), 0);
  const totalLikes = publishedBlogs.reduce((acc, blog) => acc + (blog.likesCount || 0), 0);

  const columns = ["Title", "Status", "Published At", "Views", "Likes", "Actions"];

  const renderRow = (blog: any) => (
    <>
      <td className="px-4 py-3">
        <div className="font-bold text-fg mb-1">{blog.title || 'Untitled Draft'}</div>
        <div className="text-secondary uppercase tracking-widest text-[10px]">{blog.topic}</div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={blog.status}>{blog.status}</StatusBadge>
      </td>
      <td className="px-4 py-3 text-secondary tracking-widest uppercase">
        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '-'}
      </td>
      <td className="px-4 py-3 text-fg font-bold tracking-widest">
        {blog.viewCount || 0}
      </td>
      <td className="px-4 py-3 text-fg font-bold tracking-widest">
        {blog.likesCount || 0}
      </td>
      <td className="px-4 py-3">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/draft/${blog.id}`)}
          className="text-[10px] px-2 py-1 h-auto"
        >
          View / Edit
        </Button>
      </td>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono text-sm [--tw-accent:theme(colors.accent)]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-fg uppercase tracking-widest mb-2">Author Analytics Dashboard</h1>
        <p className="text-secondary text-xs uppercase tracking-widest mb-6">Track your portfolio performance</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border border-border p-6 bg-surface flex flex-col justify-center">
            <div className="text-secondary uppercase tracking-widest text-xs mb-2">Total Published Blogs</div>
            <div className="text-4xl text-accent font-bold">{publishedBlogs.length}</div>
          </div>
          <div className="border border-border p-6 bg-surface flex flex-col justify-center">
            <div className="text-secondary uppercase tracking-widest text-xs mb-2">Total Lifetime Views</div>
            <div className="text-4xl text-fg font-bold">{totalViews}</div>
          </div>
          <div className="border border-border p-6 bg-surface flex flex-col justify-center">
            <div className="text-secondary uppercase tracking-widest text-xs mb-2">Total Lifetime Likes</div>
            <div className="text-4xl text-fg font-bold">{totalLikes}</div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-fg uppercase tracking-widest mb-4">Your Portfolio</h2>
        <Table columns={columns} data={blogs || []} renderRow={renderRow} />
      </div>
    </div>
  );
};
