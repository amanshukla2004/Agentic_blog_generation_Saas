import React, { useState } from 'react';
import { useForgotPasswordMutation } from '../store/api/authApi';
import { Button, Panel, Field, Input } from '../components/tui/Primitives';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to request password reset:', err);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-80px)] font-mono text-sm">
      <Panel title="FORGOT PASSWORD" className="w-full max-w-md mt-0">
        <div className="mb-6 border-b border-border pb-4">
          <h1 className="text-xl font-bold text-fg uppercase tracking-widest">Reset Password</h1>
        </div>
        
        {submitted ? (
          <div className="text-center">
            <p className="text-accent mb-4">If an account exists with {email}, a password reset link has been sent.</p>
            <Button variant="ghost" onClick={() => window.location.href = '/login'}>Back to Login</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-secondary mb-2">Enter your email address to receive a password reset link.</p>
            
            <Field label="Email">
              <Input 
                type="email" 
                required 
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </Field>
            
            {error && <p className="text-danger uppercase tracking-widest text-xs mt-2">Failed to request reset. Please try again.</p>}
            
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="ghost" onClick={() => window.location.href = '/login'}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Link'}
              </Button>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
};
