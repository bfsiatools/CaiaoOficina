import type { ReactNode } from 'react';
import { cn } from '@/components/ui/cn';

export function PageContainer({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-page px-4 md:px-6 lg:px-8', className)}>{children}</div>;
}
