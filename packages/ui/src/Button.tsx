import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-myntra-pink text-white hover:bg-brand-600 shadow-sm hover:shadow-md active:scale-95',
  secondary: 'bg-myntra-dark text-white hover:bg-black shadow-sm hover:shadow-md active:scale-95',
  outline: 'border border-gray-300 bg-white text-myntra-dark hover:border-myntra-pink hover:text-myntra-pink active:scale-95',
  ghost: 'text-myntra-text hover:bg-myntra-gray hover:text-myntra-dark active:scale-95',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-sm font-bold tracking-wider uppercase transition-all disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
