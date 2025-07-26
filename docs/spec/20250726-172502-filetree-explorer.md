# Technical Specification: Brutalist Filetree Explorer for Homepage Integration
**Project ID:** 20250726-172502
**Created:** July 26, 2025
**References:** 
- `docs/prd/20250726-172502-filetree-explorer.md`
- `docs/arch/20250726-172502-filetree-explorer.md`

## Executive Summary
This technical specification details the implementation of a brutalist-themed filetree explorer integrated into Josh Mu's Lab homepage. The solution transforms existing navigation components with bold brutalist aesthetics while maintaining functionality and enhancing the visual impact. The implementation leverages CSS custom properties, Tailwind utility classes, and React component patterns to create a cohesive, maintainable design system.

## Technical Requirements
### Functional Specifications
1. **Homepage Integration**
   - Replace hardcoded landing pages grid with dynamic filetree explorer
   - Maintain existing experiment links and routing
   - Support both grid and tree view layouts
   - Preserve mouse-reactive hover effects

2. **Brutalist Theme Implementation**
   - Bold borders (4px minimum)
   - High contrast black/white color scheme
   - Hard shadows with offset positioning
   - Sharp corners (no border radius)
   - Uppercase, bold typography
   - Dramatic hover states with shadow transitions

3. **Component Transformation**
   - Apply brutalist styling to NavigationTree
   - Transform SearchBar with brutal aesthetics
   - Redesign FilterPanel with bold UI elements
   - Update ExperimentCard presentation

### Non-Functional Specifications
- Performance: Maintain <1s load time with brutalist styles
- Accessibility: Ensure WCAG 2.1 AA compliance with high contrast
- Responsiveness: Adapt brutalist design for mobile/tablet
- Animation: Smooth transitions for shadows and transforms

## System Design
### Component Specifications

#### 1. Brutalist Theme System
```typescript
// apps/web/lib/theme/brutalist.ts
export const brutalistTheme = {
  borders: {
    width: '4px',
    style: 'solid',
    color: {
      default: 'border-black dark:border-white',
      hover: 'hover:border-yellow-400',
      active: 'border-yellow-400',
    }
  },
  shadows: {
    none: 'shadow-none',
    small: 'shadow-[4px_4px_0px_0px_rgb(0,0,0)] dark:shadow-[4px_4px_0px_0px_rgb(255,255,255)]',
    medium: 'shadow-[8px_8px_0px_0px_rgb(0,0,0)] dark:shadow-[8px_8px_0px_0px_rgb(255,255,255)]',
    large: 'shadow-[12px_12px_0px_0px_rgb(0,0,0)] dark:shadow-[12px_12px_0px_0px_rgb(255,255,255)]',
    colored: {
      purple: 'shadow-[8px_8px_0px_0px_rgb(147,51,234)]',
      pink: 'shadow-[8px_8px_0px_0px_rgb(236,72,153)]',
      cyan: 'shadow-[8px_8px_0px_0px_rgb(6,182,212)]',
      red: 'shadow-[8px_8px_0px_0px_rgb(239,68,68)]',
      orange: 'shadow-[8px_8px_0px_0px_rgb(249,115,22)]',
      green: 'shadow-[8px_8px_0px_0px_rgb(34,197,94)]',
      yellow: 'shadow-[8px_8px_0px_0px_rgb(250,204,21)]',
    }
  },
  transforms: {
    hover: 'hover:-translate-y-1 hover:translate-x-1',
    active: 'active:translate-y-1 active:-translate-x-1',
  },
  typography: {
    heading: 'font-black uppercase tracking-tighter',
    subheading: 'font-bold uppercase tracking-wide',
    body: 'font-mono',
    label: 'font-bold uppercase tracking-wider text-xs',
  },
  corners: 'rounded-none',
  transitions: 'transition-all duration-200 ease-out',
} as const;

export type BrutalistTheme = typeof brutalistTheme;
```

#### 2. CSS Custom Properties
```css
/* apps/web/app/globals.css - Add brutalist variables */
@theme inline {
  /* Brutalist Design Tokens */
  --brutalist-border-width: 4px;
  --brutalist-shadow-offset: 8px;
  --brutalist-shadow-offset-small: 4px;
  --brutalist-shadow-offset-large: 12px;
  --brutalist-transition-duration: 200ms;
  --brutalist-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Brutalist Colors */
  --brutalist-primary: oklch(0 0 0); /* Pure black */
  --brutalist-primary-inverse: oklch(1 0 0); /* Pure white */
  --brutalist-accent: oklch(0.866 0.178 91.29); /* Yellow #facc15 */
  --brutalist-danger: oklch(0.577 0.245 27.33); /* Red #ef4444 */
  --brutalist-success: oklch(0.723 0.191 142.5); /* Green #22c55e */
}

/* Brutalist utility classes */
.brutalist-border {
  border-width: var(--brutalist-border-width);
  border-style: solid;
}

.brutalist-shadow {
  box-shadow: var(--brutalist-shadow-offset) var(--brutalist-shadow-offset) 0px 0px currentColor;
}

.brutalist-shadow-hover {
  transition: box-shadow var(--brutalist-transition-duration) var(--brutalist-transition-easing),
              transform var(--brutalist-transition-duration) var(--brutalist-transition-easing);
}

.brutalist-shadow-hover:hover {
  transform: translate(calc(var(--brutalist-shadow-offset-small) / 4), calc(var(--brutalist-shadow-offset-small) / -4));
}
```

### API Design
#### Brutalist Component Props Extension
```typescript
// apps/web/lib/theme/types.ts
export interface BrutalistProps {
  brutal?: boolean;
  brutalVariant?: 'default' | 'accent' | 'danger' | 'success';
  brutalSize?: 'small' | 'medium' | 'large';
  brutalShadow?: boolean;
  brutalBorder?: boolean;
}

// Extend existing component props
export interface BrutalistNavigationTreeProps extends NavigationTreeProps, BrutalistProps {}
export interface BrutalistSearchBarProps extends SearchBarProps, BrutalistProps {}
export interface BrutalistFilterPanelProps extends FilterPanelProps, BrutalistProps {}
```

### Data Models
```typescript
// apps/web/lib/theme/constants.ts
export const BRUTALIST_CATEGORY_COLORS = {
  animations: {
    bg: 'bg-purple-500',
    border: 'border-purple-600',
    shadow: 'shadow-[8px_8px_0px_0px_rgb(147,51,234)]',
  },
  'data-visualization': {
    bg: 'bg-cyan-500',
    border: 'border-cyan-600',
    shadow: 'shadow-[8px_8px_0px_0px_rgb(6,182,212)]',
  },
  interactions: {
    bg: 'bg-pink-500',
    border: 'border-pink-600',
    shadow: 'shadow-[8px_8px_0px_0px_rgb(236,72,153)]',
  },
  effects: {
    bg: 'bg-red-500',
    border: 'border-red-600',
    shadow: 'shadow-[8px_8px_0px_0px_rgb(239,68,68)]',
  },
  prototypes: {
    bg: 'bg-orange-500',
    border: 'border-orange-600',
    shadow: 'shadow-[8px_8px_0px_0px_rgb(249,115,22)]',
  },
  algorithms: {
    bg: 'bg-green-500',
    border: 'border-green-600',
    shadow: 'shadow-[8px_8px_0px_0px_rgb(34,197,94)]',
  },
} as const;

export type BrutalistCategoryColor = keyof typeof BRUTALIST_CATEGORY_COLORS;
```

### Integration Points
```typescript
// apps/web/app/components/navigation/BrutalistNavigationTree.tsx
import { NavigationTree } from './NavigationTree';
import { brutalistTheme } from '@/lib/theme/brutalist';
import { cn } from '@/lib/utils';

export function BrutalistNavigationTree(props: BrutalistNavigationTreeProps) {
  const { className, brutal = true, ...rest } = props;
  
  return (
    <NavigationTree
      {...rest}
      className={cn(
        brutal && [
          brutalistTheme.corners,
          brutalistTheme.borders.width,
          brutalistTheme.borders.color.default,
          brutalistTheme.shadows.medium,
          'bg-white dark:bg-black',
          'p-0', // Remove default padding
        ],
        className
      )}
    />
  );
}
```

## Implementation Details
### Technology Stack
- **React 18**: Component implementation with hooks
- **TypeScript 5.x**: Type-safe brutalist theme system
- **Tailwind CSS v4.1.11**: Utility-first brutalist styles
- **Next.js 14**: Server components for metadata processing
- **clsx/cn**: Dynamic class composition

### Development Environment
```json
// package.json additions
{
  "scripts": {
    "dev:theme": "pnpm dev --filter=web",
    "build:theme": "pnpm build --filter=web",
    "test:theme": "pnpm test --filter=web -- --testPathPattern=theme"
  }
}
```

### Code Structure
```
apps/web/
├── app/
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── brutalist/
│   │   │   │   ├── BrutalistNavigationTree.tsx
│   │   │   │   ├── BrutalistSearchBar.tsx
│   │   │   │   ├── BrutalistFilterPanel.tsx
│   │   │   │   ├── BrutalistExperimentCard.tsx
│   │   │   │   └── index.ts
│   │   │   └── ...existing files
│   │   └── ui/
│   │       └── brutalist/
│   │           ├── BrutalistButton.tsx
│   │           ├── BrutalistCard.tsx
│   │           ├── BrutalistBadge.tsx
│   │           └── index.ts
│   └── page.tsx (updated)
├── lib/
│   └── theme/
│       ├── brutalist.ts
│       ├── constants.ts
│       ├── types.ts
│       └── utils.ts
└── styles/
    └── brutalist.css
```

### Patterns & Standards
#### 1. Brutalist Component Wrapper Pattern
```typescript
// lib/theme/utils.ts
export function withBrutalistStyles<T extends React.ComponentType<any>>(
  Component: T,
  defaultStyles: BrutalistStyleConfig
) {
  return React.forwardRef((props: React.ComponentProps<T> & BrutalistProps, ref) => {
    const { brutal = true, brutalVariant = 'default', className, ...rest } = props;
    
    const brutalClasses = brutal ? generateBrutalistClasses(defaultStyles, brutalVariant) : '';
    
    return (
      <Component
        ref={ref}
        className={cn(brutalClasses, className)}
        {...rest}
      />
    );
  });
}
```

#### 2. Brutalist Animation Patterns
```typescript
// lib/theme/animations.ts
export const brutalistAnimations = {
  glitch: {
    keyframes: `
      @keyframes brutalist-glitch {
        0% { transform: translate(0) }
        20% { transform: translate(-2px, 2px) }
        40% { transform: translate(-2px, -2px) }
        60% { transform: translate(2px, 2px) }
        80% { transform: translate(2px, -2px) }
        100% { transform: translate(0) }
      }
    `,
    class: 'animate-[brutalist-glitch_0.3s_ease-in-out_infinite]',
  },
  slam: {
    keyframes: `
      @keyframes brutalist-slam {
        0% { transform: scale(1) rotate(0deg) }
        50% { transform: scale(1.05) rotate(-1deg) }
        100% { transform: scale(1) rotate(0deg) }
      }
    `,
    class: 'animate-[brutalist-slam_0.2s_ease-out]',
  },
};
```

## Testing Strategy
### Unit Testing
```typescript
// __tests__/theme/brutalist.test.tsx
import { render } from '@testing-library/react';
import { BrutalistNavigationTree } from '@/app/components/navigation/brutalist';

describe('BrutalistNavigationTree', () => {
  it('applies brutalist border styles', () => {
    const { container } = render(<BrutalistNavigationTree nodes={[]} />);
    const tree = container.firstChild;
    
    expect(tree).toHaveClass('border-4', 'border-black', 'rounded-none');
  });
  
  it('applies brutalist shadow on hover', () => {
    const { container } = render(<BrutalistNavigationTree nodes={[]} />);
    const tree = container.firstChild;
    
    expect(tree).toHaveClass('shadow-[8px_8px_0px_0px_rgb(0,0,0)]');
  });
});
```

### Integration Testing
```typescript
// __tests__/integration/homepage-brutalist.test.tsx
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Homepage Brutalist Integration', () => {
  it('renders filetree explorer with brutalist theme', async () => {
    render(<Home />);
    
    const navigator = await screen.findByRole('tree');
    expect(navigator).toHaveClass('border-4', 'shadow-[8px_8px_0px_0px_rgb(0,0,0)]');
  });
});
```

### End-to-End Testing
```typescript
// e2e/brutalist-navigation.spec.ts
import { test, expect } from '@playwright/test';

test('brutalist navigation interactions', async ({ page }) => {
  await page.goto('/');
  
  // Test hover effects
  const card = page.locator('[data-testid="experiment-card"]').first();
  await card.hover();
  
  // Verify shadow transformation
  await expect(card).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 1, -1)');
});
```

## Quality Requirements
### Performance Criteria
- CSS bundle size increase: <5KB gzipped
- Animation frame rate: 60fps minimum
- Shadow rendering: GPU-accelerated via `will-change`
- Initial paint: No blocking styles

### Security Implementation
- Sanitize all dynamic class names
- Validate color inputs for theme customization
- CSP headers for inline styles
- XSS prevention in theme utilities

### Error Handling
```typescript
// lib/theme/error-boundary.tsx
export class BrutalistThemeErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    console.error('Brutalist theme error:', error);
    // Fallback to default styles
  }
  
  render() {
    if (this.state.hasError) {
      return <div className="border-2 border-red-500 p-4">Theme Error</div>;
    }
    return this.props.children;
  }
}
```

### Logging & Monitoring
```typescript
// lib/theme/telemetry.ts
export function trackBrutalistInteraction(component: string, action: string) {
  if (typeof window !== 'undefined' && window.analytics) {
    window.analytics.track('brutalist_interaction', {
      component,
      action,
      theme: 'brutalist',
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Development Tasks
1. **Theme System Setup** (4 hours)
   - Create brutalist theme constants and types
   - Implement CSS custom properties
   - Build theme utility functions
   - Set up component wrapper pattern

2. **Component Transformation** (8 hours)
   - Transform NavigationTree with brutalist styles
   - Update SearchBar with brutal aesthetics
   - Redesign FilterPanel components
   - Create BrutalistExperimentCard

3. **Homepage Integration** (6 hours)
   - Replace grid layout with filetree explorer
   - Integrate brutalist navigation components
   - Update page.tsx with new layout
   - Maintain existing functionality

4. **Animation & Interactions** (4 hours)
   - Implement hover shadow effects
   - Add transform animations
   - Create glitch effects for active states
   - Build keyboard navigation enhancements

5. **Testing & Documentation** (4 hours)
   - Write unit tests for theme utilities
   - Create integration tests
   - Document component usage
   - Add Storybook stories

6. **Performance Optimization** (2 hours)
   - Optimize shadow rendering
   - Implement CSS containment
   - Add will-change properties
   - Profile and optimize animations

## Implementation Risks
### Technical Risks
1. **Performance Impact**: Heavy shadows might affect rendering
   - Mitigation: Use CSS containment and GPU acceleration
   
2. **Accessibility Concerns**: High contrast might be jarring
   - Mitigation: Provide theme toggle option
   
3. **Mobile Experience**: Bold borders consume space
   - Mitigation: Responsive border widths

### Design Risks
1. **Visual Overwhelm**: Too many brutal elements
   - Mitigation: Strategic use of brutalist accents
   
2. **Brand Consistency**: Departure from current aesthetic
   - Mitigation: Gradual rollout with A/B testing

## Code Examples

### 1. Brutalist Navigation Tree Implementation
```typescript
// app/components/navigation/brutalist/BrutalistNavigationTree.tsx
'use client';

import React from 'react';
import { NavigationTree } from '../NavigationTree';
import { brutalistTheme } from '@/lib/theme/brutalist';
import { BRUTALIST_CATEGORY_COLORS } from '@/lib/theme/constants';
import { cn } from '@/lib/utils';
import type { BrutalistNavigationTreeProps } from '@/lib/theme/types';

export function BrutalistNavigationTree({
  nodes,
  className,
  brutal = true,
  brutalVariant = 'default',
  brutalSize = 'medium',
  brutalShadow = true,
  brutalBorder = true,
  ...props
}: BrutalistNavigationTreeProps) {
  const shadowClass = brutalShadow ? brutalistTheme.shadows[brutalSize] : '';
  
  return (
    <div
      className={cn(
        brutal && [
          'bg-white dark:bg-black',
          brutalBorder && [
            brutalistTheme.borders.width,
            brutalistTheme.borders.color.default,
          ],
          brutalistTheme.corners,
          shadowClass,
          brutalistTheme.transitions,
          brutalistTheme.transforms.hover,
        ],
        className
      )}
    >
      <NavigationTree
        nodes={nodes}
        className="p-0"
        nodeClassName={(node) => {
          if (node.type === 'category') {
            const colors = BRUTALIST_CATEGORY_COLORS[node.id as BrutalistCategoryColor];
            return cn(
              'border-l-8',
              colors?.border || 'border-black dark:border-white',
              'hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
            );
          }
          return 'hover:bg-gray-50 dark:hover:bg-gray-900';
        }}
        {...props}
      />
    </div>
  );
}
```

### 2. Brutalist Search Bar
```typescript
// app/components/navigation/brutalist/BrutalistSearchBar.tsx
'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { brutalistTheme } from '@/lib/theme/brutalist';
import { cn } from '@/lib/utils';
import type { BrutalistSearchBarProps } from '@/lib/theme/types';

export function BrutalistSearchBar({
  value,
  onChange,
  placeholder = "SEARCH EXPERIMENTS",
  className,
  brutal = true,
  ...props
}: BrutalistSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div
      className={cn(
        brutal && [
          'relative',
          brutalistTheme.borders.width,
          brutalistTheme.borders.color.default,
          brutalistTheme.corners,
          brutalistTheme.transitions,
          isFocused ? brutalistTheme.shadows.medium : brutalistTheme.shadows.small,
          isFocused && brutalistTheme.transforms.hover,
        ],
        className
      )}
    >
      <div className="flex items-center">
        <div className="p-3 bg-yellow-400 text-black">
          <Search className="w-6 h-6" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            'flex-1 px-4 py-3 bg-transparent outline-none',
            brutalistTheme.typography.body,
            'placeholder:text-gray-500 dark:placeholder:text-gray-400',
            'text-black dark:text-white'
          )}
          {...props}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className={cn(
              'p-3 hover:bg-red-500 hover:text-white',
              brutalistTheme.transitions
            )}
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
```

### 3. Homepage Integration
```typescript
// app/page.tsx (updated sections)
import { BrutalistNavigationTree } from '@/components/navigation/brutalist';
import { BrutalistSearchBar } from '@/components/navigation/brutalist';
import { BrutalistFilterPanel } from '@/components/navigation/brutalist';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiletree, setShowFiletree] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentMetadata | null>(null);
  
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="min-h-screen flex flex-col">
        {/* Hero Section - Keep existing */}
        <main className="flex-1 container mx-auto px-6 py-12 md:py-20 max-w-7xl">
          {/* ... existing hero content ... */}
          
          {/* New Brutalist Filetree Section */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className={cn(
                "text-3xl md:text-4xl",
                brutalistTheme.typography.heading
              )}>
                Experiment Explorer
              </h2>
              <Button
                onClick={() => setShowFiletree(!showFiletree)}
                className={cn(
                  brutalistTheme.corners,
                  brutalistTheme.borders.width,
                  brutalistTheme.borders.color.default,
                  brutalistTheme.shadows.small,
                  brutalistTheme.transforms.hover,
                  "bg-yellow-400 text-black hover:bg-yellow-300",
                  "px-4 py-2",
                  brutalistTheme.typography.label
                )}
              >
                {showFiletree ? 'GRID VIEW' : 'TREE VIEW'}
              </Button>
            </div>
            
            {showFiletree ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <BrutalistSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full"
                  />
                  <BrutalistFilterPanel
                    onFilterChange={(filters) => console.log(filters)}
                  />
                  <BrutalistNavigationTree
                    nodes={experimentNodes}
                    searchQuery={searchQuery}
                    selectedExperimentId={selectedExperiment?.id}
                    onExperimentSelect={setSelectedExperiment}
                    className="h-[600px] overflow-y-auto"
                  />
                </div>
                <div className="lg:col-span-2">
                  {selectedExperiment ? (
                    <BrutalistExperimentCard
                      experiment={selectedExperiment}
                      className="h-full"
                    />
                  ) : (
                    <div className={cn(
                      "h-full flex items-center justify-center",
                      brutalistTheme.borders.width,
                      brutalistTheme.borders.color.default,
                      brutalistTheme.corners,
                      brutalistTheme.shadows.medium,
                      "bg-gray-50 dark:bg-gray-900"
                    )}>
                      <p className={cn(
                        brutalistTheme.typography.body,
                        "text-gray-500 dark:text-gray-400"
                      )}>
                        SELECT AN EXPERIMENT TO VIEW DETAILS
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Existing grid view with brutalist updates
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {landingPages.map((page) => (
                  <BrutalistExperimentCard
                    key={page.id}
                    experiment={page}
                    variant="grid"
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
```

### 4. Brutalist Utility Functions
```typescript
// lib/theme/utils.ts
export function generateBrutalistClasses(
  config: BrutalistStyleConfig,
  variant: string = 'default'
): string {
  const classes = [
    brutalistTheme.corners,
    brutalistTheme.transitions,
  ];
  
  if (config.border) {
    classes.push(
      brutalistTheme.borders.width,
      brutalistTheme.borders.color[variant] || brutalistTheme.borders.color.default
    );
  }
  
  if (config.shadow) {
    classes.push(
      brutalistTheme.shadows[config.shadowSize || 'medium']
    );
  }
  
  if (config.interactive) {
    classes.push(
      brutalistTheme.transforms.hover,
      'cursor-pointer'
    );
  }
  
  if (config.typography) {
    classes.push(
      brutalistTheme.typography[config.typography]
    );
  }
  
  return cn(...classes);
}

export function getBrutalistCategoryStyle(category: string) {
  return BRUTALIST_CATEGORY_COLORS[category as BrutalistCategoryColor] || {
    bg: 'bg-gray-500',
    border: 'border-gray-600',
    shadow: 'shadow-[8px_8px_0px_0px_rgb(107,114,128)]',
  };
}
```

### 5. Tailwind Configuration Updates
```javascript
// tailwind.config.js updates
module.exports = {
  theme: {
    extend: {
      animation: {
        'brutalist-glitch': 'brutalist-glitch 0.3s ease-in-out infinite',
        'brutalist-slam': 'brutalist-slam 0.2s ease-out',
      },
      boxShadow: {
        'brutal-sm': '4px 4px 0px 0px rgb(0,0,0)',
        'brutal-md': '8px 8px 0px 0px rgb(0,0,0)',
        'brutal-lg': '12px 12px 0px 0px rgb(0,0,0)',
        'brutal-colored': '8px 8px 0px 0px var(--shadow-color)',
      },
    },
  },
  safelist: [
    // Brutalist shadow colors
    'shadow-[8px_8px_0px_0px_rgb(147,51,234)]',
    'shadow-[8px_8px_0px_0px_rgb(236,72,153)]',
    'shadow-[8px_8px_0px_0px_rgb(6,182,212)]',
    'shadow-[8px_8px_0px_0px_rgb(239,68,68)]',
    'shadow-[8px_8px_0px_0px_rgb(249,115,22)]',
    'shadow-[8px_8px_0px_0px_rgb(34,197,94)]',
    'shadow-[8px_8px_0px_0px_rgb(250,204,21)]',
  ],
};
```

---

This technical specification provides a complete blueprint for implementing the brutalist filetree explorer with detailed code examples, type definitions, and integration patterns. The solution maintains the existing functionality while dramatically enhancing the visual impact with bold brutalist aesthetics.