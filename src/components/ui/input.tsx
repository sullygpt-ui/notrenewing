import { forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'block w-full rounded-xl border-2 px-4 py-2.5 text-gray-900 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-0 transition-colors sm:text-sm',
            error
              ? 'border-red-300 focus:border-red-500 bg-red-50/50'
              : 'border-gray-200 focus:border-primary-500 hover:border-gray-300',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
