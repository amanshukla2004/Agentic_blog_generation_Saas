import React, { useState, useEffect } from 'react';
import { useGetProfileQuery, useUpdateProfileMutation } from '../store/api/userApi';
import { useGetMyBookmarksQuery } from '../store/api/blogApi';
import { Button, Panel, Field, Input } from '../components/tui/Primitives';
import { Link } from 'react-router-dom';

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
  
  if (isLoading) return <div className="text-secondary tracking-widest text-sm text-center py-20 uppercase">Loading Profile...</div>;
  if (!profile) return <div className="text-danger tracking-widest text-sm text-center py-20 uppercase">Failed to load profile.</div>;
  
  const handleSave = async () => {
    await updateProfile({ username, bio });
    setIsEditing(false);
  };
  
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 font-mono text-sm">
      <Panel title="User Profile">
        <div className="flex justify-between items-start mb-8 pb-4 border-b border-border">
          <div>
            <h1 className="text-xl font-bold text-fg mb-1">{profile.email}</h1>
            <p className="text-secondary text-xs uppercase tracking-widest">Manage your details</p>
          </div>
          {!isEditing ? (
            <Button variant="ghost" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save</Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-6">
          <Field label="Username">
            {isEditing ? (
              <Input 
                value={username} 
                onChange={(e: any) => setUsername(e.target.value)}
                placeholder="Set a username"
              />
            ) : (
              <div className="text-fg">{profile.username || <span className="text-secondary italic">Not set</span>}</div>
            )}
          </Field>
          
          <Field label="Bio">
            {isEditing ? (
              <textarea 
                className="tui-input min-h-[120px] resize-none" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <div className="text-fg whitespace-pre-wrap">{profile.bio || <span className="text-secondary italic">No bio provided</span>}</div>
            )}
          </Field>
          
          <div className="pt-6 mt-2 border-t border-border grid grid-cols-2 gap-4">
            <Field label="Role">
              <div className="text-accent font-bold uppercase tracking-widest">{profile.role === 'ADMIN' ? 'AUTHOR' : profile.role.replace('_', ' ')}</div>
            </Field>
            <Field label="Subscription">
              <div className="text-fg uppercase tracking-widest">{profile.subscriptionTier}</div>
            </Field>
            <Field label="Generations">
              <div className="text-fg uppercase tracking-widest">{profile.generationsCount} / {profile.generationsLimit || 6}</div>
            </Field>
          </div>
          
          
        </div>
      </Panel>

      <div className="mt-8">
        <Panel title="My Bookmarks">
          {bookmarksLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-surface border border-border w-3/4"></div>
              <div className="h-4 bg-surface border border-border w-1/2"></div>
            </div>
          ) : bookmarks?.content && bookmarks.content.length > 0 ? (
            <ul className="space-y-4">
              {bookmarks.content.map(blog => (
                <li key={blog.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <Link to={`/blog/${blog.slug}`} className="block group">
                    <h3 className="text-base font-bold text-fg group-hover:text-accent transition-colors mb-1">{blog.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-secondary tracking-widest uppercase">
                      <span>{blog.authorUsername || blog.authorEmail?.split('@')[0]}</span>
                      <span>•</span>
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary text-xs tracking-widest uppercase">You haven't bookmarked any articles yet.</p>
          )}
        </Panel>
      </div>
    </div>
  );
};
