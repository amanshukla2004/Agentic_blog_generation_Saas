import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { systemLog } from '../utils/logger';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="flex justify-center items-center h-full pt-20">
      <Card className="w-full max-w-md p-8">
        <h1 className="headline-lg text-center mb-6">Create Account</h1>
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
          {error && <p className="text-error label-sm">Failed to register</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
