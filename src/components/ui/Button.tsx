import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 min-h-[44px]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-sm',
    md: 'text-sm px-4 py-2.5 rounded-md',
    lg: 'text-base px-6 py-3.5 rounded-lg'
  }[size];

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
    secondary: 'bg-surface-2 text-text hover:bg-border',
    outline: 'border border-border text-text hover:bg-surface-2',
    danger: 'bg-bad text-white hover:opacity-90',
    ghost: 'text-text hover:bg-surface-2',
    success: 'bg-ok text-white hover:opacity-90'
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
