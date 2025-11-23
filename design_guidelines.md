# Booking Management System - Design Guidelines

## Design Approach
**Selected Approach:** Design System - Material Design influenced
**Justification:** Data-dense dashboard application requiring consistent patterns for tables, forms, and role-based interfaces. Prioritizes usability, scanability, and efficient information display over visual experimentation.

## Typography Hierarchy

**Font Family:** 
- Primary: 'Inter' or 'Roboto' (Google Fonts)
- Monospace: 'JetBrains Mono' for booking IDs, amounts

**Type Scale:**
- Dashboard Headers: text-2xl font-semibold
- Card Titles: text-lg font-medium
- Section Labels: text-sm font-medium uppercase tracking-wide
- Body Text: text-base font-normal
- Table Headers: text-sm font-semibold
- Table Data: text-sm font-normal
- Captions/Metadata: text-xs

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6
- Card spacing: gap-6
- Section margins: mb-8
- Form field spacing: space-y-4
- Table cell padding: px-4 py-3

**Container Structure:**
- Max-width wrapper: max-w-7xl mx-auto
- Dashboard padding: px-4 lg:px-8
- Sidebar width: w-64 fixed
- Main content: ml-64 (when sidebar present)

## Component Library

### Navigation
**Top Navbar:**
- Fixed height: h-16
- Flex layout with space-between
- Logo/Title on left
- User profile dropdown on right
- Shadow: shadow-sm for subtle elevation

**Sidebar (Partner/Saathi):**
- Fixed position, full height
- Navigation links with icon + text
- Active state indicator (border-l-4 accent)
- Hover state background change
- Storage unit dropdown at top (for Partner/Saathi)

### Dashboard Cards
**Summary Cards (3-column grid):**
- Grid: grid-cols-1 md:grid-cols-3 gap-6
- Card padding: p-6
- Rounded corners: rounded-lg
- Border: border
- Metric display: Large number (text-3xl font-bold), label below (text-sm)

**Data Tables:**
- Full-width responsive container
- Rounded border wrapper: rounded-lg border
- Header row: font-semibold with slight background differentiation
- Row hover states for interactivity
- Alternating row backgrounds for scanability
- Column alignment: Left for text, right for numbers
- Sticky header on scroll: sticky top-0

**Status Badges:**
- Inline-block with rounded-full
- Padding: px-3 py-1
- Text: text-xs font-medium
- Different semantic states (confirmed, pending, completed, cancelled)

### Forms (Create Booking)
**Form Container:**
- Max-width: max-w-2xl
- Card wrapper with padding: p-8
- Form fields in vertical stack: space-y-6

**Input Fields:**
- Label above input: text-sm font-medium mb-2
- Input height: h-11
- Padding: px-4
- Rounded: rounded-lg
- Border: border with focus ring
- Full width: w-full

**File Upload Areas:**
- Dashed border box: border-2 border-dashed
- Padding: p-6
- Text-center layout
- Upload icon + instruction text
- Preview thumbnails below (grid-cols-4 gap-2)

**Dropdown Selects:**
- Same styling as text inputs
- Chevron icon indicator on right

**Submit Button:**
- Full width or right-aligned
- Height: h-11
- Padding: px-8
- Rounded: rounded-lg
- Font: font-medium

### Login Page
**Centered Layout:**
- Full viewport height: min-h-screen flex items-center justify-center
- Card container: max-w-md w-full
- Logo/Title at top: text-center mb-8
- Phone input with clear label
- Submit button below
- Role detection message area

### Loading & Error States
**Loading Spinners:**
- Center-aligned: flex justify-center
- Spinner size: w-8 h-8
- Use border animation pattern

**Error Messages:**
- Border-l-4 accent
- Padding: p-4
- Rounded: rounded-r
- Icon + message layout

## Interactions & Animations
**Minimal Motion:**
- Button hover: slight background change only
- No elaborate transitions
- Focus states: ring-2 for keyboard navigation
- Table row hover: subtle background change
- Dropdown animations: simple fade-in

## Responsive Behavior
**Breakpoints:**
- Mobile: Base (320px+)
- Tablet: md (768px+)
- Desktop: lg (1024px+)

**Mobile Adaptations:**
- Hide sidebar, show hamburger menu
- Stack summary cards vertically
- Horizontal scroll for tables
- Full-width forms
- Reduce padding: p-4 instead of p-8

## Component-Specific Guidelines

**Booking Details Display:**
- Two-column layout on desktop: grid-cols-2
- Label-value pairs with consistent spacing
- Timestamps in readable format
- Location data with map icon
- Luggage images in scrollable row

**Storage Unit Dropdown (Partner/Saathi):**
- Prominent placement in sidebar top
- Clear selected state
- Updates dashboard on selection
- Loading indicator during fetch

**User Profile Section:**
- Avatar: w-10 h-10 rounded-full
- Name + role display
- Dropdown menu on click
- Logout option clearly visible

This design prioritizes data clarity, efficient workflows, and role-appropriate information architecture over decorative elements.