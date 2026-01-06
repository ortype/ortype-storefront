# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 14+ headless commerce storefront for "Or Type" - a typography foundry and font marketplace. The site combines:

- **Frontend**: Next.js with App Router + React 18
- **CMS**: Sanity for content management with live preview
- **Commerce**: Commerce Layer for cart, checkout, and user authentication
- **Styling**: Chakra UI v3 + Emotion
- **Internationalization**: Support for English, German, Italian

## Tech Stack & Key Libraries

### Core Framework

- **Next.js 14.2+** with App Router (not Pages Router)
- **React 18.3** with concurrent features
- **TypeScript** with strict null checks enabled

### Content & Commerce

- **Sanity CMS** (`@sanity/client`, `next-sanity`) - Content management with live preview
- **Commerce Layer** (`@commercelayer/sdk`, `@commercelayer/react-components`) - Ecommerce platform
- **Apollo Client** (`@apollo/client`) - GraphQL client for custom API

### UI & Styling

- **Chakra UI v3** (`@chakra-ui/react`) - Component library with theme customization
- **Emotion** - CSS-in-JS styling (used by Chakra)
- **Framer Motion** - Animations and page transitions

### Testing & Development

- **Jest** + **React Testing Library** - Unit and integration testing
- **TypeScript** compilation with `tsc --noEmit`
- **ESLint** + **Prettier** - Code formatting and linting

## Local Setup & Common Commands

**Package Manager**: This project uses **pnpm** with the `pn` shortcut alias.

### Development Server

```bash
# Start development server with Sanity type generation
pn dev               # Runs on port 8000 (not 3000)

# Type generation only (auto-runs before dev/build)
pn typegen           # Generates Sanity types from schema
```

### Code Quality

```bash
# Format code
pn format            # Prettier formatting

# Linting
pn lint              # ESLint check
pn lint:fix          # Auto-fix lint + format issues

# Type checking
pn type-check        # TypeScript compilation check
```

### Testing

```bash
# Run all tests
pn test

# Run specific auth dialog tests
pn test:auth

# Watch mode and coverage
pn test:watch
pn test:coverage
```

### Build & Production

```bash
pn build             # Production build
pn start             # Start production server on port 8000
```

## App Router & Route Conventions

This project uses Next.js App Router with route groups:

```
src/app/
├── (frontend)/          # Route group for main site
│   └── [locale]/        # Internationalized routes (en, de, it)
│       ├── page.tsx     # Homepage
│       ├── [page]/      # Dynamic CMS pages
│       ├── fonts/[slug]/ # Font detail pages
│       ├── buy/[slug]/   # Font purchase pages
│       └── archive/[slug]/ # Blog posts
├── api/                 # API routes
├── studio/              # Sanity Studio (mounted at /studio)
├── layout.tsx           # Root layout
└── globals.css
```

### Key Routing Features

- **Internationalization**: Routes prefixed with locale (`/en/`, `/de/`, `/it/`)
- **Force Static**: Font and buy pages use `generateStaticParams()`
- **Dynamic**: Blog posts use `force-dynamic` for fresh content
- **Path Alias**: Use `@/*` for imports from `src/` directory

## Sanity CMS Integration

### Studio Access

- **Local Studio**: http://localhost:8000/studio
- **Content Types**: Fonts, font variants, books, posts, pages, authors, categories

### Type Generation

```bash
# Generate TypeScript types from Sanity schema
pn typegen
# This runs: sanity schema extract && sanity typegen generate
```

### Draft Mode & Live Preview

- Draft mode enabled at `/api/draft-mode/enable`
- Live preview available in Sanity Studio using `presentationTool`
- Uses `SanityLive` component for real-time updates

### Key Queries Location

- Queries defined in `src/sanity/lib/queries.ts`
- Uses `sanityFetch` for data fetching with live updates
- GROQ query language for content retrieval

## Commerce Layer Integration

### Authentication Flow

The authentication system has complex state management in `src/commercelayer/components/global/account.tsx`:

1. **Register Dialog → Login Dialog**: After successful registration, auto-transitions to login
2. **Manual Toggle**: 500ms delay between dialog transitions
3. **User State**: Managed by `IdentityProvider` context

### Key Components

- `src/commercelayer/providers/Identity/` - Authentication context
- `src/commercelayer/components/forms/LoginForm.tsx` - Login handling
- `src/commercelayer/components/forms/SignUpForm.tsx` - Registration + auto-login

### Environment Variables Required

```bash
# Commerce Layer
CL_CLIENT_ID=               # Sales channel client ID
CL_ENDPOINT=               # API endpoint
CL_SLUG=                   # Organization slug
CL_WEBAPP_CLIENT_ID=       # Web app credentials
CL_WEBAPP_CLIENT_SECRET=
CL_SYNC_CLIENT_ID=         # Sync credentials
CL_SYNC_CLIENT_SECRET=
```

## Authentication Dialog Architecture

Critical implementation details for the authentication system:

### State Management Flow

```typescript
// Auto-transition after registration (account.tsx lines 36-41)
useEffect(() => {
  if (registerOpen && customer.userMode) {
    setRegisterOpen(false)
    setLoginOpen(true)
  }
}, [registerOpen, customer.userMode])

// Manual toggling with 500ms delay
const handleRegisterClick = () => {
  setLoginOpen(false)
  setTimeout(() => {
    setRegisterOpen(true)
  }, 500)
}
```

### Testing Requirements

- Comprehensive test suite in `src/__tests__/auth-dialog.test.tsx`
- Manual testing guide in `MANUAL_TEST_GUIDE.md`
- Browser console verification script available

## Internationalization Strategy

### Configuration

- **Locales**: `en` (default), `de`, `it`
- **Middleware**: `src/middleware.ts` handles locale detection and routing
- **Translation Files**: `public/static/locales/{locale}/{namespace}.json`
- **Router**: Uses `next-i18n-router` for automatic locale routing

### Usage Pattern

```typescript
// Server components
const { t, resources } = await initTranslations(locale, ['common'])

// Client components
import TranslationsProvider from '@/components/data/TranslationsProvider'
```

## Styling System (Chakra UI v3)

### Theme Configuration

- Custom theme in `src/theme/` directory
- Uses Chakra UI v3 with Emotion as CSS-in-JS engine
- Design system built around typography (font foundry context)

### Component Pattern

```typescript
import { Box, Button, Stack } from '@chakra-ui/react'
// Custom UI components in src/components/ui/
```

## Testing Strategy

### Setup Requirements

```bash
# Install testing dependencies first
pn add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom @types/jest
```

### Test Configuration

- **Jest Config**: `jest.config.js` with Next.js integration
- **Setup File**: `jest.setup.js` with mocks for Next.js router, etc.
- **Coverage**: Configured to collect from `src/**/*` files

### Running Tests

```bash
pn test                    # All tests
pn test:auth               # Authentication dialog tests specifically
pn test:watch              # Watch mode
pn test:coverage           # With coverage report
```

## Development Workflow

### Code Quality Pipeline

```bash
# Full quality check sequence
pn format            # Prettier formatting
pn lint:fix          # ESLint auto-fix + format
pn type-check        # TypeScript validation
pn test              # Run test suite
```

### Build Configuration Notes

- **TypeScript**: `ignoreBuildErrors: true` for production builds
- **ESLint**: `ignoreDuringBuilds: true` for production builds
- **Experimental**: `taint: true` prevents leaking secrets to browser

## Environment Variables

### Development Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=

# Commerce Layer (see .env for current values)
NEXT_PUBLIC_CL_CLIENT_ID=
NEXT_PUBLIC_CL_ENDPOINT=
CL_WEBAPP_CLIENT_ID=
CL_WEBAPP_CLIENT_SECRET=

# GraphQL API
NEXT_PUBLIC_GRAPHQL_URI=
NEXT_PUBLIC_API_URL=

# NextAuth
NEXTAUTH_SECRET=
```

## Architecture Highlights

### Font-Focused Domain Model

- **Font Types**: Regular fonts, font variants, and font books
- **Licensing**: Different license types (desktop, web, app) with pricing modifiers
- **Typography Engine**: Uses Wakamai Fondue for font analysis

### Data Flow Architecture

```
Sanity CMS ←→ Next.js App Router ←→ Commerce Layer
    ↓              ↓                      ↓
Content      Static Generation        Cart/Auth
Pages        + Live Preview           + Checkout
```

### Key State Management

- **Sanity**: Server-side data fetching with `sanityFetch()`
- **Commerce Layer**: React Context providers for cart and identity
- **Apollo**: GraphQL client for custom API operations

## Contributing Guidelines

### File Naming Convention

- **New Files**: Use kebab-case naming (e.g., `auth-dialog.tsx`, not `AuthDialog.tsx`)
- **Update Imports**: When creating kebab-case files, update corresponding React component imports

### Path Conventions

- Use `@/*` path alias for imports from `src/` directory
- Organize by domain: `components/`, `commercelayer/`, `sanity/`, `lib/`, `utils/`

### Component Organization

```
src/components/
├── ui/              # Reusable UI components
├── global/          # Global layout components
├── pages/           # Page-specific components
└── data/            # Data provider components
```

## Development Notes

### Port Configuration

- **Frontend**: Runs on port 8000 (not default 3000)
- **API**: GraphQL API runs on port 3000 locally

### Critical Dependencies

- Node.js >=20 required
- Uses **pnpm** as package manager (with `pn` shortcut alias)
- Sanity type generation runs automatically before dev/build

### Testing Philosophy

- Authentication dialog system has extensive test coverage due to complex state transitions
- Manual testing guides provided for user flow validation
- Browser console verification scripts for quick debugging

## Debugging Tips

### Authentication Issues

- Check localStorage for `cl-identity-token`
- Monitor network requests for Commerce Layer API calls
- Use React DevTools to inspect IdentityProvider context

### Sanity Content Issues

- Check draft mode status at `/api/draft-mode/enable`
- Verify SANITY_API_READ_TOKEN permissions
- Use Vision plugin in Studio for GROQ query testing

### Build Issues

- Run `pn typegen` to regenerate Sanity types
- Check TypeScript compilation with `pn type-check`
- Verify environment variables are properly set
