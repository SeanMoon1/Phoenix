import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm sm:text-base';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';
  const normalClasses = 'border-gray-300 focus:border-orange-500 focus:ring-orange-500';
  
  const inputClasses = clsx(
    baseClasses,
    error ? errorClasses : normalClasses,
    leftIcon && 'pl-8 sm:pl-10',
    rightIcon && 'pr-8 sm:pr-10',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
            <div className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center pointer-events-none">
            <div className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
