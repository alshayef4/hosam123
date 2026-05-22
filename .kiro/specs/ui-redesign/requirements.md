# Requirements Document

## Introduction

تحسين شامل للواجهة المرئية (UI/UX) لتطبيق "دفتر السداد" — نظام متابعة السداد الشهري. يركز هذا المواصفة على الجانب البصري فقط: تحسين جميع العناصر المرئية لتبدو احترافية وعصرية وأنيقة، مع الحفاظ على التوافق الكامل مع اللغة العربية (RTL) والاستجابة لجميع أحجام الشاشات. الهدف النهائي هو أن يبدو التطبيق كمنتج عالمي من شركة تقنية رائدة.

## Glossary

- **Design_System**: مجموعة متكاملة من المتغيرات والأنماط المرئية (ألوان، خطوط، ظلال، أنصاف أقطار، مسافات) المعرّفة في CSS والمستخدمة عبر كامل التطبيق لضمان التناسق البصري
- **UI_Primitives**: المكونات الأساسية في مجلد `components/ui/` المبنية على shadcn/ui (Radix + CVA) والتي تشكل اللبنات الأساسية للواجهة
- **Layout_Shell**: الهيكل الرئيسي للتطبيق المتضمن الشريط الجانبي (Sidebar) والمحتوى الرئيسي والرأس المتنقل (Mobile Header)
- **Responsive_Breakpoints**: نقاط التحول المحددة لأحجام الشاشات: mobile (< 640px)، tablet (640px–1024px)، laptop (1024px–1440px)، desktop (> 1440px)
- **RTL_Layout**: تخطيط من اليمين إلى اليسار المستخدم للغة العربية، يشمل اتجاه النص والمسافات المنطقية (logical properties) ومحاذاة العناصر
- **Motion_System**: نظام الحركة والانتقالات المبني على Framer Motion وCSS transitions لتوفير تجربة سلسة ومتسقة
- **Theme_System**: نظام المظهر الذي يدعم الوضع الفاتح والداكن مع انتقالات سلسة بينهما
- **Interactive_States**: الحالات التفاعلية للعناصر: hover، focus، active، disabled، loading
- **Visual_Hierarchy**: التسلسل البصري الذي يوجه عين المستخدم عبر حجم الخط واللون والمسافات والظلال

## Requirements

### Requirement 1: Design Token System Enhancement

**User Story:** As a developer, I want a refined and comprehensive design token system, so that all UI elements share consistent visual properties across the entire application.

#### Acceptance Criteria

1. THE Design_System SHALL define a color palette using oklch color space with primary, secondary, accent, success, warning, and destructive semantic colors, where each semantic color includes a base value and a foreground value, defined separately for both light and dark themes, and each foreground/background pair SHALL maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text per WCAG 2.1 AA
2. THE Design_System SHALL define a typography scale with font sizes (xs: 0.75rem, sm: 0.875rem, base: 1rem, lg: 1.125rem, xl: 1.25rem, 2xl: 1.5rem, 3xl: 1.875rem, 4xl: 2.25rem), line heights no less than 1.5 for body text and no less than 1.2 for headings, letter spacing between 0.3px and 0.5px, and font weights (regular: 400, medium: 500, semibold: 600, bold: 700) using Cairo as the primary font and Tajawal as the secondary font
3. THE Design_System SHALL define a spacing scale using a 4px base unit with multiplier values from 0.5 (2px) to 16 (64px) for consistent padding, margins, and gaps across all components
4. THE Design_System SHALL define border-radius tokens (sm: 6px, md: 8px, lg: 12px, xl: 16px, 2xl: 20px, full: 9999px) applied consistently to all interactive elements
5. THE Design_System SHALL define shadow tokens (xs, sm, md, lg, xl, glow) with distinct oklch-based values for light and dark themes, where each successive level increases blur radius and spread to produce visually distinguishable elevation layers when rendered on the theme's background color
6. THE Design_System SHALL define transition duration tokens (fast: 150ms, normal: 200ms, slow: 300ms, smooth: 500ms) and easing curves (ease-out, ease-in-out, spring) for all animated properties
7. THE Design_System SHALL expose all token values as CSS custom properties on the :root selector for light theme and on the .dark selector for dark theme, enabling consumption via Tailwind CSS utility classes

### Requirement 2: Button Component Redesign

**User Story:** As a user, I want buttons that are visually distinct, satisfying to interact with, and clearly communicate their purpose, so that I can navigate the application confidently.

#### Acceptance Criteria

1. THE UI_Primitives SHALL render all button variants (default, destructive, outline, secondary, ghost, link) with consistent height (36px default, 32px sm, 40px lg), horizontal padding (16px default, 12px sm, 24px lg), vertical padding (8px default), and border-radius (8px default, 6px sm, 8px lg)
2. WHEN a user hovers over a button of variant default, destructive, outline, or secondary, THE UI_Primitives SHALL display a background color transition (200ms ease-out) and an elevation change (translateY -1px with box-shadow transitioning from 0px to 2px vertical offset at 10% opacity)
3. WHEN a user presses a button, THE UI_Primitives SHALL display a scale-down effect (scale 0.97) with 100ms duration to provide tactile feedback
4. WHEN a button receives keyboard focus, THE UI_Primitives SHALL display a visible focus ring (3px ring width with 50% opacity of the ring color and 2px offset from the button edge) that provides a minimum 3:1 contrast ratio against adjacent colors per WCAG 2.1 Success Criterion 2.4.7
5. WHILE a button is in disabled state, THE UI_Primitives SHALL render the button with 50% opacity, no pointer events, and no hover, press, or focus visual effects
6. THE UI_Primitives SHALL render the primary button variant with a linear gradient background, and WHEN a user hovers over the primary button, THE UI_Primitives SHALL transition the gradient to a 10% lighter variant over 200ms ease-out
7. THE UI_Primitives SHALL render icon-only buttons (icon, icon-sm, icon-lg sizes) as circles with equal width and height (36px default, 32px sm, 40px lg), 50% border-radius, centered icon alignment, and the same hover, press, and focus interactive states as text buttons of the corresponding variant
8. WHEN a user hovers over a ghost variant button, THE UI_Primitives SHALL display only a background color change (to accent color) with 200ms ease-out transition and no elevation change
9. WHEN a user hovers over a link variant button, THE UI_Primitives SHALL display an underline decoration with 200ms ease-out transition and no elevation or background change

### Requirement 3: Input Fields and Form Controls Redesign

**User Story:** As a user, I want input fields that are easy to identify, comfortable to type in, and provide clear feedback on my input state, so that I can fill forms efficiently.

#### Acceptance Criteria

1. THE UI_Primitives SHALL render all text input fields with a height of 36px, horizontal padding of 12px, vertical padding of 8px, a 1px solid border using the design system border color token, and a border-radius matching the design system's medium radius token
2. WHEN an input field receives focus, THE UI_Primitives SHALL transition the border color to the primary ring color token and display a 3px focus ring at 50% opacity of the ring color, with the transition completing within 200ms using a CSS transition
3. WHEN an input field has the aria-invalid attribute set to true, THE UI_Primitives SHALL display the destructive color token as the border color, a 3px ring using the destructive color at 20% opacity (40% in dark mode), and a destructive-tinted background at 5% opacity
4. THE UI_Primitives SHALL render placeholder text in the muted-foreground color token with 0.7 opacity, ensuring a minimum contrast ratio of 3:1 against the input background to differentiate from entered text
5. THE UI_Primitives SHALL render select triggers, textareas, and checkbox/radio inputs with the same border width (1px), border color token, border-radius token, focus ring style (3px at 50% opacity), disabled state (50% opacity with not-allowed cursor), and aria-invalid styling as text inputs
6. WHILE an input field is disabled, THE UI_Primitives SHALL render the field with 50% opacity, a not-allowed cursor, prevent pointer events, and apply the dark input background token at 30% opacity
7. THE UI_Primitives SHALL use CSS logical properties (padding-inline-start, padding-inline-end) for all horizontal spacing in form controls, inheriting text direction from the document's dir attribute to support both RTL and LTR layouts without additional configuration
8. WHEN an input field transitions between valid and invalid states, THE UI_Primitives SHALL animate the border color and ring changes using a CSS transition within 200ms to provide smooth visual feedback

### Requirement 4: Card Component Redesign

**User Story:** As a user, I want cards that clearly group related content with visual depth and subtle interactivity, so that I can scan information quickly.

#### Acceptance Criteria

1. THE UI_Primitives SHALL render cards with a background using the `bg-card` token, 1px border at 50% border-color opacity, border-radius of 16px, and shadow-sm
2. WHILE the Theme_System is in dark mode, THE UI_Primitives SHALL render cards with a semi-transparent background (oklch 0.12 at 80% opacity) to produce a glass effect, and reduce border opacity to 30%
3. WHEN a user hovers over or focuses a card that contains a navigational link or clickable action, THE UI_Primitives SHALL animate the card upward (translateY -3px) with shadow elevated from shadow-sm to shadow-md and a border-color transition to the theme accent color at 40% opacity, completing the transition within 300ms using ease-out timing
4. WHEN the user moves the pointer away from or removes focus from an interactive card, THE UI_Primitives SHALL return the card to its resting position (translateY 0, shadow-sm, original border-color) within 300ms using ease-out timing
5. THE UI_Primitives SHALL render card headers with 24px horizontal padding, 20px top padding, a semibold title using the `card-foreground` token, and muted description text using the `muted-foreground` token with a 4px vertical gap between title and description
6. THE UI_Primitives SHALL render card content sections with 24px horizontal padding and 16px vertical gap between content blocks
7. THE UI_Primitives SHALL render KPI/stat cards on the Dashboard with an icon colored using the theme accent token, a numeric value at text-3xl font-bold, a label in muted-foreground text-sm, and a gradient accent bar at the top of the card measuring 100% width by 3px height

### Requirement 5: Dialog and Modal Redesign

**User Story:** As a user, I want dialogs that appear smoothly, are easy to read, and clearly separate from the background content, so that I can focus on the task at hand.

#### Acceptance Criteria

1. WHEN a dialog opens, THE UI_Primitives SHALL animate the overlay from 0% to 50% black opacity and the dialog content from 95% scale with 0 opacity to 100% scale with full opacity within 200ms using ease-out timing
2. WHEN a dialog closes, THE UI_Primitives SHALL animate the content to 95% scale with 0 opacity and the overlay to 0% opacity within 150ms using ease-in timing
3. THE UI_Primitives SHALL render dialog content with a solid background (using the background design token), 16px border-radius, 24px padding, a shadow-xl elevation, and a maximum width of 512px on viewports wider than 640px or full viewport width minus 32px on smaller viewports
4. THE UI_Primitives SHALL render the dialog close button as a rounded icon button (8px border-radius) positioned at the top-start corner (RTL-aware: top-right in RTL, top-left in LTR) with opacity increasing from 70% to 100% on hover and a 2px focus ring on keyboard focus
5. THE UI_Primitives SHALL render dialog headers with 20px title font size (font-semibold), 14px description (muted-foreground color), and 16px gap before the content area
6. THE UI_Primitives SHALL render dialog footers with action buttons aligned to the inline-start direction (right side in RTL) with 8px gap between buttons and a 1px top border separator using the standard border color token
7. WHEN a dialog opens, THE UI_Primitives SHALL move keyboard focus to the first focusable element inside the dialog content, and WHEN the dialog closes, SHALL return focus to the element that triggered the dialog
8. WHILE a dialog is open, THE UI_Primitives SHALL prevent scrolling of the background page content and trap keyboard focus within the dialog boundaries

### Requirement 6: Alert and Notification Redesign

**User Story:** As a user, I want alerts and notifications that are visually distinctive by severity, appear smoothly, and are easy to dismiss, so that I stay informed without disruption.

#### Acceptance Criteria

1. THE UI_Primitives SHALL render toast notifications with a slide-in animation from the top-end corner (RTL: top-left), a solid background, 12px border-radius, and a colored left/right border accent (4px) matching severity (success: green, error: red, warning: amber, info: blue)
2. WHEN a toast notification appears, THE Motion_System SHALL animate the toast from 20px offset with 0 opacity to final position with full opacity within 300ms using an ease-out timing function
3. WHEN a toast notification is dismissed by the user activating the close button or WHEN the auto-dismiss duration elapses (default: 4000ms for info/warning, 3000ms for success, 5000ms for error), THE Motion_System SHALL animate the toast to 20px offset with 0 opacity within 200ms before removing from DOM
4. THE UI_Primitives SHALL render inline alert components with a tinted background matching severity (10% opacity of severity color), a matching border (left border in LTR, right border in RTL), a severity-specific icon, a bold title, and a regular-weight description
5. WHEN the browser loses network connectivity, THE UI_Primitives SHALL render the OfflineIndicator as a fixed banner at the top of the viewport with a warning color scheme and a slide-down animation (300ms duration, ease-out), and WHEN connectivity is restored, THE UI_Primitives SHALL display a success-colored reconnection banner for 3000ms before hiding
6. THE UI_Primitives SHALL display a maximum of 3 toast notifications simultaneously, and IF a new toast is triggered while 3 are visible, THEN THE UI_Primitives SHALL dismiss the oldest toast before displaying the new one

### Requirement 7: Navigation and Sidebar Redesign

**User Story:** As a user, I want a navigation sidebar that is elegant, easy to use, and clearly shows where I am in the application, so that I can move between sections effortlessly.

#### Acceptance Criteria

1. THE Layout_Shell SHALL render the sidebar with a translucent blurred background (backdrop-filter), a 1px end-border at 30% opacity, and a width transition of 300ms ease-out when the sidebar collapse state changes
2. WHEN a navigation item is active, THE Layout_Shell SHALL render the item with a gradient primary background, white text, a box-shadow glow using the primary color at reduced opacity, and 12px border-radius to clearly distinguish from inactive items
3. WHEN a user hovers over an inactive navigation item, THE Layout_Shell SHALL display a background tint at 60% muted opacity and apply a scale transform of 1.02 within a 200ms transition
4. THE Layout_Shell SHALL render the sidebar header with the application logo (gradient icon), application name in bold, and a toggle button whose icon rotates 180 degrees over 200ms on collapse/expand state change
5. THE Layout_Shell SHALL render the sidebar footer with a user avatar (gradient background displaying the user's first initial), user name (truncated at 20 characters with ellipsis), and email in a dropdown trigger that shows a background tint on hover
6. WHILE the sidebar is collapsed, THE Layout_Shell SHALL display only navigation icons centered horizontally with tooltips appearing after a 300ms hover delay, maintaining the same active/inactive gradient and glow visual distinction as the expanded state
7. WHEN the viewport width is below 768px, THE Layout_Shell SHALL render the mobile header as a sticky top bar of 64px height with a translucent blurred background, a hamburger menu trigger for the sidebar, the current page title, and a theme toggle button
8. WHEN the sidebar is expanded on viewports at or above 768px, THE Layout_Shell SHALL render the sidebar at a default width of 280px, resizable between 200px and 480px via a drag handle on the end edge

### Requirement 8: Data Table Redesign

**User Story:** As a user, I want data tables that are easy to scan, visually organized, and responsive to different screen sizes, so that I can find and manage records efficiently.

#### Acceptance Criteria

1. THE UI_Primitives SHALL render table headers with a muted background at 5% opacity, semibold (font-weight 600) text, 12px vertical and 16px horizontal padding, and a 1px solid bottom border separator using the theme border color
2. THE UI_Primitives SHALL render table rows with alternating background tints (even rows at 3% muted opacity, odd rows transparent), 12px vertical and 16px horizontal padding matching headers, and a hover state that applies a 5% primary color tint with a 150ms ease transition
3. THE UI_Primitives SHALL render table cells containing numeric values with end-aligned text (inline-end) and cells containing non-numeric values with start-aligned text (inline-start), using CSS logical properties (text-align: start/end) to support both LTR and RTL layouts without direction-specific overrides
4. WHEN a table receives an empty data array, THE UI_Primitives SHALL display the EmptyState component centered within the table area showing an icon (defaulting to Inbox if none specified), a text message of at least 10 characters describing why no data is present, and an optional action button that triggers a caller-provided callback
5. THE UI_Primitives SHALL render status badges within tables using pill-shaped containers (border-radius 9999px) with a background color at 15% opacity derived from the badge's semantic variant (success: green, warning: amber, destructive: red, info: blue, neutral: gray) and foreground text color matching the full-opacity variant color at minimum 4.5:1 contrast ratio against the badge background
6. WHILE the viewport width is below 640px, THE UI_Primitives SHALL transform the table into a card-based layout where each row becomes a vertically stacked card displaying each cell value preceded by its corresponding column header label in muted smaller text (font-size 0.75rem), with cards separated by 8px vertical gap and each card having 12px padding and the theme border-radius
7. THE UI_Primitives SHALL render all table interactive elements (sort buttons, action buttons, pagination controls) with a minimum touch target size of 44×44px on viewports below 640px and support visible keyboard focus indicators using the theme ring style

### Requirement 9: Loading and Empty States Redesign

**User Story:** As a user, I want loading indicators and empty states that are visually polished and informative, so that I understand the application state and feel confident it is working.

#### Acceptance Criteria

1. THE UI_Primitives SHALL render skeleton loading states with a shimmer animation (gradient sweep in the inline direction—left-to-right in LTR, right-to-left in RTL—over 1.5s infinite loop) using the muted/accent background color, and SHALL include `role="status"` and an `aria-label` attribute describing the loading context
2. THE UI_Primitives SHALL render skeleton shapes that match the actual content dimensions (card skeletons replicate card height, padding, and column layout; table skeletons replicate header row plus the configured number of body rows with matching column widths) so that Cumulative Layout Shift between skeleton and loaded content is no greater than 16px vertical displacement per element
3. WHEN content finishes loading, THE Motion_System SHALL fade in the actual content from opacity 0 with an upward translation of 8px over 300ms using ease-out timing, and SHALL skip the animation (render immediately at full opacity) when the user's system has `prefers-reduced-motion: reduce` enabled
4. THE UI_Primitives SHALL render empty states with a centered layout containing a muted icon at 48px size, a message line in 16px muted-foreground color, and an optional primary action button, with 24px vertical spacing between each element
5. THE UI_Primitives SHALL render the LoadingSpinner as a continuously rotating circle (360° rotation over 1s linear infinite) using the primary color, supporting three sizes: sm (16px), md (24px), lg (32px), and SHALL include `role="status"` and an `aria-label` indicating loading is in progress
6. IF the user's system has `prefers-reduced-motion: reduce` enabled, THEN THE UI_Primitives SHALL disable the shimmer gradient animation on skeletons and display a static muted background instead, and SHALL stop the LoadingSpinner rotation and display a static circular indicator

### Requirement 10: Responsive Layout System

**User Story:** As a user, I want the application to look and function perfectly on my device regardless of screen size, so that I can manage payments from any device.

#### Acceptance Criteria

1. WHILE the viewport width is less than 640px (mobile breakpoint), THE Layout_Shell SHALL hide the sidebar from view, display a mobile header containing a navigation trigger button and the current page title, render all page content in a single-column layout, apply 16px content padding, and render all interactive elements with a minimum touch target size of 44x44px
2. WHILE the viewport width is between 640px and 1024px (tablet breakpoint), THE Layout_Shell SHALL display a collapsible sidebar in icon-only mode by default, arrange dashboard cards in a 2-column grid layout, and apply 24px content padding
3. WHILE the viewport width is between 1024px and 1440px (laptop breakpoint), THE Layout_Shell SHALL display the sidebar fully expanded showing icons and labels, arrange dashboard cards in a 3-column grid layout, and apply 32px content padding
4. WHILE the viewport width is greater than 1440px (desktop breakpoint), THE Layout_Shell SHALL constrain the main content area to a maximum width of 1400px centered horizontally, display the sidebar fully expanded, arrange dashboard cards in a 4-column grid layout, and apply 40px content padding
5. THE Layout_Shell SHALL use CSS Grid and Flexbox with logical properties (margin-inline, padding-inline, inset-inline) for all spacing and positioning calculations to ensure correct RTL layout without manual direction overrides
6. WHEN the user activates the navigation trigger button in the mobile header, THE Layout_Shell SHALL display the sidebar as an overlay allowing access to all navigation items
7. WHEN the viewport width crosses any defined breakpoint boundary during a resize, THE Layout_Shell SHALL transition to the target breakpoint layout within 300ms without loss of visible content or scroll position

### Requirement 11: RTL and Arabic Typography Optimization

**User Story:** As an Arabic-speaking user, I want the interface to feel naturally designed for Arabic, not merely mirrored from a left-to-right layout, so that reading and interacting feels comfortable and native.

#### Acceptance Criteria

1. THE Design_System SHALL use CSS logical properties (margin-inline-start, padding-inline-end, inset-inline, border-inline) for all directional spacing and positioning, with zero instances of physical directional properties (margin-left, margin-right, padding-left, padding-right, left, right) in component stylesheets
2. THE Design_System SHALL configure Arabic font rendering with Cairo as primary and Tajawal as secondary, with letter-spacing of 0.3px for body text and 0.5px for headings, line-height of 1.6 for body text and 1.3 for headings, and a minimum body font-size of 14px
3. THE Layout_Shell SHALL position the sidebar at the inline-end side of the viewport, place close/dismiss buttons at the inline-start corner of their container, reverse navigation arrow directions (back arrow pointing right, forward arrow pointing left), and render progress indicators filling from right to left
4. THE UI_Primitives SHALL render icons that imply horizontal direction (arrows, chevrons, navigation back/forward, external-link, reply, undo/redo) in their mirrored RTL orientation using CSS transform scaleX(-1) or RTL-specific icon variants, while non-directional icons (search, settings, close-X, vertical arrows) SHALL remain unmirrored
5. THE UI_Primitives SHALL align numeric content (monetary amounts, dates, phone numbers) using the font-variant-numeric: tabular-nums feature and inline-end alignment within table cells and card value displays, preserving left-to-right digit order within numeric sequences
6. THE Design_System SHALL render text truncation with ellipsis at the inline-start edge of overflowing text in RTL context, using logical text-align values (start/end) instead of physical values (left/right), so that the visible portion of truncated text shows the beginning of the string from the right
7. WHEN the interface contains mixed-direction content (Arabic text with embedded Latin words, URLs, or numeric identifiers), THE Design_System SHALL preserve correct bidirectional text flow by applying unicode-bidi isolation to inline embedded segments, ensuring Latin text reads left-to-right within the right-to-left paragraph flow

### Requirement 12: Animation and Micro-interaction System

**User Story:** As a user, I want subtle animations that make the interface feel alive and responsive to my actions, so that the experience feels premium and polished.

#### Acceptance Criteria

1. WHEN a user navigates between routes, THE Motion_System SHALL apply a page transition animation consisting of a fade-in with 10px upward translate movement over 400ms using ease-out timing
2. WHEN list items, grid cards, or table rows first appear in the viewport, THE Motion_System SHALL apply staggered entrance animations with a 50ms delay between each item, up to a maximum of 20 items per stagger group (items beyond 20 SHALL appear immediately without stagger delay)
3. WHEN a user interacts with a toggle (theme switch, sidebar collapse), THE Motion_System SHALL animate the state change using spring easing (Framer Motion default spring) for toggles and ease-out easing for collapses, completing within 300ms
4. IF the user's system has prefers-reduced-motion enabled, THEN THE Motion_System SHALL reduce all animation durations to 0.1ms and remove all transform-based animations (translate, scale, rotate)
5. WHEN dashboard KPI values first load or receive an updated value, THE Motion_System SHALL animate the displayed number from 0 (on first load) or from the previous value (on update) to the target value over 500ms using ease-out interpolation
6. WHEN a user scrolls, THE Motion_System SHALL NOT apply scroll-triggered animations; all animations SHALL be interaction-triggered or load-triggered only
7. IF a page transition animation is in progress and the user triggers another route navigation, THEN THE Motion_System SHALL cancel the current transition and immediately begin the new page transition animation

### Requirement 13: Theme System Enhancement

**User Story:** As a user, I want seamless switching between light and dark themes with both looking equally polished, so that I can use the application comfortably in any lighting condition.

#### Acceptance Criteria

1. WHEN the user toggles the theme, THE Theme_System SHALL transition background-color, color, border-color, and box-shadow properties smoothly over 300ms using CSS transitions on the root element, with no visible flash of unstyled or incorrectly-themed content during the switch
2. THE Theme_System SHALL define the dark theme with deep navy backgrounds (oklch 0.07–0.12), elevated card surfaces (oklch 0.12–0.16), and electric blue/purple accent colors that provide minimum 4.5:1 contrast ratio for text elements and minimum 3:1 contrast ratio for non-text UI elements against their respective background surfaces
3. THE Theme_System SHALL define the light theme with clean white/off-white backgrounds (oklch 0.985–1.0), subtle cool-gray borders, and vibrant blue-indigo accent colors that provide minimum 4.5:1 contrast ratio for text elements and minimum 3:1 contrast ratio for non-text UI elements against their respective background surfaces
4. THE Theme_System SHALL render shadows differently per theme: light mode uses black shadows at low opacity (4–8%), dark mode uses colored glow shadows (primary color at 10–20% opacity) for depth
5. THE Theme_System SHALL ensure all glassmorphism effects (backdrop-blur, semi-transparent backgrounds) display readable text content meeting minimum 4.5:1 contrast ratio in both themes, with background opacity values of 70–85% in light mode and 60–85% in dark mode
6. WHILE the Theme_System is in dark mode, THE UI_Primitives SHALL use border colors at oklch lightness 0.22 and limit the lightness difference between adjacent nested surface backgrounds to no more than 0.06 oklch units to avoid harsh edges
7. WHEN the user selects a theme, THE Theme_System SHALL persist the selection to localStorage and restore it on subsequent page loads within 100ms of initial render, preventing any visible flash of the non-selected theme
8. IF the Theme_System has no persisted user preference, THEN THE Theme_System SHALL default to the light theme

### Requirement 14: Icon and Visual Accent System

**User Story:** As a user, I want icons and visual accents that are consistent, meaningful, and add personality to the interface, so that the application feels cohesive and delightful.

#### Acceptance Criteria

1. THE Design_System SHALL use Lucide React icons exclusively at consistent sizes (16px for inline text, 20px in buttons and navigation menu items, 24px in page headers, 48px in empty states) with 1.5px stroke width across the application
2. THE Design_System SHALL assign semantic colors to navigation icons (blue for dashboard, violet for customers, cyan for ledgers, emerald for reports) where inactive icons display their assigned semantic color and active icons display white on the active-state gradient background
3. THE UI_Primitives SHALL render the application logo as a gradient-filled container in two size variants: large (72×72px container with rounded-lg and 36px Zap icon) and small (28×28px container with rounded-md and 16px Zap icon), both using white icon color on the primary gradient background with a box-shadow glow effect
4. THE UI_Primitives SHALL render decorative gradient mesh backgrounds on the main content area and the unauthenticated landing page using radial gradients at 4–8% opacity with primary and accent colors, ensuring text content layered above maintains a minimum contrast ratio of 4.5:1 against the combined background
5. THE Design_System SHALL define icon-to-text spacing of 8px (gap-2) for inline icon-text pairs where the icon is 16px or 20px, and 12px (gap-3) for icon-text combinations in navigation headers and page titles where the icon is 24px or larger

### Requirement 15: Interactive Component Polish

**User Story:** As a user, I want dropdown menus, tooltips, and popovers that appear smoothly and are easy to interact with, so that secondary actions and information are accessible without friction.

#### Acceptance Criteria

1. WHEN a dropdown menu opens, THE UI_Primitives SHALL animate the menu from 95% scale with 0 opacity to 100% scale with full opacity within 150ms using ease-out timing, with the slide-in origin matching the side on which the menu appears relative to its trigger (top, bottom, left, or right)
2. THE UI_Primitives SHALL render dropdown menu items with 8px vertical padding, a hover background using the accent color at 10% opacity, and 8px border-radius with a 150ms transition duration for the hover state change
3. WHEN a user hovers over or focuses a tooltip trigger element, THE UI_Primitives SHALL display the tooltip after a 500ms delay with a fade-in animation completing within 100ms, positioned with an 8px offset from the trigger element on the side with the most available viewport space
4. THE UI_Primitives SHALL render the ThemeToggle as a rounded button containing sun and moon icons that animate between states using a 300ms rotation and scale transition with ease-out timing when the theme is toggled
5. WHEN the ConfirmDialog opens with a destructive or warning variant, THE UI_Primitives SHALL render the dialog with a variant-appropriate color accent (destructive red for delete actions, warning amber for reversible actions), a primary action button styled in the variant color, and a secondary cancel button with neutral styling, using the same scale-and-fade entrance animation as other dialogs (95% to 100% scale, 0 to full opacity, 150ms ease-out)
6. WHEN a user hovers over or focuses the sidebar resize handle, THE Layout_Shell SHALL display a vertical indicator line using the primary gradient at 40% opacity and change the cursor to col-resize, and WHEN the user presses and drags the handle, THE Layout_Shell SHALL resize the sidebar within the bounds of 200px minimum and 480px maximum width
7. IF a tooltip would overflow the viewport at its default position, THEN THE UI_Primitives SHALL reposition the tooltip to the opposite side of the trigger element while maintaining the 8px offset
