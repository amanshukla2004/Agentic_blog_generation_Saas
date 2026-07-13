import React from 'react';
import { useGetReviewRequestsQuery, useAcceptReviewMutation, useRejectReviewMutation } from '../../store/api/masterApi';
import { Table, StatusBadge, Button, TuiShimmer } from '../../components/tui/Primitives';
import { useNavigate } from 'react-router-dom';

export const ReviewsTab: React.FC = () => {
  const navigate = useNavigate();
  const { data: reviewRequests, isLoading: reviewsLoading, refetch } = useGetReviewRequestsQuery();
  const [acceptReview] = useAcceptReviewMutation();
  const [rejectReview] = useRejectReviewMutation();

  const handleAcceptReview = async (id: string) => {
    await acceptReview(id);
    refetch();
  };

  const handleRejectReview = async (id: string) => {
    const reason = window.prompt("Enter reason for rejection (optional):");
    if (reason !== null) {
      await rejectReview(id);
      refetch();
    }
  };

  const reviewColumns = ["Title", "Author", "Status", "Created At", "Actions"];
  
  const renderReviewRow = (blog: any) => (
    <>
      <td className="px-4 py-3 min-w-[200px]">
        <div className="font-bold">{blog.title}</div>
        <div className="text-[10px] text-secondary truncate max-w-[300px]">{blog.slug || 'N/A'}</div>
      </td>
      <td className="px-4 py-3 text-secondary">{blog.authorEmail}</td>
      <td className="px-4 py-3">
        <StatusBadge status="WARNING">
          IN REVIEW
        </StatusBadge>
      </td>
      <td className="px-4 py-3 text-secondary text-xs">{new Date(blog.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3 flex gap-2">
        <Button variant="ghost" onClick={() => navigate(`/blog/${blog.slug}`)} className="text-[10px] px-2 py-1 h-auto">View Draft</Button>
        <Button variant="accent" onClick={() => handleAcceptReview(blog.id)} className="text-[10px] px-2 py-1 h-auto">Accept</Button>
        <Button variant="danger" onClick={() => handleRejectReview(blog.id)} className="text-[10px] px-2 py-1 h-auto">Reject</Button>
      </td>
    </>
  );

  return (
    <div className="w-full font-mono text-sm">
      {reviewsLoading ? (
        <div className="py-8">
          <TuiShimmer width={60} />
          <p className="text-secondary mt-2 text-xs uppercase tracking-widest">Loading reviews...</p>
        </div>
      ) : (
        <Table columns={reviewColumns} data={reviewRequests || []} renderRow={renderReviewRow} />
      )}
    </div>
  );
};
