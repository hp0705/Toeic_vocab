import React from 'react';

export interface ChipProps {
  label: string;
  variant?: 'default' | 'primary' | 'pos-n' | 'pos-v' | 'pos-adj' | 'pos-adv' | 'pattern' | 'weak';
  size?: 'sm' | 'md';
  onClick?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  size = 'md',
  onClick,
  className = ''
}) => {
  const sizeStyles = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';

  const variantStyles = {
    default: 'bg-surface-2 text-text-muted border border-border',
    primary: 'bg-primary-light text-primary border border-primary/20',
    'pos-n': 'bg-pos-n-bg text-pos-n font-semibold',
    'pos-v': 'bg-pos-v-bg text-pos-v font-semibold',
    'pos-adj': 'bg-pos-adj-bg text-pos-adj font-semibold',
    'pos-adv': 'bg-pos-adv-bg text-pos-adv font-semibold',
    pattern: 'bg-primary-light text-primary border border-primary/30 font-medium',
    weak: 'bg-bad-light text-bad font-semibold'
  }[variant];

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-sm transition-colors ${sizeStyles} ${variantStyles} ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      } ${className}`}
    >
      {label}
    </span>
  );
};
