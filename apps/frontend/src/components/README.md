# Component Library

## Atomic Design Structure

### Atoms
Basic building blocks of the UI. They cannot be broken down further without losing their functionality.

**Location:** `src/components/atoms/`

**Components:**
- `Button` - Interactive button with variants (default, destructive, outline, etc.)
- `Input` - Form input with validation and error states
- `Card` - Container component with header, content, footer
- `Typography` - Text components (Heading, Paragraph, Label)
- `Icon` - Icon wrapper with consistent sizing
- `Avatar` - User avatar with fallback
- `Badge` - Status indicator
- `Spinner` - Loading indicator

### Molecules
Groups of atoms bonded together to form a functional unit.

**Location:** `src/components/molecules/`

**Components:**
- `AuthForm` - Authentication form wrapper
- `DocumentCard` - Document preview card
- `SignaturePad` - Canvas-based signature component
- `DocumentViewer` - PDF/document viewer
- `SearchBar` - Search input with filters
- `StatusBadge` - Document status indicator
- `UserMenu` - User dropdown menu
- `Notification` - Toast notification

### Organisms
Complex UI components composed of molecules and/or atoms.

**Location:** `src/components/organisms/`

**Components:**
- `MainLayout` - Main application layout with sidebar
- `DocumentList` - Paginated document list with filters
- `SigningWorkflow` - Complete signing process
- `DocumentUpload` - File upload with preview
- `DashboardStats` - Dashboard statistics cards
- `SettingsPanel` - User settings interface

### Templates
Page-level components that define the overall layout.

**Location:** `src/components/templates/`

**Components:**
- `AuthTemplate` - Authentication page layout
- `DashboardTemplate` - Dashboard page layout
- `DocumentTemplate` - Document management layout
- `SigningTemplate` - Signing workflow layout

## Component Guidelines

### 1. Props Interface
- Use TypeScript interfaces for props
- Include JSDoc comments for complex props
- Provide default values where appropriate

### 2. Accessibility
- Include ARIA attributes
- Support keyboard navigation
- Ensure proper color contrast
- Add focus management

### 3. Styling
- Use Tailwind CSS utility classes
- Support custom className prop
- Follow design system tokens
- Responsive by default

### 4. State Management
- Keep components as stateless as possible
- Use custom hooks for complex logic
- Lift state up when needed

### 5. Testing
- Export component for testing
- Include data-testid attributes
- Support controlled/uncontrolled patterns

## Usage Examples

### Creating a new component
```typescript
// src/components/atoms/NewComponent.tsx
import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

export interface NewComponentProps {
  className?: string
  // Add other props
}

const NewComponent = forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('base-styles', className)}
        {...props}
      />
    )
  }
)

NewComponent.displayName = 'NewComponent'

export { NewComponent }
```

### Using components
```typescript
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'

export function MyComponent() {
  return (
    <Card>
      <Button variant="default" size="lg">
        Click me
      </Button>
    </Card>
  )
}
```

## Development Workflow

1. **Design Review** - Check with design system
2. **Component Creation** - Create in appropriate folder
3. **Props Definition** - Define TypeScript interface
4. **Implementation** - Write component logic
5. **Styling** - Apply Tailwind classes
6. **Accessibility** - Add ARIA attributes
7. **Testing** - Add test cases
8. **Documentation** - Update README

## Dependencies

- `clsx` - Conditional className utility
- `tailwind-merge` - Merge Tailwind classes
- `lucide-react` - Icon library
- `react-pdf` - PDF viewer
- `react-signature-canvas` - Signature pad
