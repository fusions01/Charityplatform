# Design Guidelines: Community Charity & Direct Aid Platform

## Design Approach

**Selected Approach**: Design System with Trust-Focused Refinements

Drawing from **Stripe's clarity and professionalism** + **GoFundMe's empathetic presentation** + **Government service design principles** (GOV.UK) for accessibility and trust.

This charity platform requires a design that communicates credibility, security, and empathy simultaneously. The interface must feel professional enough to handle sensitive financial data while remaining approachable for users in vulnerable situations.

## Core Design Principles

1. **Trust Through Transparency**: Clear visual hierarchy, obvious next steps, explicit status communication
2. **Accessible Compassion**: Warm but professional, never patronizing
3. **Security Confidence**: Visual cues reinforcing data protection and verification
4. **Efficient Workflows**: Streamlined processes for both beneficiaries and admins

## Typography

**Font Families**:
- Primary: Inter (headings and UI) - clean, highly legible, professional
- Secondary: System fonts for body text (optimized reading)

**Hierarchy**:
- Hero/Page Titles: text-4xl to text-5xl, font-semibold
- Section Headers: text-2xl to text-3xl, font-semibold
- Card Titles: text-xl, font-medium
- Body Text: text-base, font-normal
- Supporting Text: text-sm, text-gray-600
- Form Labels: text-sm, font-medium
- Buttons: text-base, font-medium

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16, 24**
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-24
- Card gaps: gap-6
- Form field spacing: space-y-4 to space-y-6

**Container Strategy**:
- Public pages: max-w-7xl
- Application forms: max-w-3xl (focused, less overwhelming)
- Admin dashboards: max-w-full with max-w-7xl inner containers
- Form inputs: Full width within containers

## Component Library

### Navigation
- **Header**: Fixed top navigation with logo left, auth/profile right
- Logo + "Community Aid" wordmark
- Desktop: Horizontal nav links (How It Works, Apply for Aid, About, Contact)
- Mobile: Hamburger menu
- Authenticated: Profile dropdown with role-specific links
- CTA button: "Request Help" (primary) or "Admin Dashboard" for admins

### Hero Section (Public Homepage)
**Large hero image**: Yes - use an authentic, dignified photo showing community support (people helping each other, not distress/poverty imagery)
- Image treatment: Subtle dark overlay (opacity-40) for text readability
- Centered content overlay with blurred background buttons
- Headline: Large, bold statement of mission
- Subheadline: Clear explanation of 100% direct aid
- Two CTAs: Primary "Request Help Now", Secondary "Learn How It Works"
- Trust indicators below: "Verified Bank Security" | "100% Transparent" | "UK & US Compliant"

### Forms & Inputs
**Application Forms**:
- Single-column layout for focus and mobile optimization
- Grouped sections with clear headings (Personal Info, Bank Details, Request Details)
- Progress indicator for multi-step applications (Step 1 of 3)
- Input fields: Rounded borders (rounded-lg), clear labels above, helper text below
- Required field indicators: Red asterisk, not just color
- Bank selection: Dropdown with bank logos, auto-complete search
- Document upload: Drag-and-drop zone with file type/size guidance
- Success states: Green checkmark icons for verified fields (especially bank name auto-fetch)

**Validation**:
- Inline validation with clear error messages
- Error states: Red border, red text, error icon
- Success states: Green border, checkmark icon
- Loading states: Spinner for bank verification

### Dashboard Components

**Beneficiary Dashboard**:
- Welcome card with user name and current application status
- Application status cards in grid (2-column on desktop)
- Status badges: Pending (yellow), Approved (green), Rejected (red), Paid (blue)
- Timeline component showing application progress
- Quick action: "Submit New Request" prominent CTA

**Admin Dashboard**:
- Statistics overview cards (4-column grid): Total Applications, Pending Review, Approved This Month, Total Aid Distributed
- Applications table with sortable columns, filter by status
- Action buttons per row: View Details, Approve, Reject, Request More Info
- Document preview modal with verification checklist
- Bank verification status indicator (green badge when name fetched successfully)

### Cards & Containers
- Application cards: White background, rounded-xl, border, shadow-sm, p-6
- Stat cards: gradient backgrounds or colored left border accent
- Info cards: Light gray background (bg-gray-50) for secondary information
- Bank details display: Secure-looking card with lock icon, read-only fields with verified checkmark

### Status & Feedback
**Application Status Flow**:
- Visual timeline with connecting lines
- Current status: Larger, colored circle with icon
- Future steps: Gray, smaller circles
- Status descriptions below each step

**Alerts & Notifications**:
- Success: Green background (bg-green-50), green border, checkmark icon
- Warning: Yellow background, alert icon
- Error: Red background, X icon
- Info: Blue background, info icon
- All dismissible with X button

### Authentication Pages
- Centered layout, max-w-md
- Social login buttons: Full-width, branded colors and logos (Apple black, Google white with border, Facebook blue)
- Divider: "Or continue with email"
- Traditional login: Email and password fields, "Forgot password?" link
- Toggle between Sign In / Sign Up
- Trust messaging: "Your data is encrypted and secure" with shield icon

### Data Display
**Application Review (Admin)**:
- Two-column layout: Left = application details, Right = documents
- Labeled data fields: Label in gray, value in black, adequate spacing
- Bank details section: Highlighted box with verification badge
- Document thumbnails: Grid with click-to-expand
- Action buttons at bottom: Primary "Approve", Secondary "Request More Info", Tertiary "Reject"

## Images

**Hero Section**: 
- Large, high-quality image (16:9 aspect ratio)
- Shows diverse community members in supportive interaction
- Dignified representation - avoid imagery of distress
- Professional photography, warm lighting
- Applied: Dark overlay (bg-black/40) for text contrast

**About/How It Works Section**:
- Icon illustrations for process steps (Apply → Review → Verify → Receive)
- Optional: Small photos of real success stories (with consent, dignity maintained)

**Trust Indicators**:
- Bank/payment partner logos (Stripe, Plaid, TrueLayer)
- Security certification badges (SSL, data protection compliance)
- Rendered as small, subtle grayscale logos in footer or trust section

## Button Styles
- Primary: Solid background, white text, rounded-lg, px-6 py-3
- Secondary: Outlined, transparent background, border
- Ghost: Text only, no border
- All buttons: Clear hover states (darker shade), active states (scale-95)
- Buttons on images: Backdrop blur (backdrop-blur-sm), semi-transparent background

## Accessibility
- WCAG AA contrast ratios minimum
- Focus states: Blue ring (ring-2 ring-blue-500) on all interactive elements
- Screen reader labels for icon-only buttons
- Form fields: Always paired labels, never placeholder-only
- Error messages: Linked to fields via aria-describedby
- Skip navigation link for keyboard users

## Responsive Behavior
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Navigation: Collapses to hamburger menu below md
- Dashboard grids: 4 columns → 2 columns (md) → 1 column (mobile)
- Form layout: Always single column, padding reduces on mobile (p-4 instead of p-8)
- Tables: Horizontal scroll on mobile with sticky first column

## Animations
Use sparingly for feedback only:
- Page transitions: None (performance)
- Form submission: Spinner/loading state
- Success actions: Subtle checkmark animation (scale + fade in)
- Status changes: Badge color transition (300ms ease)
- Hover states: 150ms ease transitions for colors/shadows
- No auto-playing animations, no decorative motion