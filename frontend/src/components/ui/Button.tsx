import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-active disabled:bg-primary-disabled',
  secondary: 'bg-surface-strong text-ink hover:bg-hairline',
  outline: 'border border-hairline bg-canvas text-ink hover:bg-surface-soft',
  ghost: 'bg-transparent text-ink hover:bg-surface-strong',
  danger: 'bg-down text-white hover:opacity-90',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-sm text-sm',
  md: 'h-11 px-base text-sm',
  lg: 'h-14 px-lg text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
