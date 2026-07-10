import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfileMutation } from '../store/api/userApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Onboarding: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In the backend User entity we only have username and bio currently, but we can send what we have.
      await updateProfile({ username, bio }).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <Card className="w-full max-w-lg p-8 md:p-12 border border-zinc-200 shadow-sm rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Welcome to AgenticBlog</h1>
          <p className="text-sm text-zinc-500 font-medium">Let's set up your profile before you start writing.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Display Name</label>
            <Input 
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Username</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-zinc-400 font-medium select-none">@</span>
              <input 
                type="text"
                placeholder="janedoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-900">Short Bio</label>
            <textarea 
              rows={3}
              placeholder="Software Engineer, writer, and tech enthusiast."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none"
            />
          </div>

          {error && <p className="text-red-600 text-sm font-medium text-center">Failed to save profile. Please try again.</p>}

          <Button type="submit" disabled={isLoading} className="w-full mt-4 bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95 transition-all py-2.5 rounded-md font-semibold">
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
