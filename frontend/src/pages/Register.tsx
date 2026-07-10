import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Button, Panel, Field, Input } from '../components/tui/Primitives';
import { systemLog } from '../utils/logger';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [register, { isLoading, error }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    systemLog('Register.tsx', 'handleSubmit', `User attempting registration with email: ${email}`);
    try {
      const response = await register({ email, password }).unwrap();
      systemLog('Register.tsx', 'handleSubmit', 'Registration successful, dispatching token to Redux store');
      dispatch(setCredentials({ token: response.token }));
      navigate('/onboarding');
    } catch (err) {
      systemLog('Register.tsx', 'handleSubmit', 'Registration failed');
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-80px)] font-mono text-sm">
      <Panel title="REGISTRATION" className="w-full max-w-md mt-0">
        <div className="mb-6 border-b border-border pb-4">
          <h1 className="text-xl font-bold text-fg uppercase tracking-widest">Create Account</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email">
            <Input 
              type="email" 
              required 
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </Field>
          
          <Field label="Password">
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
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '◎' : '◉'}
              </button>
            </div>
          </Field>
          
          {error && <p className="text-danger uppercase tracking-widest text-xs mt-2">Failed to register</p>}
          
          <div className="mt-4 flex justify-end">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-secondary text-xs uppercase tracking-widest">
            Already a member? <a href="/login" className="text-accent hover:text-fg font-bold">Login</a>
          </p>
        </div>
      </Panel>
    </div>
  );
};
