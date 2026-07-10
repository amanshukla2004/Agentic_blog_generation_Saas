import React, { useState, useEffect } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '../store/api/userApi';
import { useGetMyBookmarksQuery } from '../store/api/blogApi';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Bookmark as BookmarkIcon } from 'lucide-react';

export const Profile = () => {
  const { data: profile, isLoading } = useGetProfileQuery();
  const { data: bookmarks, isLoading: bookmarksLoading } = useGetMyBookmarksQuery({ page: 0, size: 20 });
  const [updateProfile] = useUpdateProfileMutation();
  
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setBio(profile.bio || '');
    }
  }, [profile]);
  
  if (isLoading) return <div className="text-center py-20 animate-pulse headline-md">Loading Profile...</div>;
  if (!profile) return <div className="text-center py-20 text-error headline-md">Failed to load profile.</div>;
  
  const handleSave = async () => {
    await updateProfile({ username, bio });
    setIsEditing(false);
  };
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-surface rounded-xl border border-muted p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-muted">
          <h1 className="headline-display">User Profile</h1>
          {!isEditing ? (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save</Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-6">
          <div>
            <label className="label-sm uppercase tracking-widest text-on-surface/50 mb-2 block">Email</label>
            <div className="body-lg">{profile.email}</div>
          </div>
          
          <div>
            <label className="label-sm uppercase tracking-widest text-on-surface/50 mb-2 block">Username</label>
            {isEditing ? (
              <input 
                type="text" 
                className="input-field w-full max-w-md" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Set a username"
              />
            ) : (
              <div className="body-lg">{profile.username || <span className="italic text-on-surface/50">Not set</span>}</div>
            )}
          </div>
          
          <div>
            <label className="label-sm uppercase tracking-widest text-on-surface/50 mb-2 block">Bio</label>
            {isEditing ? (
              <textarea 
                className="input-field w-full h-32 resize-none" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <div className="body-lg whitespace-pre-wrap">{profile.bio || <span className="italic text-on-surface/50">No bio provided</span>}</div>
            )}
          </div>
          
          <div className="pt-6 mt-6 border-t border-muted grid grid-cols-2 gap-4">
            <div>
              <label className="label-sm uppercase tracking-widest text-on-surface/50 mb-1 block">Subscription</label>
              <div className="font-mono text-sm px-2 py-1 bg-zinc-100 rounded inline-block">{profile.subscriptionTier}</div>
            </div>
            <div>
              <label className="label-sm uppercase tracking-widest text-on-surface/50 mb-1 block">Generations</label>
              <div className="font-mono text-sm">{profile.generationsCount} / 5</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-muted p-8 shadow-sm mt-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-muted">
          <BookmarkIcon className="text-zinc-500" size={24} />
          <h2 className="headline-display text-2xl">My Bookmarks</h2>
        </div>
        
        {bookmarksLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
          </div>
        ) : bookmarks?.content && bookmarks.content.length > 0 ? (
          <ul className="space-y-4">
            {bookmarks.content.map(blog => (
              <li key={blog.id} className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                <Link to={`/blog/${blog.slug}`} className="block group">
                  <h3 className="text-lg font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">{blog.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mt-2">
                    <span>{blog.authorUsername || blog.authorEmail?.split('@')[0]}</span>
                    <span>•</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-500 text-sm italic">You haven't bookmarked any articles yet.</p>
        )}
      </div>
    </div>
  );
};
