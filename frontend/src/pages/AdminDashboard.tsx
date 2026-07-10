import React from 'react';
import { useGetAllBlogsQuery, useDeleteAdminBlogMutation, usePublishBlogMutation } from '../store/api/adminApi';
import { Button } from '../components/ui/Button';

export const AdminDashboard = () => {
  const { data: blogs, isLoading, refetch } = useGetAllBlogsQuery();
  const [deleteBlog] = useDeleteAdminBlogMutation();
  const [publishBlog] = usePublishBlogMutation();

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this blog?')) {
      await deleteBlog(id);
      refetch();
    }
  };

  const handlePublish = async (id: string) => {
    const seoDesc = window.prompt('Enter an SEO description for this post:');
    if (seoDesc !== null) {
      await publishBlog({ id, seoDescription: seoDesc });
      refetch();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-zinc-900 mb-8">Admin Dashboard - Blogs</h1>
      
      {isLoading ? (
        <p className="text-zinc-500 font-mono">Loading platform blogs...</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-900">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="pb-3 font-medium">Topic / Title</th>
                <th className="pb-3 font-medium">Author</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Created At</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs?.map((blog) => (
                <tr key={blog.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4">
                    <div className="font-medium">{blog.title || 'Untitled Draft'}</div>
                    <div className="text-zinc-500 font-mono text-xs mt-1">{blog.topic}</div>
                  </td>
                  <td className="py-4 text-zinc-700 text-sm">
                    {blog.authorEmail}
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded ${blog.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-700'}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-xs text-zinc-500">
                    {new Date(blog.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 text-right space-x-2">
                    {blog.status === 'DRAFT' && (
                      <button 
                        onClick={() => handlePublish(blog.id)}
                        className="text-xs font-medium px-3 py-1.5 border border-zinc-200 rounded text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-transform whitespace-nowrap"
                      >
                        Publish
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(blog.id)}
                      className="text-xs font-medium px-3 py-1.5 border border-red-200 rounded text-red-700 hover:bg-red-50 active:scale-95 transition-transform whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
