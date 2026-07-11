import React from 'react';
import { useGetAllBlogsQuery, useDeleteAdminBlogMutation, usePublishBlogMutation } from '../store/api/adminApi';
import { Button, Table, StatusBadge } from '../components/tui/Primitives';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const { data: blogs, isLoading, refetch } = useGetAllBlogsQuery();
  const [deleteBlog] = useDeleteAdminBlogMutation();
  const [publishBlog] = usePublishBlogMutation();
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this blog?')) {
      await deleteBlog(id);
      refetch();
    }
  };

  const handlePublish = (id: string) => {
    // Navigate to the editor for this draft where the admin can 
    // fill in SEO metadata and Category before publishing.
    navigate(`/draft/${id}`);
  };

  const columns = ["Topic / Title", "Author", "Email", "Status", "Created At", "Actions"];

  const renderRow = (blog: any) => (
    <>
      <td className="px-4 py-3">
        <div className="font-bold text-fg mb-1">{blog.title || 'Untitled Draft'}</div>
        <div className="text-secondary uppercase tracking-widest text-[10px]">{blog.topic}</div>
      </td>
      <td className="px-4 py-3 text-secondary tracking-widest uppercase">
        {blog.authorUsername || "Unknown"}
      </td>
      <td className="px-4 py-3 text-secondary tracking-widest">
        {blog.authorEmail || "Unknown"}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={blog.status}>{blog.status}</StatusBadge>
      </td>
      <td className="px-4 py-3 text-secondary tracking-widest uppercase">
        {new Date(blog.createdAt).toLocaleString()}
      </td>
      <td className="px-4 py-3 flex gap-2">
        {blog.status === 'DRAFT' && (
          <Button 
            variant="accent" 
            onClick={() => handlePublish(blog.id)}
            className="text-[10px] px-2 py-1 h-auto"
          >
            Review & Publish
          </Button>
        )}
        <Button 
          variant="danger" 
          onClick={() => handleDelete(blog.id)}
          className="text-[10px] px-2 py-1 h-auto"
        >
          Delete
        </Button>
      </td>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-mono text-sm [--tw-accent:theme(colors.warning)]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-fg uppercase tracking-widest mb-1">Admin Dashboard</h1>
        <p className="text-secondary text-xs uppercase tracking-widest">Platform Blogs Management</p>
      </div>
      
      {isLoading ? (
        <p className="text-secondary uppercase tracking-widest text-xs">Loading platform blogs...</p>
      ) : (
        <Table columns={columns} data={blogs || []} renderRow={renderRow} />
      )}
    </div>
  );
};
