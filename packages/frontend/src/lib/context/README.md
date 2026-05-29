# State Management Architecture

## Overview
This directory contains React Context providers and state management utilities for the Digital Signature App.

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   Components                     │
├─────────────────────────────────────────────────┤
│  useAuth()  │  useDocuments()  │  useSigning()  │
├─────────────────────────────────────────────────┤
│          React Context Providers                │
├─────────────────────────────────────────────────┤
│   AuthContext   │   QueryClient   │   Zustand   │
├─────────────────────────────────────────────────┤
│              API Layer (Axios)                  │
└─────────────────────────────────────────────────┘
```

## Context Providers

### AuthContext (`AuthContext.tsx`)
Manages authentication state and user session.

**State:**
- `user: User | null` - Current user data
- `session: AuthSession | null` - Authentication session
- `isLoading: boolean` - Loading state
- `isAuthenticated: boolean` - Authentication status

**Methods:**
- `login(email, password)` - User login
- `logout()` - User logout
- `register(email, password, name)` - User registration

**Usage:**
```typescript
import { useAuth } from '@/lib/context/AuthContext'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginForm onSubmit={login} />
  }
  
  return <Dashboard user={user} onLogout={logout} />
}
```

### QueryClient (`providers.tsx`)
TanStack Query client for server state management.

**Features:**
- Automatic caching
- Background refetching
- Pagination support
- Optimistic updates
- Error handling

**Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
})
```

## Custom Hooks

### `useAuth()` (`useAuth.ts`)
Authentication hook built on top of AuthContext.

### `useDocuments()` (`useDocuments.ts`)
Document management hook with API integration.

**Features:**
- Document listing with pagination
- Document upload
- Document details fetching
- Error handling

**Usage:**
```typescript
import { useDocuments } from '@/hooks/useDocuments'

function DocumentsPage() {
  const { documents, isLoading, fetchDocuments, uploadDocument } = useDocuments()
  
  useEffect(() => {
    fetchDocuments({ page: 1, pageSize: 10 })
  }, [])
  
  return (
    <DocumentList 
      documents={documents}
      onUpload={uploadDocument}
      loading={isLoading}
    />
  )
}
```

### `useSigning()` (`useSigning.ts`)
Signing workflow hook.

**Features:**
- Signing session management
- Signature submission
- Signature verification
- Session expiration handling

## Data Flow

### Authentication Flow
```
1. User submits login form
2. useAuth().login() called
3. API request to /api/auth/login
4. Response stored in AuthContext
5. Session persisted to localStorage
6. Components re-render with authenticated state
```

### Document Management Flow
```
1. Component mounts
2. useDocuments().fetchDocuments() called
3. TanStack Query fetches from cache or API
4. Data stored in React Query cache
5. Component receives data via useDocuments()
6. UI updates with documents list
```

### Signing Flow
```
1. User opens document for signing
2. useSigning().createSigningSession() called
3. Signing session created on backend
4. Signature pad rendered with session context
5. User draws signature
6. useSigning().submitSignature() called
7. Signature saved to backend
8. Document status updated
```

## State Persistence

### Local Storage
- Authentication session tokens
- User preferences
- Form drafts

### React Query Cache
- API responses
- Paginated data
- Background updates

## Error Handling

### Authentication Errors
- Invalid credentials
- Expired tokens
- Network failures

### API Errors
- Validation errors
- Server errors
- Rate limiting

### User Interface Errors
- Form validation
- File upload errors
- Signature validation

## Testing Strategy

### Unit Tests
- Context providers
- Custom hooks
- Utility functions

### Integration Tests
- Authentication flow
- Document management
- Signing workflow

### E2E Tests
- User journey
- Cross-browser compatibility
- Performance testing

## Performance Considerations

### Code Splitting
- Lazy load routes
- Dynamic imports for heavy components
- Bundle optimization

### Caching Strategy
- React Query for server state
- Local storage for user data
- Memory cache for frequent operations

### Optimization
- Memoization with React.memo
- useCallback for event handlers
- useMemo for expensive computations
