import React, { useState } from 'react';
import { useGenerate2faMutation, useEnable2faMutation } from '../../store/api/authApi';
import { Button, Panel, Field, Input } from '../tui/Primitives';

export const Setup2FA = ({ email, is2faEnabled }: { email: string, is2faEnabled?: boolean }) => {
  const [generate2fa, { isLoading: isGenerating }] = useGenerate2faMutation();
  const [enable2fa, { isLoading: isEnabling, error }] = useEnable2faMutation();
  
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [enabled, setEnabled] = useState(is2faEnabled || false);

  const handleGenerate = async () => {
    try {
      const response = await generate2fa(email).unwrap();
      setQrCode(response.qrCodeUri);
    } catch (err) {
      console.error('Failed to generate 2FA', err);
    }
  };

  const handleEnable = async () => {
    try {
      await enable2fa({ email, code }).unwrap();
      setEnabled(true);
      setQrCode(null);
    } catch (err) {
      console.error('Failed to enable 2FA', err);
    }
  };

  if (enabled) {
    return (
      <div className="text-accent font-bold tracking-widest uppercase text-xs">
        ✓ Two-Factor Authentication is Enabled
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!qrCode ? (
        <div>
          <p className="text-secondary text-xs mb-4">Protect your account with high-security Two-Factor Authentication using an authenticator app.</p>
          <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Setup 2FA'}
          </Button>
        </div>
      ) : (
        <div className="border border-border p-4 bg-surface flex flex-col gap-4">
          <p className="text-fg text-sm">1. Scan this QR code with Google Authenticator or Authy:</p>
          <div className="bg-white p-2 self-start inline-block">
            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>
          
          <p className="text-fg text-sm mt-4">2. Enter the 6-digit code to confirm:</p>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-[200px]">
              <Field label="Verification Code">
                <Input 
                  type="text" 
                  value={code} 
                  onChange={(e: any) => setCode(e.target.value)} 
                  maxLength={6}
                  placeholder="000000"
                />
              </Field>
            </div>
            <Button variant="primary" onClick={handleEnable} disabled={isEnabling || code.length !== 6}>
              {isEnabling ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </div>
          {error && <p className="text-danger text-xs uppercase tracking-widest mt-2">Invalid verification code</p>}
        </div>
      )}
    </div>
  );
};
