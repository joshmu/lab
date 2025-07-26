# Architecture: Filetree Explorer Layout for Josh Mu's Lab

**Project ID:** 20250726-172502

**Created:** July 26, 2025

**References:** `docs/prd/20250726-172502-filetree-explorer.md`

## Executive Summary

This architecture document outlines the design for implementing a scalable filetree explorer navigation system to replace the current hardcoded landing page grid in Josh Mu's experimental lab. The solution leverages file-based metadata, React Server Components, and a modular component architecture to provide an intuitive, performant, and maintainable navigation experience that scales from 6 to 50+ experiments.

The architecture emphasizes developer experience through convention-over-configuration patterns, type safety, and hot-reload capabilities while maintaining compatibility with the existing Turborepo monorepo structure.

## System Overview

### Current State Analysis

The existing system demonstrates several architectural strengths and limitations:

**Strengths:**
- Well-structured Turborepo monorepo with pnpm workspaces
- Clean separation between apps (`web`, `docs`) and shared packages (`ui`, `eslint-config`, `typescript-config`)
- Modern Next.js 14 with App Router and TypeScript throughout
- Consistent design system with reusable UI components
- Efficient build pipeline with Turbo caching

**Limitations:**
- Hardcoded experiment data in main page component (lines 11-84 in `apps/web/app/page.tsx`)
- No systematic approach for adding new experiments
- Lack of metadata schema for experiment categorization
- Limited scalability for navigation beyond current grid layout
- No search or filtering capabilities

### Proposed Architecture Changes

The new architecture introduces four key layers:

1. **Data Layer**: File-based metadata system with JSON schema validation
2. **Service Layer**: Experiment discovery and metadata processing services  
3. **Component Layer**: Modular navigation components with virtualization
4. **Integration Layer**: Next.js routing and build-time optimization

## Architecture Decisions

### Decision 1: File-Based Metadata System
- **Context**: Need to eliminate hardcoded experiment data and enable easy content management
- **Decision**: Implement convention-based file structure with JSON metadata files
- **Rationale**: Aligns with developer workflow, enables hot-reload, and provides clear separation of content from code
- **Consequences**: Requires build-time processing but enables scalable content management

### Decision 2: React Server Components for Data Processing
- **Context**: Need efficient experiment metadata loading without client-side overhead
- **Decision**: Use Next.js Server Components for metadata processing and static generation
- **Rationale**: Leverages Next.js 14 App Router capabilities for optimal performance and SEO
- **Consequences**: Some client interactivity requires hydration boundary management

### Decision 3: Modular Component Architecture
- **Context**: Need flexible navigation that works across desktop, tablet, and mobile
- **Decision**: Create composable navigation components with responsive layouts
- **Rationale**: Enables code reuse, easier testing, and maintainable responsive design
- **Consequences**: Requires careful prop interface design and state management

### Decision 4: Build-Time Optimization
- **Context**: Need fast navigation performance with large experiment collections
- **Decision**: Pre-process metadata during build with runtime lazy loading
- **Rationale**: Balances initial load performance with dynamic content capabilities
- **Consequences**: Adds complexity to build pipeline but ensures optimal user experience

## Component Design

### Core Components Architecture

```
ExperimentNavigator (Container)
├── FileTree (Navigation Structure)
│   ├── TreeNode (Individual Items)
│   │   ├── FolderNode (Categories)
│   │   └── ExperimentNode (Leaf Items)
│   └── VirtualizedList (Performance)
├── SearchBar (Filtering)
├── Breadcrumbs (Navigation Context)
└── ExperimentPreview (Content Area)
```

### Component Specifications

#### ExperimentNavigator
**Location**: `apps/web/app/components/ExperimentNavigator.tsx`
**Purpose**: Root container managing navigation state and layout
**Props Interface**:
```typescript
interface ExperimentNavigatorProps {
  experiments: ExperimentMetadata[];
  initialCategory?: string;
  layout: 'sidebar' | 'overlay' | 'drawer';
  searchEnabled?: boolean;
}
```

#### FileTree  
**Location**: `apps/web/app/components/FileTree/index.tsx`
**Purpose**: Hierarchical navigation structure with expand/collapse
**Key Features**:
- Virtualization for 50+ experiments
- Keyboard navigation support
- Drag-and-drop reordering (Phase 3)
- Search result highlighting

#### TreeNode Components
**Location**: `apps/web/app/components/FileTree/nodes/`
**Purpose**: Individual navigation items with type-specific rendering
**Variants**:
- `FolderNode.tsx`: Collapsible categories with child count
- `ExperimentNode.tsx`: Leaf items with metadata badges
- `SearchResultNode.tsx`: Highlighted search matches

#### SearchBar
**Location**: `apps/web/app/components/SearchBar.tsx`
**Purpose**: Real-time filtering with fuzzy search capabilities
**Implementation**: Fuse.js for client-side search with debounced input

### Shared UI Components Integration

Leverage existing `@repo/ui` components with extensions:

- **Button**: Use for navigation actions and CTAs
- **Card**: Extend for experiment preview cards
- **Badge**: Use for technology tags and difficulty indicators
- **New Components Needed**:
  - `TreeView`: Base tree navigation component
  - `VirtualList`: Performance-optimized list rendering
  - `SearchInput`: Enhanced input with keyboard shortcuts

## Data Architecture

### Experiment Metadata Schema

**Location**: `apps/web/types/experiment.ts`

```typescript
interface ExperimentMetadata {
  // Core Identity
  id: string;                    // Unique identifier (generated from path)
  slug: string;                  // URL-friendly identifier
  
  // Content
  title: string;                 // Display name
  description: string;           // Brief description (max 160 chars)
  longDescription?: string;      // Detailed description with markdown
  
  // Organization
  category: ExperimentCategory;  // Primary categorization
  subcategory?: string;          // Optional secondary grouping
  tags: string[];               // Searchable keywords
  
  // Technical Metadata
  technology: TechStack[];       // Technologies demonstrated
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  complexity: number;            // 1-5 scale for sorting
  
  // Media
  preview?: string;              // Screenshot/thumbnail path
  demo?: string;                // Live demo URL
  source?: string;              // Source code URL
  
  // Timestamps
  created: string;              // ISO date string
  updated: string;              // ISO date string
  
  // Status
  status: 'draft' | 'published' | 'archived';
  featured: boolean;            // Highlight in featured section
  
  // Analytics (Phase 3)
  views?: number;               // View count
  likes?: number;               // User engagement
}

type ExperimentCategory = 
  | 'animations'
  | 'data-visualization' 
  | 'interactions'
  | 'layouts'
  | 'effects'
  | 'prototypes'
  | 'algorithms';

type TechStack = 
  | 'react'
  | 'nextjs'
  | 'typescript'
  | 'threejs'
  | 'framer-motion'
  | 'canvas'
  | 'webgl'
  | 'css-animations'
  | 'd3'
  | 'gsap';
```

### File Structure Convention

```
apps/web/experiments/
├── animations/
│   ├── particle-system/
│   │   ├── metadata.json       # Experiment metadata
│   │   ├── page.tsx           # Next.js page component
│   │   ├── components/        # Experiment-specific components
│   │   └── assets/           # Images, videos, etc.
│   └── liquid-morphing/
│       ├── metadata.json
│       └── page.tsx
├── data-visualization/
│   └── cyber-grid/
│       ├── metadata.json
│       └── page.tsx
└── effects/
    ├── glitch-art/
    └── digital-rain/
```

### Metadata Processing Pipeline

**Build-Time Processing**:
1. **Discovery**: Scan `experiments/` directory for `metadata.json` files
2. **Validation**: Validate against JSON schema
3. **Enrichment**: Generate derived fields (id, slug, file paths)
4. **Optimization**: Create search index and navigation tree
5. **Generation**: Output optimized data structures for runtime

**Runtime Data Access**:
```typescript
// Server Component data fetching
async function getExperiments(): Promise<ExperimentMetadata[]> {
  const experimentsData = await import('../data/experiments.json');
  return experimentsData.experiments;
}

// Client-side search index
import searchIndex from '../data/search-index.json';
```

## Data Flow & Integration

### Navigation State Management

Using React Context for navigation state with optimistic updates:

```typescript
interface NavigationState {
  // Current State
  activeExperiment: string | null;
  expandedCategories: Set<string>;
  searchQuery: string;
  
  // Filters
  selectedCategories: string[];
  selectedTechnologies: string[];
  difficultyFilter: string[];
  
  // UI State
  sidebarExpanded: boolean;
  viewMode: 'tree' | 'grid' | 'list';
}
```

### Data Flow Architecture

```
Build Time:
File System → Metadata Scanner → Validation → Index Generation → Static Assets

Runtime:
Static Assets → Server Components → Hydration → Client Interactions → State Updates
```

### Integration with Next.js Routing

Maintain existing routing structure while adding dynamic experiment routes:

```
app/
├── page.tsx                    # Updated home with navigator
├── experiments/
│   └── [category]/
│       └── [slug]/
│           └── page.tsx        # Dynamic experiment pages
└── components/
    └── ExperimentNavigator/    # Navigation components
```

## Technology Stack

### Core Technologies

**Frontend Framework**: Next.js 14.2+
- App Router for optimal performance
- Server Components for metadata processing
- Static generation for experiment pages
- Image optimization for previews

**State Management**: React Context + useReducer
- Lightweight for navigation state
- Avoid over-engineering with external libraries
- Server state handled by Next.js data fetching

**Styling**: Tailwind CSS (existing)
- Maintain current design system consistency
- Extend with navigation-specific utilities
- CSS Grid for responsive layouts

**TypeScript**: Strict configuration
- Comprehensive type definitions for metadata
- Runtime validation with zod schema
- Build-time type checking

### Performance Libraries

**Virtualization**: @tanstack/react-virtual
- Handle 50+ experiments efficiently
- Smooth scrolling performance
- Dynamic height calculation

**Search**: Fuse.js
- Client-side fuzzy search
- Configurable search weights
- Small bundle size (~12KB)

**Icons**: Lucide React (existing)
- Consistent icon system
- Good performance characteristics
- Extensive icon library

### Development Tools

**Schema Validation**: Zod
- Runtime metadata validation
- TypeScript integration
- Detailed error messages

**Build Processing**: Custom Node.js scripts
- Metadata discovery and processing
- Search index generation
- Asset optimization

**Testing**: Jest + React Testing Library
- Component unit tests
- Integration test for navigation flows
- Performance benchmarking

## Security Considerations

### Input Validation & Sanitization

**Metadata Validation**:
- JSON schema validation at build time
- Runtime validation with Zod schemas
- Sanitize user-provided descriptions and content
- Prevent XSS through proper escaping

**File System Security**:
- Restrict metadata file access to designated directories
- Validate file paths to prevent directory traversal
- Content Security Policy headers for embedded experiments

### Data Integrity

**Build-Time Checks**:
- Validate all experiment metadata before deployment
- Ensure required assets exist (previews, pages)
- Check for duplicate IDs or slugs
- Verify internal link consistency

**Runtime Protection**:
- Sanitize search queries
- Rate limiting for search operations
- Error boundaries for failed component loads

## Performance & Scalability

### Performance Optimization Strategy

**Initial Load Performance**:
- Static generation of navigation data (< 1s load time)
- Code splitting for experiment components
- Image optimization with Next.js Image component
- Critical CSS inlining for above-fold content

**Runtime Performance**:
- Virtual scrolling for large experiment lists
- Debounced search with 300ms delay
- Memoized navigation tree computation
- Lazy loading of experiment previews

**Bundle Size Management**:
- Tree shaking for unused utilities
- Dynamic imports for heavy components
- Optimized icon loading
- Compress navigation data with gzip

### Scalability Architecture

**Data Scalability**:
- Efficient tree traversal algorithms (O(log n))
- Indexed search with pre-computed weights
- Pagination for very large collections
- Category-based lazy loading

**Component Scalability**:
- Modular component architecture
- Configurable navigation layouts
- Plugin architecture for custom experiment types
- Theme system for visual customization

**Build Scalability**:
- Incremental build optimization
- Parallel metadata processing
- Cached search index generation
- Asset compression pipeline

## Integration Points

### Existing Turborepo Integration

**Package Dependencies**:
```json
{
  "dependencies": {
    "@repo/ui": "workspace:*",           // Shared UI components
    "@repo/typescript-config": "workspace:*", // TypeScript config
    "@repo/eslint-config": "workspace:*"     // ESLint rules
  }
}
```

**Build Pipeline Integration**:
- Extend existing Turbo tasks for metadata processing
- Add navigation build step to dependency graph
- Maintain compatibility with current dev workflow
- Integrate with existing lint and type-check processes

### Next.js App Router Integration

**Layout Integration**:
```typescript
// apps/web/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ExperimentNavigator>
          {children}
        </ExperimentNavigator>
      </body>
    </html>
  );
}
```

**Route Integration**:
- Maintain existing experiment routes (`/landing-1`, etc.)
- Add new dynamic routes (`/experiments/[category]/[slug]`)
- Implement automatic redirects for legacy URLs
- Generate sitemap for SEO optimization

### Development Workflow Integration

**Hot Reload Support**:
- Watch metadata.json files for changes
- Automatic navigation tree updates
- Component-level hot module replacement
- Development error boundaries with helpful messages

**Build Tool Integration**:
- Custom Turbo generators for new experiments
- ESLint rules for metadata validation
- Prettier formatting for JSON files
- Git hooks for metadata consistency

## Migration Strategy

### Phase 1: Foundation & Data Migration (Weeks 1-2)

**Week 1: Data Layer Implementation**
- Create experiment metadata schema and validation
- Implement file-based metadata discovery system
- Build metadata processing pipeline
- Convert existing 6 experiments to new format

**Week 2: Core Navigation Components**
- Develop basic FileTree component with expand/collapse
- Create TreeNode variants (Folder/Experiment)
- Implement responsive layout container
- Add keyboard navigation support

**Migration Steps**:
1. Create `experiments/` directory structure
2. Generate metadata.json for existing experiments
3. Build metadata processing scripts
4. Create basic navigation components
5. Update home page to use new navigation
6. Ensure existing experiment routes continue working

### Phase 2: Enhancement & Polish (Weeks 3-4)

**Week 3: Search & Filtering**
- Implement client-side search with Fuse.js
- Add category and technology filtering
- Create search result highlighting
- Build advanced filter UI

**Week 4: Performance & Visual Polish**
- Add virtualization for large experiment lists
- Implement lazy loading for experiment previews
- Create loading states and error boundaries
- Add animations and micro-interactions

**Enhancement Steps**:
1. Integrate search functionality
2. Add filtering capabilities
3. Implement performance optimizations
4. Polish visual design and interactions
5. Add mobile-responsive navigation
6. Conduct performance testing

### Phase 3: Advanced Features & Developer Tools (Weeks 5-6)

**Week 5: Developer Experience**
- Create experiment template generator
- Build metadata validation tools
- Add development-time error checking
- Implement bulk operations interface

**Week 6: Analytics & Advanced Features**
- Add experiment view tracking
- Implement favorites/bookmarking
- Create experiment comparison views
- Build export/sharing capabilities

**Advanced Steps**:
1. Create developer tooling
2. Add analytics integration
3. Implement advanced user features
4. Create comprehensive documentation
5. Conduct user acceptance testing
6. Prepare for production deployment

### Backward Compatibility Strategy

**URL Preservation**:
- Maintain existing `/landing-*` routes during transition
- Implement automatic redirects to new structure
- Use Next.js redirects for SEO preservation
- Gradual migration of external links

**Data Migration**:
- Automated scripts to convert hardcoded data
- Validation of converted metadata
- Rollback procedures for migration issues
- A/B testing framework for gradual rollout

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
**Technical Implementation**:

1. **Metadata Schema & Validation**
   ```typescript
   // apps/web/types/experiment.ts
   import { z } from 'zod';
   
   export const ExperimentMetadataSchema = z.object({
     id: z.string(),
     title: z.string().min(1).max(100),
     description: z.string().max(160),
     category: z.enum(['animations', 'data-visualization', 'interactions']),
     tags: z.array(z.string()).max(10),
     technology: z.array(z.string()),
     difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
     created: z.string().datetime(),
     updated: z.string().datetime(),
     status: z.enum(['draft', 'published', 'archived']).default('published'),
     featured: z.boolean().default(false)
   });
   ```

2. **Build-Time Processing**
   ```typescript
   // scripts/process-experiments.ts
   import fs from 'fs/promises';
   import path from 'path';
   import { ExperimentMetadataSchema } from '../apps/web/types/experiment';
   
   async function processExperiments() {
     const experimentsDir = path.join(process.cwd(), 'apps/web/experiments');
     const experiments = await discoverExperiments(experimentsDir);
     const validatedExperiments = experiments.map(validateMetadata);
     await generateNavigationData(validatedExperiments);
     await generateSearchIndex(validatedExperiments);
   }
   ```

3. **Core Navigation Components**
   ```typescript
   // apps/web/app/components/ExperimentNavigator.tsx
   'use client';
   
   interface ExperimentNavigatorProps {
     experiments: ExperimentMetadata[];
     children: React.ReactNode;
   }
   
   export function ExperimentNavigator({ experiments, children }: ExperimentNavigatorProps) {
     const [navigationState, dispatch] = useReducer(navigationReducer, initialState);
     
     return (
       <NavigationContext.Provider value={{ state: navigationState, dispatch }}>
         <div className="flex h-screen">
           <FileTreeSidebar experiments={experiments} />
           <main className="flex-1 overflow-auto">
             {children}
           </main>
         </div>
       </NavigationContext.Provider>
     );
   }
   ```

**Deliverables**:
- Complete metadata schema with validation
- File-based experiment discovery system
- Basic navigation components
- Migration of existing 6 experiments
- Updated home page with new navigation

### Phase 2: Enhancement (Weeks 3-4)
**Technical Implementation**:

1. **Search Integration**
   ```typescript
   // apps/web/app/components/SearchBar.tsx
   import Fuse from 'fuse.js';
   
   const searchOptions = {
     keys: ['title', 'description', 'tags', 'technology'],
     threshold: 0.3,
     includeMatches: true
   };
   
   export function SearchBar({ experiments, onResults }: SearchBarProps) {
     const fuse = useMemo(() => new Fuse(experiments, searchOptions), [experiments]);
     
     const handleSearch = useDebouncedCallback((query: string) => {
       const results = query ? fuse.search(query) : experiments;
       onResults(results);
     }, 300);
   }
   ```

2. **Virtualization Implementation**
   ```typescript
   // apps/web/app/components/FileTree/VirtualizedTree.tsx
   import { useVirtualizer } from '@tanstack/react-virtual';
   
   export function VirtualizedTree({ items }: VirtualizedTreeProps) {
     const parentRef = useRef<HTMLDivElement>(null);
     
     const virtualizer = useVirtualizer({
       count: items.length,
       getScrollElement: () => parentRef.current,
       estimateSize: () => 48, // Base height per item
       overscan: 10
     });
   }
   ```

**Deliverables**:
- Full-featured search with fuzzy matching
- Category and technology filtering
- Performance optimization with virtualization
- Mobile-responsive navigation
- Visual polish and animations

### Phase 3: Advanced Features (Weeks 5-6)
**Technical Implementation**:

1. **Developer Tooling**
   ```typescript
   // scripts/create-experiment.ts
   import inquirer from 'inquirer';
   
   async function createExperiment() {
     const answers = await inquirer.prompt([
       { name: 'title', message: 'Experiment title:' },
       { name: 'category', type: 'list', choices: categories },
       { name: 'technology', type: 'checkbox', choices: techStack }
     ]);
     
     await generateExperimentScaffolding(answers);
   }
   ```

2. **Analytics Integration**
   ```typescript
   // apps/web/app/hooks/useExperimentAnalytics.ts
   export function useExperimentAnalytics(experimentId: string) {
     useEffect(() => {
       // Track experiment view
       analytics.track('experiment_viewed', {
         experiment_id: experimentId,
         timestamp: new Date().toISOString()
       });
     }, [experimentId]);
   }
   ```

**Deliverables**:
- Experiment template generator
- Analytics tracking system
- Advanced user features (favorites, comparison)
- Comprehensive documentation
- Production deployment readiness

## Risks & Mitigations

### High Risk: Performance Degradation
**Risk**: Large experiment collections could impact navigation performance
**Impact**: Poor user experience, slow search responses
**Mitigation Strategies**:
- Implement virtualization from Phase 1
- Use incremental search indexing
- Add performance monitoring and alerts
- Create fallback pagination if virtualization fails
- Conduct load testing with 100+ experiments

### High Risk: Migration Complexity  
**Risk**: Converting existing experiments might break functionality
**Impact**: Broken experiment pages, lost functionality
**Mitigation Strategies**:
- Maintain backward compatibility for existing routes
- Create automated migration scripts with validation
- Implement rollback procedures
- Use feature flags for gradual rollout
- Extensive testing of migrated experiments

### Medium Risk: Search Performance
**Risk**: Client-side search might be slow with many experiments
**Impact**: Delayed search results, poor user experience
**Mitigation Strategies**:
- Implement debounced search (300ms delay)
- Use efficient search libraries (Fuse.js)
- Add search result pagination
- Consider server-side search for 50+ experiments
- Monitor search performance metrics

### Medium Risk: Mobile Navigation Complexity
**Risk**: Complex navigation might not translate well to mobile
**Impact**: Poor mobile user experience
**Mitigation Strategies**:
- Design mobile-first navigation patterns
- Use native mobile interaction patterns (drawers, bottom sheets)
- Implement touch-optimized interactions
- Conduct mobile-specific user testing
- Create progressive enhancement for mobile features

### Low Risk: Browser Compatibility
**Risk**: Modern JavaScript features might not work in older browsers
**Impact**: Broken navigation for some users
**Mitigation Strategies**:
- Use progressive enhancement techniques
- Implement polyfills for critical features
- Test across target browser matrix
- Provide fallback experiences
- Monitor browser analytics for usage patterns

### Low Risk: Build Pipeline Integration
**Risk**: New build steps might conflict with existing Turbo pipeline
**Impact**: Broken builds, deployment issues
**Mitigation Strategies**:
- Test build integration in isolated environment
- Implement gradual integration with existing pipeline
- Create comprehensive build documentation
- Add build step monitoring and alerting
- Maintain build performance benchmarks

## Future Considerations

### Post-Launch Enhancement Roadmap

**Quarter 1 (Post-Launch)**:
- **Performance Optimization**: Implement advanced caching strategies
- **User Experience**: Add keyboard shortcuts and accessibility improvements  
- **Developer Experience**: Create VS Code extension for experiment management
- **Analytics**: Implement detailed user behavior tracking

**Quarter 2**:
- **Social Features**: Add experiment sharing and collaboration capabilities
- **Content Management**: Build web-based experiment editor
- **Integration**: Connect with external CMS for non-technical updates
- **Export**: Generate portfolio presentations from experiment collections

**Quarter 3**:
- **AI Integration**: Automatic experiment categorization and tagging
- **Advanced Search**: Semantic search capabilities with embeddings
- **Personalization**: User preferences and recommended experiments
- **Multi-tenancy**: Support for multiple portfolio owners

### Technology Evolution Considerations

**Framework Migration Preparedness**:
- Abstract navigation logic from React-specific implementations
- Use standard web APIs where possible
- Maintain clear separation between data layer and UI components
- Document architectural decisions for future migrations

**Scalability Evolution**:
- Plan for server-side rendering of navigation for very large collections
- Consider GraphQL integration for complex querying needs
- Prepare for real-time updates and collaborative editing
- Design for internationalization and multi-language support

**Integration Expansion**:
- API-first design for third-party integrations
- Webhook support for external content management systems
- Plugin architecture for custom experiment types
- Export APIs for portfolio generation tools

### Performance Monitoring Strategy

**Key Metrics to Track**:
- Navigation component load time (target: <1s)
- Search response time (target: <300ms)
- Time to first interaction (target: <2s)
- Bundle size impact (target: <10% increase)
- User engagement with navigation features

**Monitoring Implementation**:
- Real User Monitoring (RUM) with Core Web Vitals
- Custom performance marks for navigation interactions
- Error tracking for navigation failures
- User behavior analytics for navigation patterns
- Build-time performance regression testing

---

This architecture document provides a comprehensive technical foundation for implementing the filetree explorer layout. The modular design ensures maintainability while the phased approach enables iterative delivery and risk mitigation. The solution balances technical excellence with practical implementation constraints, positioning the lab for sustainable growth and enhanced user experience.