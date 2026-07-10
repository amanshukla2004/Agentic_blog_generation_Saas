import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Bookmark } from 'lucide-react';
import { useToggleBookmarkMutation } from '../../store/api/blogApi';
import { useSelector } from 'react-redux';

export interface BlogCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  category?: string; // Predefined Category (e.g. Technology)
  views: number;
  tags: string[];
  author: string;
  date: string;
  initialBookmarked?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({
  slug,
  title,
  description,
  category = "Technology",
  views,
  tags,
  author,
  date,
  initialBookmarked = false
}) => {
  const [saved, setSaved] = useState(initialBookmarked);
  const [toggleBookmark] = useToggleBookmarkMutation();
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please log in to save bookmarks.");
      return;
    }
    setSaved(!saved);
    toggleBookmark({ blogId: id, isBookmarked: saved });
  };

  return (
    <article className="border-b border-zinc-100 pb-6 mb-6 group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2 font-medium">
          {category && <span className="uppercase tracking-wider">{category}</span>}
          <span>•</span>
          <span>{date}</span>
        </div>
        
        <button 
          onClick={handleBookmarkClick}
          className="text-zinc-400 hover:text-zinc-900 transition-colors active:scale-95"
          aria-label={saved ? "Remove bookmark" : "Save bookmark"}
        >
          <Bookmark size={20} className={`transition-all ${saved ? "fill-current text-zinc-900" : "group-hover:fill-zinc-200"}`} />
        </button>
      </div>

      <Link to={`/blog/${slug}`} className="block">
        <h2 className="text-xl font-bold text-zinc-900 mb-2 line-clamp-2 leading-tight group-hover:text-zinc-600 transition-colors">
          {title}
        </h2>
        <p className="text-sm text-zinc-500 mb-4 line-clamp-3">
          {description}
        </p>
      </Link>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex flex-wrap gap-2">
          {tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="bg-zinc-100 text-zinc-600 text-xs px-2 py-1 rounded-md font-medium">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
          <span>{author}</span>
          <div className="flex items-center gap-1.5" title={`${views} views`}>
            <Eye size={14} />
            <span>{views > 999 ? (views/1000).toFixed(1) + 'k' : views}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
