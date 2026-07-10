import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetAuthorProfileQuery } from '../store/api/blogApi';
import { Button, Panel } from '../components/tui/Primitives';
import { BlogCard } from '../components/feed/BlogCard';

export const AuthorProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useGetAuthorProfileQuery(username || '');

  if (isLoading) {
    return <div className="text-center py-20 text-secondary uppercase tracking-widest text-sm font-mono">Loading author profile...</div>;
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 font-mono">
        <h1 className="text-danger text-xl mb-6 uppercase tracking-widest">Author Not Found</h1>
        <Button variant="ghost" onClick={() => navigate(-1)} icon="←">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-mono [--tw-accent:theme(colors.accent)] text-sm">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} icon="←">Back</Button>
      </div>
      
      <Panel className="mb-12 border-b border-border bg-bg pb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-24 h-24 rounded-full border border-border flex items-center justify-center text-3xl font-bold bg-surface uppercase text-fg">
            {profile.username.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-fg mb-2">@{profile.username}</h1>
            <p className="text-secondary mb-4 max-w-2xl whitespace-pre-wrap">{profile.bio || 'This author has not written a bio yet.'}</p>
            <div className="flex gap-6 text-xs uppercase tracking-widest text-accent font-bold">
              <span>{profile.recentBlogs?.length || 0} POSTS</span>
              <span>{profile.totalViews > 999 ? (profile.totalViews/1000).toFixed(1) + 'k' : profile.totalViews} TOTAL VIEWS</span>
            </div>
          </div>
        </div>
      </Panel>

      <div>
        <h3 className="text-secondary text-xs uppercase tracking-widest mb-8 font-bold border-b border-border pb-2">Author's Timeline</h3>
        
        {profile.recentBlogs && profile.recentBlogs.length > 0 ? (
          <div className="space-y-4">
            {profile.recentBlogs.map((blog: any) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                slug={blog.slug}
                title={blog.title}
                description={blog.seoDescription || "No description provided."}
                category={blog.category}
                views={blog.viewCount || 0}
                tags={blog.tags || []}
                author={profile.username}
                date={blog.createdAt}
                isStaffPick={blog.isStaffPick}
                coverImage={null}
              />
            ))}
          </div>
        ) : (
          <p className="text-secondary text-xs tracking-widest uppercase">No published articles yet.</p>
        )}
      </div>
    </div>
  );
};
