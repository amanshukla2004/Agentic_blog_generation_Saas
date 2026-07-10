import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToggleBookmarkMutation, useToggleStaffPickMutation } from '../../store/api/blogApi';
import { useSelector } from 'react-redux';

export interface BlogCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  category?: string; 
  views: number;
  tags: string[];
  author: string;
  date: string;
  initialBookmarked?: boolean;
  isStaffPick?: boolean;
  coverImage?: string | null;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  id,
  slug,
  title,
  description,
  category = "Technology",
  views,
  tags,
  author,
  date,
  initialBookmarked = false,
  isStaffPick = false,
  coverImage = null
}) => {
  const [saved, setSaved] = useState(initialBookmarked);
  const [staffPickStatus, setStaffPickStatus] = useState(isStaffPick);
  const [toggleBookmark] = useToggleBookmarkMutation();
  const [toggleStaffPick] = useToggleStaffPickMutation();
  const { isAuthenticated, role } = useSelector((state: any) => state.auth);
  const isMasterAdmin = role?.includes('MASTER_ADMIN');

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to save bookmarks.");
      return;
    }
    setSaved(!saved);
    toggleBookmark({ blogId: id, isBookmarked: !saved });
  };

  return (
    <article className="border-b border-border pb-6 mb-6 group flex flex-col font-mono text-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3 mb-2">
          {category && <span className="text-[11px] uppercase tracking-widest text-accent">{category}</span>}
          <span className="text-muted">•</span>
          <span className="text-muted text-[11px] uppercase tracking-widest">{new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {isMasterAdmin && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                setStaffPickStatus(!staffPickStatus);
                toggleStaffPick({ id, isStaffPick: !staffPickStatus });
              }}
              className={`uppercase text-xs tracking-widest transition-colors ${staffPickStatus ? 'text-accent' : 'text-secondary hover:text-fg'}`}
              title={staffPickStatus ? "Remove from Staff Picks" : "Add to Staff Picks"}
            >
              [STAFF PICK]
            </button>
          )}
          <button 
            onClick={handleBookmarkClick}
            className="text-secondary hover:text-fg transition-colors uppercase text-xs tracking-widest"
            aria-label={saved ? "Remove bookmark" : "Save bookmark"}
          >
            {saved ? '[★]' : '[☆]'}
          </button>
        </div>
      </div>

      <Link to={`/blog/${slug}`} className="block group-hover:text-accent transition-colors">
        {coverImage && (
          <div className="mb-4 w-full h-48 border border-border overflow-hidden bg-surface relative group-hover:border-accent transition-colors">
            <img src={coverImage} alt={title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" />
          </div>
        )}
        <h2 className="text-base font-bold text-fg mb-2 leading-tight flex items-center gap-2">
          {title}
          {staffPickStatus && !isMasterAdmin && <span className="text-[10px] bg-accent text-bg px-1 rounded-sm uppercase tracking-widest ml-2">Staff Pick</span>}
        </h2>
        <p className="text-secondary mb-4 line-clamp-3">
          {description}
        </p>
      </Link>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex flex-wrap gap-2">
          {tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="border border-border text-secondary text-[10px] px-1.5 py-0.5 tracking-widest uppercase">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-secondary tracking-widest uppercase">
          <span>{author}</span>
          <div className="flex items-center gap-1.5">
            <span>VIEWS:</span>
            <span>{views > 999 ? (views/1000).toFixed(1) + 'k' : views}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
