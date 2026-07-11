import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Button, Panel, Field, Input } from '../components/tui/Primitives';
import { systemLog } from '../utils/logger';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setValidationError('Invalid email format');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    systemLog('Login.tsx', 'handleSubmit', `User attempting login with email: ${email}`);
    try {
      const response = await login({ email, password }).unwrap();
      
      systemLog('Login.tsx', 'handleSubmit', 'Login successful, dispatching token to Redux store');
      dispatch(setCredentials({ token: response.token }));
      navigate('/dashboard');
    } catch (err) {
      systemLog('Login.tsx', 'handleSubmit', 'Login failed due to invalid credentials or server error');
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-80px)] font-mono text-sm">
      <Panel title="AUTHENTICATION" className="w-full max-w-md mt-0">
        <div className="mb-6 border-b border-border pb-4">
          <h1 className="text-xl font-bold text-fg uppercase tracking-widest">Login</h1>
        </div>
        
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
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
                  className="absolute right-3 text-secondary hover:text-fg outline-none text-2xl flex items-center h-full"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '◎' : '◉'}
                </button>
              </div>
            </Field>
            
            <div className="text-right">
              <a href="/forgot-password" className="text-xs text-accent hover:text-fg tracking-widest">Forgot Password?</a>
            </div>
            
            {validationError && <p className="text-danger uppercase tracking-widest text-xs mt-2">{validationError}</p>}
            {loginError && <p className="text-danger uppercase tracking-widest text-xs mt-2">Invalid credentials</p>}
            
            <div className="mt-4 flex justify-end">
              <Button type="submit" variant="primary" disabled={isLoginLoading}>
                {isLoginLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </div>
          </form>
        
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-secondary text-xs uppercase tracking-widest">
            Not registered yet? <a href="/register" className="text-accent hover:text-fg font-bold">Register now</a>
          </p>
        </div>
      </Panel>
    </div>
  );
};
