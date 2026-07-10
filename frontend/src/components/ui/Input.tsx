import React from 'react';
import { cn } from './Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="label-md uppercase text-secondary tracking-widest font-semibold">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn('input-field', error && 'border-error', className)}
          {...props}
        />
        {error && <span className="label-sm text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
