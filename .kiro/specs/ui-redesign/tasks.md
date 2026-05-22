# Implementation Plan: UI Redesign

## Overview

Comprehensive visual overhaul of the "دفتر السداد" application using a token-first approach. Implementation proceeds in layers: design tokens → utility hooks → UI primitives → layout shell → integration. All changes are purely frontend (TypeScript/React), no backend modifications required.

## Tasks

- [x] 1. Expand Design Token System in index.css
  - [x] 1.1 Add semantic color tokens, shadow tokens, transition tokens, spacing scale, and border-radius tokens to `:root` and `.dark` selectors
    - Define oklch-based semantic colors (success, warning, info) with foreground pairs for both themes
    - Add shadow tokens (xs, sm, md, lg, xl, glow) with theme-specific values (black opacity for light, colored glow for dark)
    - Add transition duration tokens (fast: 150ms, normal: 200ms, slow: 300ms, smooth: 500ms) and easing curves
    - Add spacing scale (4px base, 0.5–16 multipliers) as CSS custom properties
    - Add border-radius tokens (sm: 6px, md: 8px, lg: 12px, xl: 16px, 2xl: 20px, full: 9999px)
    - Ensure dark theme uses deep navy backgrounds (oklch 0.07–0.12), elevated surfaces (oklch 0.12–0.16), electric blue/purple accents
    - Ensure light theme uses clean white/off-white backgrounds (oklch 0.985–1.0), cool-gray borders, vibrant blue-indigo accents
    - Add theme transition properties on root element (background-color, color, border-color, box-shadow over 300ms)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 13.2, 13.3, 13.4, 13.6_

- [x] 2. Create utility hooks and motion presets
  - [x] 2.1 Create `client/src/lib/motion.ts` with shared Framer Motion variants and transition presets
    - Export `pageTransition` variants (fade + 10px y-translate, 400ms ease-out)
    - Export `staggerContainer` and `staggerItem` variants (50ms delay between items)
    - Export `dialogVariants` (scale 0.95→1, 200ms open / 150ms close)
    - Export `springToggle` transition config
    - Export `toastVariants` (slide-in from 20px offset, 300ms ease-out)
    - _Requirements: 12.1, 12.2, 12.3, 5.1, 5.2, 6.2_

  - [x] 2.2 Create `client/src/hooks/useReducedMotion.ts` hook
    - Implement hook that listens to `prefers-reduced-motion` media query
    - Return boolean indicating whether reduced motion is preferred
    - Use `matchMedia` with event listener for live updates
    - _Requirements: 12.4, 9.3, 9.6_

  - [x] 2.3 Create `client/src/hooks/useStaggerAnimation.ts` hook
    - Accept `itemCount` and optional `maxStagger` (default 20) parameters
    - Return `containerVariants` and `itemVariants` for Framer Motion
    - Cap stagger at maxStagger items (items beyond appear immediately)
    - Respect reduced motion preference
    - _Requirements: 12.2_

  - [x] 2.4 Create `client/src/hooks/useCountUp.ts` hook
    - Accept `target` number and optional `duration` (default 500ms)
    - Animate from 0 (first load) or previous value (update) to target using ease-out interpolation
    - Skip animation when reduced motion is enabled
    - _Requirements: 12.5_

  - [x] 2.5 Write unit tests for useReducedMotion, useStaggerAnimation, and useCountUp hooks
    - Test useReducedMotion returns correct value based on media query mock
    - Test useStaggerAnimation caps at maxStagger items
    - Test useCountUp interpolates from 0 to target value
    - _Requirements: 12.2, 12.4, 12.5_

- [x] 3. Checkpoint - Ensure tokens and hooks compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Redesign UI primitive components
  - [x] 4.1 Redesign `client/src/components/ui/button.tsx` with new variants and interactive states
    - Add gradient variant for default/primary button
    - Add icon, icon-sm, icon-lg sizes as circular buttons (rounded-full)
    - Add hover effect: translateY(-1px) + shadow elevation (200ms ease-out) for default/destructive/outline/secondary
    - Add press effect: scale(0.97) with 100ms duration
    - Add focus ring: 3px ring at 50% opacity with 2px offset
    - Ghost variant: background-only hover (accent color), no elevation
    - Link variant: underline-only hover, no elevation/background
    - Disabled: opacity-50, pointer-events-none
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [x] 4.2 Redesign `client/src/components/ui/input.tsx` with enhanced states and RTL support
    - Set height 36px, horizontal padding 12px, vertical padding 8px, 1px border, medium radius token
    - Add focus state: primary ring color, 3px ring at 50% opacity, 200ms transition
    - Add aria-invalid state: destructive border, 3px ring at 20% opacity (40% dark), tinted background at 5%
    - Use CSS logical properties (padding-inline-start/end) for RTL support
    - Placeholder: muted-foreground at 0.7 opacity
    - Disabled: 50% opacity, not-allowed cursor, no pointer events
    - Animate border/ring transitions between valid/invalid states (200ms)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 4.3 Redesign `client/src/components/ui/card.tsx` with glass effect and hover interactions
    - Base: bg-card token, 1px border at 50% opacity, 16px border-radius, shadow-sm
    - Dark mode: semi-transparent background (oklch 0.12 at 80% opacity), border at 30% opacity
    - Interactive cards: hover/focus lifts (translateY -3px), shadow-sm→shadow-md, accent border at 40% opacity, 300ms ease-out
    - Card header: 24px horizontal padding, 20px top padding, semibold title, muted description, 4px gap
    - Card content: 24px horizontal padding, 16px vertical gap
    - KPI stat cards: accent icon, text-3xl bold value, muted-foreground label, 3px gradient accent bar at top
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [x] 4.4 Redesign `client/src/components/ui/dialog.tsx` with animations and RTL-aware positioning
    - Open animation: overlay 0→50% black, content 95%→100% scale + 0→1 opacity, 200ms ease-out
    - Close animation: content→95% scale + 0 opacity, overlay→0%, 150ms ease-in
    - Content: solid background, 16px border-radius, 24px padding, shadow-xl, max-width 512px (full-32px on mobile)
    - Close button: rounded icon at top-start (RTL-aware), opacity 70%→100% on hover, 2px focus ring
    - Header: 20px title (semibold), 14px description (muted), 16px gap before content
    - Footer: buttons aligned inline-start, 8px gap, 1px top border
    - Focus management: move focus to first focusable on open, return on close
    - Prevent background scroll, trap keyboard focus
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 4.5 Redesign `client/src/components/ui/alert.tsx` with severity-colored styling
    - Inline alerts: tinted background (10% severity color), matching border (inline-start side), severity icon, bold title, regular description
    - Support severity variants: success (green), error (red), warning (amber), info (blue)
    - _Requirements: 6.4_

- [x] 5. Redesign application-level components
  - [x] 5.1 Redesign `client/src/components/EnhancedToast.tsx` with slide-in animations and severity accents
    - Slide-in from top-end corner (RTL: top-left), solid background, 12px border-radius
    - 4px colored border accent matching severity (success: green, error: red, warning: amber, info: blue)
    - Appear animation: 20px offset → final position, 0→1 opacity, 300ms ease-out
    - Dismiss animation: → 20px offset, 1→0 opacity, 200ms
    - Auto-dismiss: 4000ms info/warning, 3000ms success, 5000ms error
    - Maximum 3 toasts visible; oldest dismissed when 4th arrives
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_

  - [x] 5.2 Redesign `client/src/components/DataTable.tsx` with alternating rows and responsive card layout
    - Headers: muted background 5% opacity, semibold, 12px vertical / 16px horizontal padding, 1px bottom border
    - Rows: alternating tints (even 3% muted, odd transparent), hover 5% primary tint (150ms)
    - Numeric cells: inline-end aligned; text cells: inline-start aligned (CSS logical properties)
    - Empty state: show EmptyState component with icon, message, optional action button
    - Status badges: pill-shaped (9999px radius), 15% opacity background, full-opacity foreground, 4.5:1 contrast
    - Mobile (<640px): transform to card-based layout, each cell preceded by column header label
    - Touch targets: minimum 44×44px on mobile for interactive elements
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 5.3 Redesign `client/src/components/EmptyState.tsx` and `client/src/components/LoadingState.tsx`
    - EmptyState: centered layout, 48px muted icon, 16px message, optional action button, 24px vertical spacing
    - LoadingState: RTL-aware shimmer animation (gradient sweep in inline direction, 1.5s loop), role="status", aria-label
    - Skeleton shapes match actual content dimensions (minimize CLS ≤ 16px)
    - Content fade-in: opacity 0 + 8px y-translate → visible, 300ms ease-out
    - Skip animation when prefers-reduced-motion is enabled (render immediately)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 5.4 Redesign `client/src/components/LoadingSpinner.tsx` with size variants and accessibility
    - Continuous 360° rotation over 1s linear infinite, primary color
    - Size variants: sm (16px), md (24px), lg (32px)
    - Add role="status" and aria-label for accessibility
    - Reduced motion: stop rotation, display static circular indicator
    - _Requirements: 9.5, 9.6_

  - [x] 5.5 Redesign `client/src/components/ConfirmDialog.tsx` with variant-colored accents
    - Destructive variant: red accent, red primary action button
    - Warning variant: amber accent, amber primary action button
    - Same scale-and-fade animation as dialog (95%→100%, 150ms ease-out)
    - Neutral cancel button styling
    - _Requirements: 15.5_

  - [x] 5.6 Redesign `client/src/components/ThemeToggle.tsx` with rotation/scale animation
    - Sun/moon icons animate between states: 300ms rotation + scale transition, ease-out
    - Render as rounded button
    - _Requirements: 15.4_

- [x] 6. Checkpoint - Ensure all component changes compile
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Redesign layout shell and navigation
  - [x] 7.1 Redesign `client/src/components/DashboardLayout.tsx` — sidebar with glass effect and responsive behavior
    - Glass sidebar: backdrop-filter blur(20px), translucent background, 1px end-border at 30% opacity
    - Active nav item: gradient primary background, white text, glow shadow, 12px border-radius
    - Inactive hover: 60% muted background tint, scale 1.02, 200ms transition
    - Collapsed state: icon-only centered, tooltips after 300ms hover delay, same active/inactive styling
    - Sidebar header: gradient logo icon, bold app name, toggle button with 180° icon rotation on collapse
    - Sidebar footer: gradient avatar with first initial, truncated name (20 chars), email in dropdown
    - Width transition: 300ms ease-out on collapse/expand
    - Default width 280px, resizable 200px–480px via drag handle on end edge
    - Resize handle: gradient indicator on hover, col-resize cursor
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.8, 15.6_

  - [x] 7.2 Implement mobile header and responsive layout in `client/src/components/DashboardLayout.tsx`
    - Mobile header (<768px): sticky, 64px height, glass background, hamburger trigger, page title, theme toggle
    - Mobile (<640px): hide sidebar, single-column, 16px padding, 44px min touch targets
    - Tablet (640–1024px): collapsible sidebar icon-only, 2-column grid, 24px padding
    - Laptop (1024–1440px): sidebar expanded, 3-column grid, 32px padding
    - Desktop (>1440px): max-width 1400px centered, sidebar expanded, 4-column grid, 40px padding
    - Use CSS Grid/Flexbox with logical properties (margin-inline, padding-inline, inset-inline)
    - Sidebar overlay on mobile when navigation trigger activated
    - Breakpoint transitions within 300ms without content loss or scroll position change
    - _Requirements: 7.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 8. Update ThemeContext for flash-free restoration
  - [x] 8.1 Enhance `client/src/contexts/ThemeContext.tsx` for <100ms theme restore and flash prevention
    - Read localStorage synchronously before first render
    - Apply .dark class within 100ms of initialization
    - Default to light theme when no preference stored
    - Persist selection to localStorage on change
    - Handle localStorage unavailability (private browsing) gracefully with try/catch
    - _Requirements: 13.1, 13.7, 13.8_

  - [x] 8.2 Write unit tests for ThemeContext persistence and restoration
    - Test theme persists to localStorage on toggle
    - Test theme restores from localStorage on mount
    - Test defaults to light when no stored preference
    - Test handles localStorage errors gracefully
    - **Property 1: Theme Persistence Roundtrip**
    - **Validates: Requirements 13.7, 13.8**
    - _Requirements: 13.7, 13.8_

- [x] 9. Apply RTL and Arabic typography optimizations
  - [x] 9.1 Ensure all components use CSS logical properties and RTL-correct rendering
    - Verify zero physical directional properties (margin-left/right, padding-left/right) in component styles
    - Sidebar positioned at inline-end (right side in RTL)
    - Close/dismiss buttons at inline-start corner
    - Navigation arrows reversed (back→right, forward→left)
    - Directional icons mirrored via scaleX(-1); non-directional icons unmirrored
    - Numeric content: tabular-nums, inline-end alignment, LTR digit order preserved
    - Text truncation: ellipsis at inline-start in RTL
    - Mixed-direction content: unicode-bidi isolation for embedded Latin/URLs
    - Arabic font: Cairo primary, Tajawal secondary, letter-spacing 0.3px body / 0.5px headings, line-height 1.6 body / 1.3 headings, min 14px body
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 10. Add page transitions and staggered animations
  - [x] 10.1 Wire page transition animations in `client/src/App.tsx` using motion presets
    - Apply fade-in + 10px upward translate (400ms ease-out) on route navigation
    - Cancel current transition and begin new one on rapid navigation
    - Skip transform animations when reduced motion is enabled
    - No scroll-triggered animations (interaction/load-triggered only)
    - _Requirements: 12.1, 12.4, 12.6, 12.7_

  - [x] 10.2 Apply staggered entrance animations to list/grid views using useStaggerAnimation
    - Dashboard cards, table rows, and list items use staggered entrance (50ms delay per item, max 20)
    - Spring easing for toggles (theme switch, sidebar collapse)
    - KPI values use useCountUp hook for animated number display
    - _Requirements: 12.2, 12.3, 12.5_

- [x] 11. Add icon system consistency and visual accents
  - [x] 11.1 Standardize icon sizes and semantic colors across all components
    - Inline text: 16px, buttons/nav: 20px, page headers: 24px, empty states: 48px, stroke-width 1.5px
    - Semantic nav icon colors: blue (dashboard), violet (customers), cyan (ledgers), emerald (reports)
    - Inactive: semantic color; active: white on gradient background
    - Logo: gradient container (72×72 large, 28×28 small), white Zap icon, glow shadow
    - Decorative gradient mesh backgrounds at 4–8% opacity on main content and landing page
    - Icon-to-text spacing: 8px (gap-2) for 16/20px icons, 12px (gap-3) for 24px+ icons
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 12. Polish interactive components (dropdowns, tooltips, popovers)
  - [x] 12.1 Add animations to dropdown menus, tooltips, and interactive overlays
    - Dropdown open: 95%→100% scale, 0→1 opacity, 150ms ease-out, origin matches side
    - Dropdown items: 8px vertical padding, accent hover at 10% opacity, 8px radius, 150ms transition
    - Tooltips: 500ms delay, 100ms fade-in, 8px offset, reposition on viewport overflow
    - _Requirements: 15.1, 15.2, 15.3, 15.7_

- [x] 13. Final checkpoint - Verify full build and type-check
  - Run `pnpm run check` to verify TypeScript compilation
  - Run `pnpm run build` to verify production build succeeds
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Write property tests for correctness properties
  - [x] 14.1 Write property test for theme persistence roundtrip
    - **Property 1: Theme Persistence Roundtrip**
    - For any theme value T in {light, dark}, storing T to localStorage and reading it back SHALL return T, and ThemeContext SHALL apply the corresponding class within 100ms
    - **Validates: Requirements 13.7, 13.8**

  - [x] 14.2 Write property test for reduced motion compliance
    - **Property 2: Reduced Motion Compliance**
    - For any animation variant V, IF prefers-reduced-motion is enabled, THEN computed duration ≤ 1ms and no transform properties applied
    - **Validates: Requirements 12.4, 9.6**

  - [x] 14.3 Write property test for token contrast compliance
    - **Property 3: Token Contrast Compliance**
    - For every semantic color pair (foreground, background), computed contrast ratio ≥ 4.5:1 for normal text and ≥ 3:1 for large text per WCAG 2.1 AA
    - **Validates: Requirements 1.1, 13.2, 13.3**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All commands use `pnpm` (e.g., `pnpm run check`, `pnpm run build`, `pnpm test`)
- Path aliases: `@/*` → `./client/src/*`, `@shared/*` → `./shared/*`
- This is an Arabic RTL application — all layout uses CSS logical properties
- Tailwind CSS 4 via Vite plugin, shadcn/ui, Framer Motion, Lucide React are already installed

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["2.3", "2.4"] },
    { "id": 3, "tasks": ["2.5", "4.1", "4.2"] },
    { "id": 4, "tasks": ["4.3", "4.4", "4.5"] },
    { "id": 5, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6"] },
    { "id": 6, "tasks": ["7.1", "8.1"] },
    { "id": 7, "tasks": ["7.2", "8.2"] },
    { "id": 8, "tasks": ["9.1", "10.1", "10.2"] },
    { "id": 9, "tasks": ["11.1", "12.1"] },
    { "id": 10, "tasks": ["14.1", "14.2", "14.3"] }
  ]
}
```
