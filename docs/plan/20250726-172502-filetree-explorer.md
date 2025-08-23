# Implementation Plan: Brutalist Filetree Explorer for Josh Mu's Lab

**Project ID:** 20250726-172502
**Created:** July 26, 2025
**References:**

- `docs/prd/20250726-172502-filetree-explorer.md`
- `docs/arch/20250726-172502-filetree-explorer.md`
- `docs/spec/20250726-172502-filetree-explorer.md`

## Executive Summary

This implementation plan details the systematic approach to transform Josh Mu's Lab homepage with a brutalist-styled filetree explorer. The plan prioritizes incremental delivery with clear milestones, ensuring backward compatibility while introducing bold brutalist aesthetics. Total estimated effort: 28 hours across 6 phases, with multiple QA checkpoints and rollback strategies at each stage.

## Implementation Strategy

### Approach

The implementation follows a progressive enhancement strategy:

1. **Theme Foundation First**: Establish brutalist design system before component updates
2. **Component-by-Component Migration**: Transform existing components incrementally
3. **Homepage Integration Last**: Minimize risk by testing components in isolation first
4. **Continuous QA Integration**: Verify each task completion before proceeding

### Phases

1. **Phase 1**: Brutalist Theme System Setup (4 hours)
2. **Phase 2**: Core Component Transformations (8 hours)
3. **Phase 3**: Homepage Integration (6 hours)
4. **Phase 4**: Animation & Interactions (4 hours)
5. **Phase 5**: Testing & Documentation (4 hours)
6. **Phase 6**: Performance Optimization (2 hours)

### Success Criteria

- All existing functionality preserved
- Brutalist theme consistently applied across components
- Performance metrics maintained (<1s load time)
- Mobile responsiveness verified
- Accessibility standards met (WCAG 2.1 AA)

## Task Breakdown

### Phase 1: Brutalist Theme System Setup (4 hours)

#### Task 1.1: Create Theme Foundation Files

- **Description:** Set up brutalist theme system with constants, types, and utilities
- **Acceptance Criteria:**
  - Create `/apps/web/lib/theme/brutalist.ts` with theme object
  - Create `/apps/web/lib/theme/types.ts` with TypeScript interfaces
  - Create `/apps/web/lib/theme/constants.ts` with category colors
  - All files properly typed and exported
- **Dependencies:** None
- **Estimated Effort:** Medium (1.5 hours)
- **Files to Create:**
  - `/apps/web/lib/theme/brutalist.ts`
  - `/apps/web/lib/theme/types.ts`
  - `/apps/web/lib/theme/constants.ts`
  - `/apps/web/lib/theme/utils.ts`
- **QA Requirements:** Verify TypeScript compilation without errors
- **Status:** Pending
- **QA Review:** Pending

```bash
# Create theme directory structure
mkdir -p apps/web/lib/theme
touch apps/web/lib/theme/{brutalist.ts,types.ts,constants.ts,utils.ts}
```

#### Task 1.2: Implement CSS Custom Properties

- **Description:** Add brutalist CSS variables and utility classes to globals.css
- **Acceptance Criteria:**
  - Add brutalist design tokens to `apps/web/app/globals.css`
  - Create brutalist utility classes (.brutalist-border, .brutalist-shadow)
  - Verify CSS variables work in both light and dark modes
- **Dependencies:** Task 1.1
- **Estimated Effort:** Low (1 hour)
- **Files to Modify:** `/apps/web/app/globals.css`
- **QA Requirements:** Test CSS variables in browser DevTools
- **Status:** Pending
- **QA Review:** Pending

#### Task 1.3: Update Tailwind Configuration

- **Description:** Extend Tailwind config with brutalist animations and shadows
- **Acceptance Criteria:**
  - Add custom animations (brutalist-glitch, brutalist-slam)
  - Add brutalist shadow utilities
  - Update safelist with dynamic shadow classes
- **Dependencies:** Task 1.2
- **Estimated Effort:** Low (0.5 hours)
- **Files to Modify:** `/apps/web/tailwind.config.js`
- **QA Requirements:** Verify Tailwind classes generate correctly
- **Status:** Pending
- **QA Review:** Pending

#### Task 1.4: Create Theme Utility Functions

- **Description:** Build helper functions for applying brutalist styles
- **Acceptance Criteria:**
  - Implement `generateBrutalistClasses()` function
  - Implement `getBrutalistCategoryStyle()` function
  - Create `withBrutalistStyles()` HOC pattern
  - Add proper TypeScript types
- **Dependencies:** Task 1.1
- **Estimated Effort:** Medium (1 hour)
- **Files to Modify:** `/apps/web/lib/theme/utils.ts`
- **QA Requirements:** Unit tests for utility functions
- **Status:** Pending
- **QA Review:** Pending

### Phase 2: Core Component Transformations (8 hours)

#### Task 2.1: Create Brutalist Component Directory

- **Description:** Set up directory structure for brutalist navigation components
- **Acceptance Criteria:**
  - Create brutalist component directories
  - Set up index files for exports
  - Maintain clean separation from existing components
- **Dependencies:** Phase 1 complete
- **Estimated Effort:** Low (0.5 hours)
- **Files to Create:**
  - `/apps/web/app/components/navigation/brutalist/` directory
  - Index files for each component
- **QA Requirements:** Verify directory structure and exports
- **Status:** Pending
- **QA Review:** Pending

```bash
# Create brutalist component directories
mkdir -p apps/web/app/components/navigation/brutalist
mkdir -p apps/web/app/components/ui/brutalist
```

#### Task 2.2: Transform NavigationTree Component

- **Description:** Create BrutalistNavigationTree wrapper with brutal styling
- **Acceptance Criteria:**
  - Component applies brutalist borders and shadows
  - Category-specific colors work correctly
  - Hover states have transform effects
  - Original NavigationTree functionality preserved
- **Dependencies:** Task 2.1
- **Estimated Effort:** High (2 hours)
- **Files to Create:** `/apps/web/app/components/navigation/brutalist/BrutalistNavigationTree.tsx`
- **QA Requirements:**
  - Test expand/collapse functionality
  - Verify category colors apply correctly
  - Check hover animations work
- **Status:** Pending
- **QA Review:** Pending

#### Task 2.3: Transform SearchBar Component

- **Description:** Create BrutalistSearchBar with bold aesthetics
- **Acceptance Criteria:**
  - Yellow accent block for search icon
  - Focus state triggers shadow expansion
  - Clear button with hover effect
  - Uppercase placeholder text
- **Dependencies:** Task 2.1
- **Estimated Effort:** Medium (1.5 hours)
- **Files to Create:** `/apps/web/app/components/navigation/brutalist/BrutalistSearchBar.tsx`
- **QA Requirements:**
  - Test search functionality
  - Verify focus/blur states
  - Check clear button works
- **Status:** Pending
- **QA Review:** Pending

#### Task 2.4: Transform FilterPanel Component

- **Description:** Create BrutalistFilterPanel with brutal UI elements
- **Acceptance Criteria:**
  - Bold borders on filter options
  - Brutal checkbox/radio styles
  - Slam animation on selection
  - Maintain filter logic
- **Dependencies:** Task 2.1
- **Estimated Effort:** Medium (1.5 hours)
- **Files to Create:** `/apps/web/app/components/navigation/brutalist/BrutalistFilterPanel.tsx`
- **QA Requirements:**
  - Test all filter combinations
  - Verify animations trigger correctly
  - Check state management works
- **Status:** Pending
- **QA Review:** Pending

#### Task 2.5: Create BrutalistExperimentCard

- **Description:** Design experiment cards with brutalist styling
- **Acceptance Criteria:**
  - Category-specific shadow colors
  - Hover transform effects
  - Bold typography for titles
  - Support grid and detail views
- **Dependencies:** Task 2.1
- **Estimated Effort:** High (2 hours)
- **Files to Create:** `/apps/web/app/components/navigation/brutalist/BrutalistExperimentCard.tsx`
- **QA Requirements:**
  - Test both grid and detail layouts
  - Verify category colors apply
  - Check responsive behavior
- **Status:** Pending
- **QA Review:** Pending

#### Task 2.6: Create Supporting Brutalist UI Components

- **Description:** Build BrutalistButton, BrutalistCard, and BrutalistBadge
- **Acceptance Criteria:**
  - Each component follows brutalist design principles
  - Reusable across the application
  - Properly typed with TypeScript
- **Dependencies:** Task 2.1
- **Estimated Effort:** Low (0.5 hours)
- **Files to Create:**
  - `/apps/web/app/components/ui/brutalist/BrutalistButton.tsx`
  - `/apps/web/app/components/ui/brutalist/BrutalistCard.tsx`
  - `/apps/web/app/components/ui/brutalist/BrutalistBadge.tsx`
- **QA Requirements:** Component visual testing
- **Status:** Pending
- **QA Review:** Pending

### Phase 3: Homepage Integration (6 hours)

#### Task 3.1: Analyze Current Homepage Implementation

- **Description:** Review existing homepage structure and identify integration points
- **Acceptance Criteria:**
  - Document current component usage
  - Identify state management patterns
  - Map data flow for experiments
  - Plan integration approach
- **Dependencies:** Phase 2 complete
- **Estimated Effort:** Low (0.5 hours)
- **Files to Modify:** None (analysis only)
- **QA Requirements:** Review integration plan
- **Status:** Pending
- **QA Review:** Pending

#### Task 3.2: Add Toggle for Tree vs Grid View

- **Description:** Implement view mode toggle on homepage
- **Acceptance Criteria:**
  - Brutalist toggle button switches between views
  - State persists during session
  - Smooth transition between layouts
  - Mobile-friendly toggle placement
- **Dependencies:** Task 3.1
- **Estimated Effort:** Medium (1 hour)
- **Files to Modify:** `/apps/web/app/page.tsx`
- **QA Requirements:** Test toggle functionality on all devices
- **Status:** Pending
- **QA Review:** Pending

#### Task 3.3: Integrate Filetree Explorer Layout

- **Description:** Add brutalist filetree explorer to homepage
- **Acceptance Criteria:**
  - Three-column layout on desktop (search/tree, content)
  - Responsive breakpoints for tablet/mobile
  - Selected experiment shows in detail panel
  - Search and filters work correctly
- **Dependencies:** Task 3.2
- **Estimated Effort:** High (2.5 hours)
- **Files to Modify:** `/apps/web/app/page.tsx`
- **QA Requirements:**
  - Test responsive layouts
  - Verify experiment selection
  - Check search/filter integration
- **Status:** Pending
- **QA Review:** Pending

#### Task 3.4: Update Grid View with Brutalist Cards

- **Description:** Apply brutalist styling to existing grid layout
- **Acceptance Criteria:**
  - Grid uses BrutalistExperimentCard
  - Maintains current grid responsiveness
  - Category colors apply correctly
  - Hover effects work in grid
- **Dependencies:** Task 3.3
- **Estimated Effort:** Medium (1 hour)
- **Files to Modify:** `/apps/web/app/page.tsx`
- **QA Requirements:** Test grid layout on various screen sizes
- **Status:** Pending
- **QA Review:** Pending

#### Task 3.5: Implement Homepage State Management

- **Description:** Set up state for navigation, search, and selection
- **Acceptance Criteria:**
  - Search query updates both views
  - Selected experiment persists
  - Filter state shared between components
  - No unnecessary re-renders
- **Dependencies:** Task 3.4
- **Estimated Effort:** Medium (1 hour)
- **Files to Modify:** `/apps/web/app/page.tsx`
- **QA Requirements:** Test state synchronization
- **Status:** Pending
- **QA Review:** Pending

### Phase 4: Animation & Interactions (4 hours)

#### Task 4.1: Implement Hover Shadow Effects

- **Description:** Add dynamic shadow transforms on hover
- **Acceptance Criteria:**
  - Shadows shift on hover (translate effect)
  - Smooth transitions (200ms)
  - Works on all brutalist components
  - Mobile touch states handled
- **Dependencies:** Phase 3 complete
- **Estimated Effort:** Medium (1 hour)
- **Files to Modify:** All brutalist components
- **QA Requirements:** Test hover states across components
- **Status:** Pending
- **QA Review:** Pending

#### Task 4.2: Add Transform Animations

- **Description:** Implement slam and glitch animations
- **Acceptance Criteria:**
  - Slam animation on clicks
  - Glitch effect for active states
  - Animations respect reduced motion
  - Performance remains smooth
- **Dependencies:** Task 4.1
- **Estimated Effort:** Medium (1.5 hours)
- **Files to Modify:** CSS animations and component triggers
- **QA Requirements:**
  - Test animation performance
  - Verify reduced motion support
- **Status:** Pending
- **QA Review:** Pending

#### Task 4.3: Create Loading States

- **Description:** Design brutalist loading indicators
- **Acceptance Criteria:**
  - Skeleton screens with brutal aesthetics
  - Loading states for async operations
  - Error states with brutal styling
  - Consistent across components
- **Dependencies:** Task 4.2
- **Estimated Effort:** Low (0.5 hours)
- **Files to Create:** Loading state components
- **QA Requirements:** Test loading states
- **Status:** Pending
- **QA Review:** Pending

#### Task 4.4: Enhance Keyboard Navigation

- **Description:** Add keyboard shortcuts and improve focus management
- **Acceptance Criteria:**
  - Arrow keys navigate tree
  - Search has keyboard shortcut (Cmd/Ctrl+K)
  - Focus indicators follow brutal theme
  - Tab order is logical
- **Dependencies:** Task 4.3
- **Estimated Effort:** Medium (1 hour)
- **Files to Modify:** Navigation components
- **QA Requirements:** Test with keyboard only
- **Status:** Pending
- **QA Review:** Pending

### Phase 5: Testing & Documentation (4 hours)

#### Task 5.1: Write Unit Tests for Theme System

- **Description:** Create comprehensive tests for theme utilities
- **Acceptance Criteria:**
  - Test generateBrutalistClasses function
  - Test category style mappings
  - Test theme HOC pattern
  - 80%+ coverage for theme files
- **Dependencies:** Phase 4 complete
- **Estimated Effort:** Medium (1 hour)
- **Files to Create:**
  - `/apps/web/__tests__/theme/brutalist.test.ts`
  - `/apps/web/__tests__/theme/utils.test.ts`
- **QA Requirements:** All tests pass
- **Status:** Pending
- **QA Review:** Pending

#### Task 5.2: Write Component Integration Tests

- **Description:** Test brutalist components with React Testing Library
- **Acceptance Criteria:**
  - Test NavigationTree interactions
  - Test SearchBar functionality
  - Test FilterPanel state changes
  - Verify accessibility
- **Dependencies:** Task 5.1
- **Estimated Effort:** High (1.5 hours)
- **Files to Create:** Component test files
- **QA Requirements:** All tests pass
- **Status:** Pending
- **QA Review:** Pending

#### Task 5.3: Create Visual Regression Tests

- **Description:** Set up visual testing for brutalist components
- **Acceptance Criteria:**
  - Capture baseline screenshots
  - Test hover/active states
  - Test responsive layouts
  - Document visual test process
- **Dependencies:** Task 5.2
- **Estimated Effort:** Medium (1 hour)
- **Files to Create:** Visual test configuration
- **QA Requirements:** Baseline screenshots approved
- **Status:** Pending
- **QA Review:** Pending

#### Task 5.4: Document Implementation

- **Description:** Create usage documentation and examples
- **Acceptance Criteria:**
  - Document theme system usage
  - Component API documentation
  - Migration guide for new components
  - Storybook stories for components
- **Dependencies:** Task 5.3
- **Estimated Effort:** Low (0.5 hours)
- **Files to Create:** Documentation files
- **QA Requirements:** Documentation review
- **Status:** Pending
- **QA Review:** Pending

### Phase 6: Performance Optimization (2 hours)

#### Task 6.1: Optimize Shadow Rendering

- **Description:** Ensure shadows use GPU acceleration
- **Acceptance Criteria:**
  - Add will-change properties
  - Use transform3d for better performance
  - No paint flashing on hover
  - 60fps maintained
- **Dependencies:** Phase 5 complete
- **Estimated Effort:** Low (0.5 hours)
- **Files to Modify:** CSS and component styles
- **QA Requirements:** Performance profiling
- **Status:** Pending
- **QA Review:** Pending

#### Task 6.2: Implement CSS Containment

- **Description:** Add CSS containment for render optimization
- **Acceptance Criteria:**
  - Use contain property appropriately
  - Isolate expensive repaints
  - Verify no visual regressions
  - Measure performance improvement
- **Dependencies:** Task 6.1
- **Estimated Effort:** Low (0.5 hours)
- **Files to Modify:** Component styles
- **QA Requirements:** Performance testing
- **Status:** Pending
- **QA Review:** Pending

#### Task 6.3: Bundle Size Optimization

- **Description:** Minimize theme system impact on bundle
- **Acceptance Criteria:**
  - Tree-shake unused utilities
  - Optimize shadow class generation
  - Bundle increase <5KB gzipped
  - No functionality loss
- **Dependencies:** Task 6.2
- **Estimated Effort:** Low (0.5 hours)
- **Files to Modify:** Build configuration
- **QA Requirements:** Bundle analysis
- **Status:** Pending
- **QA Review:** Pending

#### Task 6.4: Final Performance Audit

- **Description:** Comprehensive performance testing and optimization
- **Acceptance Criteria:**
  - Lighthouse score maintained
  - Core Web Vitals pass
  - No memory leaks
  - Smooth animations on all devices
- **Dependencies:** Task 6.3
- **Estimated Effort:** Low (0.5 hours)
- **Files to Modify:** As needed based on audit
- **QA Requirements:** Performance benchmarks met
- **Status:** Pending
- **QA Review:** Pending

## Implementation Notes

### Development Environment

- Use `pnpm dev` for hot-reload development
- Test in both light and dark modes
- Verify on Chrome, Firefox, and Safari
- Test responsive layouts at key breakpoints (640px, 768px, 1024px)

### Testing Strategy

1. **Unit Tests**: Test individual theme utilities and functions
2. **Integration Tests**: Test component interactions and state
3. **Visual Tests**: Capture and compare component appearances
4. **E2E Tests**: Test complete user flows
5. **Performance Tests**: Profile rendering and animations

### Integration Points

- Preserve existing `/experiments` route functionality
- Maintain compatibility with existing components
- Ensure theme doesn't affect non-brutalist components
- Keep existing data structures intact

### Risk Mitigation

1. **Gradual Rollout**: Test each component in isolation first
2. **Feature Flags**: Use environment variables to toggle brutalist theme
3. **Rollback Plan**: Keep original components until fully tested
4. **Performance Monitoring**: Track metrics at each phase
5. **User Testing**: Get feedback before full deployment

## Quality Gates

### Phase Completion Criteria

Each phase must meet these criteria before proceeding:

- All tasks completed and tested
- No TypeScript errors
- No ESLint warnings
- Performance benchmarks maintained
- Visual QA approved
- Documentation updated

### QA Checkpoints

1. **After Theme Setup**: Verify theme system works correctly
2. **After Component Transformation**: Test each component individually
3. **After Homepage Integration**: Full integration testing
4. **After Animations**: Performance and accessibility testing
5. **Before Deployment**: Complete regression testing

## Progress Tracking

### Monitoring Approach

- Daily standup updates on task progress
- Blocker identification and resolution
- Performance metric tracking
- Visual progress screenshots
- QA feedback incorporation

### Success Metrics

- 100% backward compatibility maintained
- <1s page load time preserved
- All accessibility tests pass
- Mobile experience fully functional
- Developer documentation complete

## Completion Checklist

- [ ] All 24 tasks completed and QA approved
- [ ] Integration testing passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Visual QA sign-off
- [ ] Accessibility audit passed
- [ ] Code review completed
- [ ] Ready for production deployment
