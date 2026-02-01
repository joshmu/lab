'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ExperimentWrapperProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

/**
 * Wrapper component for experiments
 * Provides consistent layout and styling
 */
export function ExperimentWrapper({
  children,
  className,
  fullWidth = false,
}: ExperimentWrapperProps) {
  return (
    <div className={cn('w-full', !fullWidth && 'max-w-5xl mx-auto')}>
      <Card>
        <CardContent className={cn('p-6', className)}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
