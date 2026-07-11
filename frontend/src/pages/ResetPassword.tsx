import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../store/api/authApi';
import { Button, Panel, Field, Input } from '../components/tui/Primitives';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    try {
      await resetPassword({ token, newPassword: password }).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to reset password:', err);
    }
  };

  if (!token) return null;

  return (
    <div className="flex justify-center items-center h-[calc(100vh-80px)] font-mono text-sm">
      <Panel title="RESET PASSWORD" className="w-full max-w-md mt-0">
        <div className="mb-6 border-b border-border pb-4">
          <h1 className="text-xl font-bold text-fg uppercase tracking-widest">New Password</h1>
        </div>
        
        {submitted ? (
          <div className="text-center">
            <p className="text-accent mb-4">Your password has been successfully reset.</p>
            <Button variant="primary" onClick={() => navigate('/login')}>Login Now</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="New Password">
              <div className="relative flex items-center">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-secondary hover:text-fg outline-none"
                >
                  {showPassword ? '◎' : '◉'}
                </button>
              </div>
            </Field>
            
            <Field label="Confirm Password">
              <div className="relative flex items-center">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </Field>
            
            {error && <p className="text-danger uppercase tracking-widest text-xs mt-2">Failed to reset password. Link may be expired.</p>}
            
            <div className="mt-4 flex justify-end">
              <Button type="submit" variant="primary" disabled={isLoading || !password || password !== confirmPassword}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
};
