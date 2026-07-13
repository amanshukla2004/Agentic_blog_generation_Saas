import React from 'react';
import { useGetAuthorsStatsQuery } from '../../store/api/masterApi';
import { Table, TuiShimmer } from '../../components/tui/Primitives';

export const AuthorsTab: React.FC = () => {
  const { data: authors, isLoading: authorsLoading } = useGetAuthorsStatsQuery();
  
  const authorColumns = ["Email", "Username", "Total Blogs", "Total Views"];
  
  const renderAuthorRow = (author: any) => (
    <>
      <td className="px-4 py-3">{author.email}</td>
      <td className="px-4 py-3 text-secondary">{author.username || 'N/A'}</td>
      <td className="px-4 py-3">{author.totalBlogs}</td>
      <td className="px-4 py-3">{author.totalViews}</td>
    </>
  );

  return (
    <div className="w-full font-mono text-sm">
      {authorsLoading ? (
        <div className="py-8">
          <TuiShimmer width={60} />
          <p className="text-secondary mt-2 text-xs uppercase tracking-widest">Loading author stats...</p>
        </div>
      ) : (
        <Table columns={authorColumns} data={authors || []} renderRow={renderAuthorRow} />
      )}
    </div>
  );
};
