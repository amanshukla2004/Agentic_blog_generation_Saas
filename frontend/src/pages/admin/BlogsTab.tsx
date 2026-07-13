import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useGetAllBlogsQuery, 
  useToggleStaffPickMutation, 
  useDeleteBlogMutation,
  useBulkDeleteBlogsMutation
} from '../../store/api/masterApi';
import { Button, Table, StatusBadge, TuiPagination, TuiCheckbox, Input, TuiShimmer } from '../../components/tui/Primitives';

export const BlogsTab: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: blogsData, isLoading: blogsLoading, refetch } = useGetAllBlogsQuery({ 
    page, 
    size: 15,
    search: searchQuery
  });

  const [toggleStaffPick] = useToggleStaffPickMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [bulkDelete] = useBulkDeleteBlogsMutation();

  const handleToggleStaffPick = async (id: string, currentStatus: boolean) => {
    await toggleStaffPick({ id, isStaffPick: !currentStatus });
    refetch();
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm("Are you sure you want to completely delete this blog? This action cannot be undone.")) {
      await deleteBlog(id);
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      refetch();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} blogs?`)) {
      await bulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
      refetch();
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!blogsData) return;
    if (checked) {
      setSelectedIds(new Set(blogsData.content.map(b => b.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const blogColumns = [
    <TuiCheckbox 
      key="select-all"
      checked={blogsData && blogsData.content.length > 0 && selectedIds.size === blogsData.content.length} 
      onChange={handleSelectAll} 
    />,
    "Title", 
    "Author", 
    "Status", 
    "Views", 
    "Created At", 
    "Actions"
  ];

  const renderBlogRow = (blog: any) => (
    <>
      <td className="px-4 py-3 w-10">
        <TuiCheckbox 
          checked={selectedIds.has(blog.id)} 
          onChange={(checked: boolean) => handleSelectOne(blog.id, checked)} 
        />
      </td>
      <td className="px-4 py-3 min-w-[200px]">
        <div className="font-bold text-fg">{blog.title}</div>
        <div className="text-[10px] text-secondary truncate max-w-[300px]">{blog.slug}</div>
      </td>
      <td className="px-4 py-3 text-secondary">{blog.authorEmail}</td>
      <td className="px-4 py-3">
        <StatusBadge status={blog.status === 'PUBLISHED' ? 'SUCCESS' : blog.status === 'FAILED' ? 'ERROR' : 'WARNING'}>
          {blog.status}
        </StatusBadge>
      </td>
      <td className="px-4 py-3 text-secondary">{blog.viewCount || 0}</td>
      <td className="px-4 py-3 text-secondary text-xs">{new Date(blog.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3 flex gap-2">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/blog/${blog.slug}`)}
          className="text-[10px] px-2 py-1 h-auto"
          disabled={blog.status !== 'PUBLISHED'}
        >
          View
        </Button>
        <Button 
          variant={blog.isStaffPick ? "accent" : "ghost"} 
          onClick={() => handleToggleStaffPick(blog.id, blog.isStaffPick)} 
          className="text-[10px] px-2 py-1 h-auto"
          disabled={blog.status !== 'PUBLISHED'}
        >
          {blog.isStaffPick ? 'Unpick' : 'Pick'}
        </Button>
        <Button 
          variant="danger" 
          onClick={() => handleDeleteBlog(blog.id)} 
          className="text-[10px] px-2 py-1 h-auto"
        >
          Delete
        </Button>
      </td>
    </>
  );

  return (
    <div className="w-full font-mono text-sm">
      
      {/* Controls Bar */}
      <div className="mb-6 flex justify-between items-end">
        <div className="w-full max-w-md">
          <Input 
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e: any) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
          />
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex gap-4 items-center bg-surface border border-border px-4 py-2">
            <span className="text-secondary font-bold text-xs uppercase tracking-widest">{selectedIds.size} Selected</span>
            <Button variant="danger" onClick={handleBulkDelete} className="text-xs py-1">
              Bulk Delete
            </Button>
          </div>
        )}
      </div>
      
      {blogsLoading ? (
         <div className="py-8">
           <TuiShimmer width={60} />
           <p className="text-secondary mt-2 text-xs uppercase tracking-widest">Querying Blog Database...</p>
         </div>
      ) : (
        <>
          <Table 
            columns={blogColumns} 
            data={blogsData?.content || []} 
            renderRow={renderBlogRow} 
          />
          {blogsData && blogsData.totalPages > 1 && (
            <div className="mt-4 flex justify-end">
              <TuiPagination 
                currentPage={blogsData.number} 
                totalPages={blogsData.totalPages} 
                onPageChange={(p: number) => setPage(p)} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
