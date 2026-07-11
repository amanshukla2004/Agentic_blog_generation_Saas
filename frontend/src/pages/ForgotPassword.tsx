import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgotPasswordMutation, useVerifyResetOtpMutation, useResetPasswordMutation } from '../store/api/authApi';
import { Button, Panel, Field, Input } from '../components/tui/Primitives';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [step, setStep] = useState<'request' | 'verify_otp' | 'set_new_password'>('request');
  const [forgotPassword, { isLoading: isRequesting, error: requestError }] = useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifying, error: verifyError }] = useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetting, error: resetError }] = useResetPasswordMutation();

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email).unwrap();
      setStep('verify_otp');
    } catch (err) {
      console.error('Failed to request password reset:', err);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyResetOtp({ email, otp }).unwrap();
      setStep('set_new_password');
    } catch (err) {
      console.error('Failed to verify OTP:', err);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    
    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Failed to reset password:', err);
    }
  };

  return (
    <div className="flex justify-center items-center h-[calc(100vh-80px)] font-mono text-sm">
      <Panel title="FORGOT PASSWORD" className="w-full max-w-md mt-0">
        <div className="mb-6 border-b border-border pb-4">
          <h1 className="text-xl font-bold text-fg uppercase tracking-widest">Reset Password</h1>
        </div>
        
        {step === 'set_new_password' && (
          <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
            <div className="bg-surface p-3 rounded border border-border">
              <p className="text-secondary mb-1">OTP Verified Successfully.</p>
              <p className="text-accent text-xs tracking-widest uppercase">Please create a new password below.</p>
            </div>

            <Field label="New Password">
              <div className="relative flex items-center">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={newPassword}
                  onChange={(e: any) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
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
            
            <Field label="Confirm Password">
              <div className="relative flex items-center">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </Field>

            {validationError && <p className="text-danger uppercase tracking-widest text-xs mt-2">{validationError}</p>}
            {resetError && !validationError && <p className="text-danger uppercase tracking-widest text-xs mt-2">Failed to reset password. Please try again.</p>}
            
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="ghost" onClick={() => navigate('/login')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isResetting}>
                {isResetting ? 'Saving...' : 'Save New Password'}
              </Button>
            </div>
          </form>
        )}

        {step === 'verify_otp' && (
          <form onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-4">
            <div className="bg-surface p-3 rounded border border-border">
              <p className="text-secondary mb-1">We sent a verification code to <span className="text-fg font-bold">{email}</span>.</p>
              <p className="text-accent text-xs tracking-widest uppercase">Note: Please check your spam/junk folder if you don't see it within a few minutes.</p>
            </div>
            
            <Field label="Verification Code (OTP)">
              <Input 
                type="text" 
                required 
                value={otp}
                onChange={(e: any) => setOtp(e.target.value)}
                placeholder="123456"
                autoComplete="one-time-code"
                maxLength={6}
              />
            </Field>

            {verifyError && <p className="text-danger uppercase tracking-widest text-xs mt-2">Invalid or expired OTP. Please try again.</p>}
            
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep('request')}>Back</Button>
              <Button type="submit" variant="primary" disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </Button>
            </div>
          </form>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestSubmit} className="flex flex-col gap-4">
            <p className="text-secondary mb-2">Enter your email address below. If an account exists, we'll send a verification code to reset your password.</p>
            
            <Field label="Email">
              <Input 
                type="email" 
                required 
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </Field>
            
            {requestError && <p className="text-danger uppercase tracking-widest text-xs mt-2">Failed to request reset. Please try again.</p>}
            
            <div className="mt-4 flex justify-between">
              <Button type="button" variant="ghost" onClick={() => navigate('/login')}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isRequesting}>
                {isRequesting ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          </form>
        )}
      </Panel>
    </div>
  );
};
