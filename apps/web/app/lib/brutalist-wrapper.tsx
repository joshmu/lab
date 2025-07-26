'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { getCategoryColor } from './brutalist-theme';

export interface BrutalistWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'button' | 'input' | 'panel';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: boolean | 'sm' | 'md' | 'lg' | 'colored';
  border?: boolean | string;
  animate?: boolean | 'hover' | 'glitch' | 'slam' | 'pulse';
  category?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

/**
 * BrutalistWrapper - A utility component to apply brutalist styling to any content
 * 
 * @example
 * ```tsx
 * <BrutalistWrapper variant="card" shadow="md" animate="hover">
 *   <div>Your content here</div>
 * </BrutalistWrapper>
 * ```
 */
export function BrutalistWrapper({
  children,
  className,
  variant = 'default',
  size = 'md',
  shadow = true,
  border = true,
  animate = false,
  category,
  noPadding = false,
  onClick,
}: BrutalistWrapperProps) {
  const isClickable = !!onClick || animate === 'hover';
  
  // Get category-specific color if provided
  const categoryColor = category ? getCategoryColor(category) : null;
  
  // Build shadow classes
  const shadowClasses = () => {
    if (!shadow) return '';
    
    if (shadow === 'colored' && categoryColor) {
      // Use category-specific colored shadow
      const colorMap: Record<string, string> = {
        '#FFFF00': 'shadow-[4px_4px_0px_0px_rgb(255,255,0)]',
        '#00FF00': 'shadow-[4px_4px_0px_0px_rgb(0,255,0)]',
        '#FF00FF': 'shadow-[4px_4px_0px_0px_rgb(255,0,255)]',
        '#00FFFF': 'shadow-[4px_4px_0px_0px_rgb(0,255,255)]',
        '#FF0000': 'shadow-[4px_4px_0px_0px_rgb(255,0,0)]',
        '#0000FF': 'shadow-[4px_4px_0px_0px_rgb(0,0,255)]',
      };
      return colorMap[categoryColor] || 'shadow-[4px_4px_0px_0px_rgb(0,0,0)] dark:shadow-[4px_4px_0px_0px_rgb(255,255,255)]';
    }
    
    const shadowSizeMap = {
      sm: 'shadow-[4px_4px_0px_0px_rgb(0,0,0)] dark:shadow-[4px_4px_0px_0px_rgb(255,255,255)]',
      md: 'shadow-[8px_8px_0px_0px_rgb(0,0,0)] dark:shadow-[8px_8px_0px_0px_rgb(255,255,255)]',
      lg: 'shadow-[12px_12px_0px_0px_rgb(0,0,0)] dark:shadow-[12px_12px_0px_0px_rgb(255,255,255)]',
    };
    
    if (typeof shadow === 'string' && shadow in shadowSizeMap) {
      return shadowSizeMap[shadow as keyof typeof shadowSizeMap];
    }
    
    return 'shadow-[4px_4px_0px_0px_rgb(0,0,0)] dark:shadow-[4px_4px_0px_0px_rgb(255,255,255)]';
  };
  
  // Build animation classes
  const animationClasses = () => {
    if (!animate) return '';
    
    const animationMap = {
      hover: 'hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_rgb(0,0,0)] dark:hover:shadow-[6px_6px_0px_0px_rgb(255,255,255)]',
      glitch: 'animate-brutalist-glitch',
      slam: 'animate-brutalist-slam',
      pulse: 'animate-brutalist-pulse',
    };
    
    if (animate === true || animate === 'hover') {
      return animationMap.hover;
    }
    
    return animationMap[animate] || '';
  };
  
  // Build padding classes based on size
  const paddingClasses = () => {
    if (noPadding || variant === 'button') return '';
    
    const paddingMap = {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };
    
    return paddingMap[size];
  };
  
  // Build variant-specific classes
  const variantClasses = () => {
    switch (variant) {
      case 'card':
        return cn(
          'bg-white dark:bg-black',
          'overflow-hidden',
          'transition-all duration-200'
        );
      case 'button':
        return cn(
          'bg-white dark:bg-black',
          'cursor-pointer hover:bg-yellow-400 hover:text-black dark:hover:bg-yellow-400 dark:hover:text-black',
          'px-4 py-2',
          'font-bold uppercase',
          'transition-all duration-200',
          'active:translate-y-0.5 active:translate-x-0.5'
        );
      case 'input':
        return cn(
          'bg-white dark:bg-black',
          'focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-offset-4 focus:ring-offset-white dark:focus:ring-offset-black',
          'px-4 py-3',
          'font-mono'
        );
      case 'panel':
        return cn(
          'bg-white dark:bg-black',
          'backdrop-blur-sm'
        );
      default:
        return 'bg-white dark:bg-black';
    }
  };
  
  // Build border classes
  const borderClasses = () => {
    if (!border) return '';
    
    if (typeof border === 'string') {
      return cn('border-4 border-black dark:border-white rounded-none', border);
    }
    
    return 'border-4 border-black dark:border-white rounded-none';
  };
  
  const combinedClasses = cn(
    'rounded-none transition-all duration-200',
    borderClasses(),
    shadowClasses(),
    animationClasses(),
    paddingClasses(),
    variantClasses(),
    isClickable ? 'cursor-pointer' : '',
    className || ''
  );
  
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      className={combinedClasses}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
}

/**
 * Pre-configured brutalist wrapper variants
 */
export const BrutalistCard = (props: Omit<BrutalistWrapperProps, 'variant'>) => (
  <BrutalistWrapper variant="card" shadow="md" animate="hover" {...props} />
);

export const BrutalistButton = (props: Omit<BrutalistWrapperProps, 'variant'>) => (
  <BrutalistWrapper variant="button" shadow="sm" animate="hover" {...props} />
);

export const BrutalistPanel = (props: Omit<BrutalistWrapperProps, 'variant'>) => (
  <BrutalistWrapper variant="panel" shadow="lg" {...props} />
);

export const BrutalistInput = (props: Omit<BrutalistWrapperProps, 'variant'>) => (
  <BrutalistWrapper variant="input" shadow={false} animate={false} {...props} />
);