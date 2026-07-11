import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfileMutation, useLazyCheckUsernameQuery } from '../store/api/userApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export const Onboarding: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();
  const [checkUsername, { isFetching: checkingUsername }] = useLazyCheckUsernameQuery();
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

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
    if (val.length > 2) {
      checkUsername(val).then(({ data }) => setIsUsernameAvailable(data?.available ?? null));
    } else {
      setIsUsernameAvailable(null);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 font-mono text-sm [--tw-accent:theme(colors.accent)]">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-fg mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent to-fg">Welcome to blogWho</h1>
          <p className="text-sm text-secondary uppercase tracking-widest">Let's set up your profile before you start writing.</p>
        </div>
        <Card className="p-8 md:p-10 border border-border shadow-xl rounded-2xl bg-surface/80 backdrop-blur-sm">

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest font-bold text-fg">Display Name <span className="text-danger">*</span></label>
            <Input 
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              className="w-full bg-bg border-border focus:border-accent"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest font-bold text-fg">Username <span className="text-danger">*</span></label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-secondary font-medium select-none">@</span>
              <input 
                type="text"
                placeholder="janedoe"
                value={username}
                onChange={handleUsernameChange}
                required
                className={`w-full pl-8 pr-12 py-3 bg-bg border ${isUsernameAvailable === false ? 'border-danger' : isUsernameAvailable === true ? 'border-success' : 'border-border'} text-fg text-sm focus:outline-none focus:border-accent transition-all`}
              />
              {checkingUsername && <span className="absolute right-3 text-secondary text-xs uppercase">Wait</span>}
              {!checkingUsername && isUsernameAvailable === true && <span className="absolute right-3 text-success text-xs">OK</span>}
              {!checkingUsername && isUsernameAvailable === false && <span className="absolute right-3 text-danger text-xs">TAKEN</span>}
            </div>
            {isUsernameAvailable === false && <p className="text-danger text-xs uppercase tracking-widest mt-1">Username is already taken.</p>}
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-widest font-bold text-fg">Short Bio <span className="text-danger">*</span></label>
            <textarea 
              rows={4}
              placeholder="Software Engineer, writer, and tech enthusiast."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required
              className="w-full px-4 py-3 bg-bg border border-border text-fg text-sm rounded-md focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all resize-none"
            />
          </div>

          {error && <p className="text-danger text-xs uppercase tracking-widest text-center mt-2">Failed to save profile. Please try again.</p>}

          <Button type="submit" disabled={isLoading || isUsernameAvailable === false || username.length < 3} className="w-full mt-6 py-4 uppercase tracking-widest">
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </form>
        </Card>
      </div>
    </div>
  );
};
