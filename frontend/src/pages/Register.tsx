import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useRegisterMutation, useVerifySignupMutation } from '../store/api/authApi';
import { setCredentials } from '../store/slices/authSlice';
import { Button, Panel, Field, Input } from '../components/tui/Primitives';
import { systemLog } from '../utils/logger';

export const Register = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [register, { isLoading, error }] = useRegisterMutation();
  const [verifySignup, { isLoading: isVerifying, error: verifyError }] = useVerifySignupMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
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

    systemLog('Register.tsx', 'handleRegister', `User attempting registration with email: ${email}`);
    try {
      await register({ email, password }).unwrap();
      systemLog('Register.tsx', 'handleRegister', 'Registration step 1 successful, moving to OTP');
      setStep(2);
    } catch (err: any) {
      systemLog('Register.tsx', 'handleRegister', 'Registration failed');
      setValidationError(err?.data?.message || 'Registration failed');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    if (!otp) {
      setValidationError('OTP is required');
      return;
    }

    systemLog('Register.tsx', 'handleVerify', `User verifying OTP`);
    try {
      const response = await verifySignup({ email, otp }).unwrap();
      systemLog('Register.tsx', 'handleVerify', 'Verification successful');
      dispatch(setCredentials({ token: response.token }));
      navigate('/onboarding');
    } catch (err: any) {
      systemLog('Register.tsx', 'handleVerify', 'Verification failed');
      setValidationError(err?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-80px)] font-mono text-sm">
      <Panel title={step === 1 ? "REGISTRATION" : "VERIFICATION"} className="w-full max-w-md mt-0">
        <div className="mb-6 border-b border-border pb-4">
          <h1 className="text-xl font-bold text-fg uppercase tracking-widest">
            {step === 1 ? "Create Account" : "Verify Email"}
          </h1>
        </div>
        
        {step === 1 ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
            
            {validationError && <p className="text-danger uppercase tracking-widest text-xs mt-2">{validationError}</p>}
            {error && !validationError && <p className="text-danger uppercase tracking-widest text-xs mt-2">Failed to register</p>}
            
            <div className="mt-4 flex justify-end">
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Continue'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="bg-surface p-3 rounded border border-border">
              <p className="text-secondary mb-1">Please enter the 6-digit verification code sent to <span className="text-fg font-bold">{email}</span>.</p>
              <p className="text-accent text-xs tracking-widest uppercase">Note: Please check your spam/junk folder if you don't see it within a few minutes.</p>
            </div>
            <Field label="Verification Code">
              <Input 
                type="text" 
                required 
                value={otp}
                onChange={(e: any) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
              />
            </Field>

            {validationError && <p className="text-danger uppercase tracking-widest text-xs mt-2">{validationError}</p>}
            {verifyError && !validationError && <p className="text-danger uppercase tracking-widest text-xs mt-2">Invalid or expired OTP</p>}

            <div className="mt-4 flex justify-between items-center">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-secondary hover:text-fg text-xs uppercase tracking-widest"
              >
                Back
              </button>
              <Button type="submit" variant="primary" disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </form>
        )}
        
        {step === 1 && (
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-secondary text-xs uppercase tracking-widest">
              Already a member? <a href="/login" className="text-accent hover:text-fg font-bold">Login</a>
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
};
