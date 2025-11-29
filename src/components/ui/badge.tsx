import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2',
        {
          'border-transparent bg-gray-900 text-gray-50': variant === 'default',
          'border-transparent bg-gray-100 text-gray-900': variant === 'secondary',
          'border-transparent bg-red-500 text-gray-50': variant === 'destructive',
          'text-gray-950': variant === 'outline',
          'border-transparent bg-green-100 text-green-800': variant === 'success',
          'border-transparent bg-yellow-100 text-yellow-800': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
