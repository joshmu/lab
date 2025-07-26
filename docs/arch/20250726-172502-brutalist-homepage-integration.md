# Architecture: Brutalist Homepage Integration for Filetree Explorer
**Project ID:** 20250726-172502
**Created:** July 26, 2025
**References:** `docs/prd/20250726-172502-filetree-explorer.md`

## Executive Summary

This architecture document outlines the approach for integrating the existing filetree explorer into the homepage with a brutalist design aesthetic. The solution prioritizes minimal changes while achieving maximum visual and functional impact. We'll leverage the existing ExperimentExplorer component, apply brutalist styling through a theming system, and implement a progressive rollout strategy.

## System Overview

### Current State
- **Homepage**: Grid layout with 6 hardcoded landing pages, mixed styling approach
- **Explorer**: Fully functional at `/experiments`, uses rounded corners and soft shadows
- **Design System**: No unified design system, components use inline styles and Tailwind classes
- **Build System**: Turborepo with Next.js 14, Tailwind CSS (v4 syntax with @custom-variant)

### Proposed Changes
1. Replace experiment grid with filetree explorer on homepage
2. Implement brutalist design theme system
3. Maintain backward compatibility with `/experiments` route
4. Create unified component styling approach

## Architecture Decisions

### Decision 1: Integration Strategy
- **Context:** Need to integrate explorer into homepage without breaking existing functionality
- **Decision:** Replace grid section with ExperimentExplorer component using progressive enhancement
- **Rationale:** Minimizes code changes while maintaining all existing features
- **Consequences:** 
  - Homepage will load explorer data on initial render
  - Need to handle loading states carefully
  - Must ensure SEO isn't impacted

### Decision 2: Brutalist Theming Approach
- **Context:** Explorer uses rounded corners and soft design, needs brutalist transformation
- **Decision:** Implement CSS-based theming system using Tailwind utility classes and CSS custom properties
- **Rationale:** 
  - Avoids duplicating components
  - Maintains single source of truth
  - Enables A/B testing with theme switching
- **Consequences:**
  - Need to refactor component styling to use theme variables
  - Some inline styles must be extracted

### Decision 3: Component Migration Strategy
- **Context:** Multiple navigation components need brutalist styling
- **Decision:** Create brutalist variant classes that override default styles
- **Rationale:** Allows gradual migration and easy rollback
- **Consequences:** Temporary increase in CSS bundle size until full migration

### Decision 4: Mobile Architecture
- **Context:** Brutalist design must work on mobile without sacrificing usability
- **Decision:** Adapt brutalist elements for touch interfaces while maintaining aesthetic
- **Rationale:** User experience trumps pure aesthetic on mobile
- **Consequences:** Need responsive brutalist design tokens

## Component Design

### Theme System Architecture
```typescript
// lib/theme/brutalist.ts
export const brutalistTheme = {
  borders: {
    width: '4px',
    color: 'black dark:white',
    radius: '0px' // Sharp corners
  },
  shadows: {
    default: '4px 4px 0px 0px',
    hover: '8px 8px 0px 0px',
    active: '2px 2px 0px 0px'
  },
  colors: {
    accent: '#FFFF00',
    primary: 'black',
    secondary: 'white'
  },
  typography: {
    display: 'font-black uppercase tracking-tighter',
    body: 'font-mono',
    technical: 'font-mono text-sm'
  }
};
```

### Component Styling Strategy
```tsx
// Brutalist wrapper component
export function BrutalistExplorer({ children }: { children: React.ReactNode }) {
  return (
    <div className="brutalist-theme">
      {children}
    </div>
  );
}

// CSS module approach for complex overrides
.brutalist-theme {
  /* Override all border radius */
  --radius: 0px;
  
  /* Card styling */
  .card {
    @apply border-4 border-black dark:border-white rounded-none;
    @apply shadow-[4px_4px_0px_0px_rgb(0,0,0)] dark:shadow-[4px_4px_0px_0px_rgb(255,255,255)];
  }
  
  /* Button styling */
  .button {
    @apply rounded-none border-4 font-bold uppercase;
    @apply hover:translate-x-1 hover:-translate-y-1;
    @apply hover:shadow-[8px_8px_0px_0px_rgb(0,0,0)];
  }
}
```

### Homepage Integration
```tsx
// app/page.tsx modifications
import { ExperimentExplorer } from './components/navigation';
import { BrutalistTheme } from './components/theme';

export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'explorer'>('explorer');
  
  return (
    <BrutalistTheme>
      <main>
        {/* Keep existing hero section */}
        <HeroSection />
        
        {/* Replace grid with explorer */}
        {viewMode === 'explorer' ? (
          <BrutalistExplorer>
            <ExperimentExplorerWrapper />
          </BrutalistExplorer>
        ) : (
          <ExistingGrid />
        )}
      </main>
    </BrutalistTheme>
  );
}
```

## Data Flow & Integration

### Loading Strategy
1. **Server-side**: Pre-render navigation tree structure for SEO
2. **Client-side**: Hydrate with interactive features
3. **Progressive Enhancement**: Show static tree immediately, enhance with search/filter

### API Integration
```typescript
// Shared data fetching hook
export function useExperimentData() {
  return useSWR('/api/experiments', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
}
```

## Technology Stack

### Styling Technologies
- **Tailwind CSS v4**: Primary styling with custom variant support
- **CSS Modules**: Complex brutalist overrides
- **CSS Custom Properties**: Dynamic theming

### Component Architecture
- **React 18**: Leverage server components where possible
- **TypeScript**: Strict type safety for theme system
- **clsx**: Conditional class management

### Build Optimizations
- **PostCSS**: Process brutalist utility classes
- **Turbopack**: Fast development builds
- **Tree-shaking**: Remove unused theme variants

## Security Considerations

### Content Security
- Sanitize all experiment metadata
- Validate file paths to prevent directory traversal
- Escape user-provided content in search

### Performance Security
- Rate limit search queries
- Implement virtual scrolling for large lists
- Cache navigation data appropriately

## Performance & Scalability

### Initial Load Performance
1. **Critical CSS**: Inline brutalist theme variables
2. **Code Splitting**: Lazy load explorer on homepage
3. **Preload**: Navigation data for instant interaction

### Runtime Performance
```typescript
// Virtual scrolling for large experiment lists
import { VirtualList } from '@tanstack/react-virtual';

export function OptimizedNavigationTree({ nodes }) {
  return (
    <VirtualList
      height={600}
      itemCount={nodes.length}
      itemSize={48}
      renderItem={({ index }) => <NodeItem node={nodes[index]} />}
    />
  );
}
```

### Bundle Size Optimization
- Extract brutalist styles to separate chunk
- Tree-shake unused navigation features
- Compress theme configuration

## Implementation Phases

### Phase 1: Theme Foundation (Day 1-2)
1. Create brutalist theme system
2. Build theme provider component
3. Extract reusable style utilities
4. Document theme usage

### Phase 2: Component Migration (Day 3-4)
1. Apply brutalist styles to ExperimentExplorer
2. Update sub-components (SearchBar, FilterPanel, NavigationTree)
3. Create responsive brutalist tokens
4. Test across devices

### Phase 3: Homepage Integration (Day 5)
1. Replace grid with explorer
2. Implement loading states
3. Add view mode toggle (for A/B testing)
4. Maintain `/experiments` route

### Phase 4: Polish & Optimization (Day 6)
1. Performance optimization
2. Accessibility testing
3. Cross-browser validation
4. Documentation updates

## Risks & Mitigations

### Risk 1: Design Consistency
- **Risk**: Brutalist style might clash with existing landing pages
- **Mitigation**: Create consistent brutalist component library
- **Action**: Gradually update landing pages to match

### Risk 2: Performance Impact
- **Risk**: Explorer might slow homepage load
- **Mitigation**: Implement progressive loading with SSR
- **Action**: Monitor Core Web Vitals

### Risk 3: Mobile Usability
- **Risk**: Brutalist design might be hard to use on mobile
- **Mitigation**: Adaptive brutalist design for touch
- **Action**: Extensive mobile testing

### Risk 4: SEO Impact
- **Risk**: Dynamic content might hurt SEO
- **Mitigation**: Server-side render navigation structure
- **Action**: Implement structured data

## Backward Compatibility

### Route Preservation
- Keep `/experiments` route functional
- Use same data source for both routes
- Allow theme switching via query parameter

### Progressive Enhancement
```typescript
// Support theme switching
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'brutalist';
    }
    return 'brutalist';
  });
  
  return { theme, setTheme };
}
```

## Mobile Architecture

### Responsive Brutalist Tokens
```css
/* Mobile-first brutalist design */
@media (max-width: 768px) {
  .brutalist-theme {
    /* Reduce border width on mobile */
    --border-width: 2px;
    
    /* Smaller shadows for performance */
    --shadow-offset: 2px;
    
    /* Maintain uppercase but smaller */
    --text-transform: uppercase;
    --text-size-adjust: 0.9;
  }
}
```

### Touch Optimizations
- Increase tap targets to 44px minimum
- Add touch feedback with active states
- Simplify hover effects for touch

## Monitoring & Analytics

### Performance Metrics
- Track explorer load time
- Monitor interaction responsiveness
- Measure search performance

### User Engagement
- Track explorer vs grid usage (A/B test)
- Monitor search queries
- Analyze navigation patterns

## Next Steps

1. **Immediate Actions**:
   - Create brutalist theme system
   - Set up A/B testing infrastructure
   - Begin component style extraction

2. **Development Priorities**:
   - Theme provider implementation
   - Explorer component styling
   - Homepage integration

3. **Testing Requirements**:
   - Cross-browser brutalist rendering
   - Mobile usability testing
   - Performance benchmarking

4. **Documentation Needs**:
   - Theme customization guide
   - Component styling patterns
   - Migration checklist