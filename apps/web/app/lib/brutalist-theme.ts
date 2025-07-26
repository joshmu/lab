/**
 * Brutalist theme constants for Josh Mu's Lab
 * Sharp corners, bold borders, high contrast
 */

export const BRUTALIST_THEME = {
  borders: {
    width: '4px',
    style: 'solid',
    color: 'black',
    colorDark: 'white',
  },
  shadows: {
    default: '4px 4px 0px 0px rgb(0,0,0)',
    hover: '6px 6px 0px 0px rgb(0,0,0)',
    active: '2px 2px 0px 0px rgb(0,0,0)',
    yellow: '4px 4px 0px 0px rgb(255,255,0)',
    // Dark mode shadows
    defaultDark: '4px 4px 0px 0px rgb(255,255,255)',
    hoverDark: '6px 6px 0px 0px rgb(255,255,255)',
    activeDark: '2px 2px 0px 0px rgb(255,255,255)',
  },
  colors: {
    primary: '#000000',
    secondary: '#FFFFFF',
    accent: '#FFFF00',
    success: '#00FF00',
    error: '#FF0000',
    // Category-specific colors
    categories: {
      'interactive-animations': '#FFFF00',
      'algorithms': '#00FF00',
      'ui-components': '#FF00FF',
      'data-viz': '#00FFFF',
      'performance': '#FF0000',
      'accessibility': '#0000FF',
    },
  },
  typography: {
    heading: 'font-black uppercase tracking-tighter',
    body: 'font-medium',
    mono: 'font-mono',
    sizes: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: 'ease-out',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

/**
 * Brutalist CSS classes for common patterns
 */
export const brutalistClasses = {
  // Base styles
  base: 'rounded-none transition-all duration-200',
  
  // Borders
  border: 'border-4 border-black dark:border-white',
  borderYellow: 'border-4 border-yellow-400',
  
  // Shadows
  shadow: 'shadow-[4px_4px_0px_0px_rgb(0,0,0)] dark:shadow-[4px_4px_0px_0px_rgb(255,255,255)]',
  shadowHover: 'hover:shadow-[6px_6px_0px_0px_rgb(0,0,0)] dark:hover:shadow-[6px_6px_0px_0px_rgb(255,255,255)]',
  shadowActive: 'active:shadow-[2px_2px_0px_0px_rgb(0,0,0)] dark:active:shadow-[2px_2px_0px_0px_rgb(255,255,255)]',
  shadowYellow: 'shadow-[4px_4px_0px_0px_rgb(255,255,0)]',
  
  // Transforms
  hoverTransform: 'hover:-translate-y-1 hover:translate-x-1',
  activeTransform: 'active:translate-y-0.5 active:translate-x-0.5',
  
  // Colors
  bgWhite: 'bg-white dark:bg-black',
  bgBlack: 'bg-black dark:bg-white',
  bgYellow: 'bg-yellow-400 text-black',
  textPrimary: 'text-black dark:text-white',
  textInverse: 'text-white dark:text-black',
  
  // Typography
  heading: 'font-black uppercase tracking-tighter',
  body: 'font-medium',
  mono: 'font-mono',
  
  // Interactive states
  interactive: 'cursor-pointer hover:bg-yellow-400 hover:text-black dark:hover:bg-yellow-400 dark:hover:text-black',
  selected: 'bg-yellow-400 text-black',
  disabled: 'opacity-50 cursor-not-allowed',
  
  // Focus states
  focus: 'focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-offset-4 focus:ring-offset-white dark:focus:ring-offset-black',
} as const;

/**
 * Utility function to combine brutalist classes
 */
export function brutalist(...classes: string[]): string {
  return [brutalistClasses.base, ...classes].join(' ');
}

/**
 * Get category-specific color
 */
export function getCategoryColor(category: string): string {
  return BRUTALIST_THEME.colors.categories[category as keyof typeof BRUTALIST_THEME.colors.categories] || BRUTALIST_THEME.colors.accent;
}

/**
 * Type definitions for brutalist props
 */
export interface BrutalistProps {
  variant?: 'default' | 'outline' | 'filled' | 'yellow';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: boolean;
  animate?: boolean;
  uppercase?: boolean;
}

/**
 * Get brutalist button classes based on variant
 */
export function getBrutalistButtonClasses(variant: BrutalistProps['variant'] = 'default', size: BrutalistProps['size'] = 'md'): string {
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  const variantClasses = {
    default: `${brutalistClasses.border} ${brutalistClasses.bgWhite} ${brutalistClasses.textPrimary} ${brutalistClasses.interactive}`,
    outline: `${brutalistClasses.border} bg-transparent ${brutalistClasses.textPrimary} ${brutalistClasses.interactive}`,
    filled: `${brutalistClasses.bgBlack} ${brutalistClasses.textInverse} hover:bg-yellow-400 hover:text-black`,
    yellow: `${brutalistClasses.bgYellow} ${brutalistClasses.border} hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black`,
  };

  return brutalist(
    variantClasses[variant],
    sizeClasses[size],
    brutalistClasses.shadow,
    brutalistClasses.shadowHover,
    brutalistClasses.hoverTransform,
    brutalistClasses.activeTransform,
    brutalistClasses.focus,
    'font-bold uppercase'
  );
}

/**
 * Get brutalist card classes
 */
export function getBrutalistCardClasses(selected: boolean = false): string {
  return brutalist(
    brutalistClasses.border,
    brutalistClasses.bgWhite,
    brutalistClasses.shadow,
    selected ? brutalistClasses.selected : '',
    'overflow-hidden',
    'transition-all duration-200'
  );
}

/**
 * Get brutalist input classes
 */
export function getBrutalistInputClasses(): string {
  return brutalist(
    brutalistClasses.border,
    brutalistClasses.bgWhite,
    brutalistClasses.textPrimary,
    brutalistClasses.focus,
    'px-4 py-3',
    'placeholder-gray-500 dark:placeholder-gray-400',
    'font-mono'
  );
}