import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { systemLog } from '../utils/logger';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="flex justify-center items-center h-full pt-20">
      <Card className="w-full max-w-md p-8">
        <h1 className="headline-lg text-center mb-6">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input 
            label="Email" 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-error label-sm">Invalid credentials</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
