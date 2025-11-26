# Migration Guide: Next.js to Vite + React

This guide explains how to complete the migration from Next.js to Vite + React.

## What's Been Done

1. ✅ Created Vite configuration (`vite.config.ts`)
2. ✅ Created entry points (`index.html`, `src/main.tsx`)
3. ✅ Set up React Router in `src/App.tsx`
4. ✅ Updated `package.json` with Vite dependencies
5. ✅ Updated TypeScript configuration
6. ✅ Migrated CSS to `src/index.css`
7. ✅ Created `DashboardLayout` component

## What Needs to Be Done

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Migrate Components

All components from `components/` need to be moved to `src/components/` and updated:

**Changes needed:**
- Remove `'use client'` directives (not needed in Vite)
- Replace `next/link` with `react-router-dom`'s `Link`
- Replace `next/navigation` hooks:
  - `useRouter()` → `useNavigate()` from `react-router-dom`
  - `usePathname()` → `useLocation()` from `react-router-dom`
- Update imports from `@/` to `@/` (should still work with path alias)

### 3. Migrate Pages

All pages from `app/` need to be moved to `src/pages/`:

**File structure mapping:**
- `app/page.tsx` → `src/pages/HomePage.tsx`
- `app/(auth)/login/page.tsx` → `src/pages/LoginPage.tsx`
- `app/(dashboard)/dashboard/page.tsx` → `src/pages/dashboard/AdminDashboard.tsx`
- `app/(dashboard)/dashboard/admin/*/page.tsx` → `src/pages/dashboard/admin/*Page.tsx`

**Changes needed in each page:**
- Remove `'use client'` directive
- Replace `useRouter()` with `useNavigate()`
- Replace `router.push()` with `navigate()`
- Replace `Link` from `next/link` with `Link` from `react-router-dom`
- Update all imports

### 4. Migrate API and Lib Files

Move `lib/` to `src/lib/` - no changes needed, just move the folder.

### 5. Update Environment Variables

Create `.env` file (Vite uses `VITE_` prefix instead of `NEXT_PUBLIC_`):

```env
VITE_API_URL=http://localhost:5000/api
```

Update `src/lib/api/client.ts` to use `import.meta.env.VITE_API_URL` instead of `process.env.NEXT_PUBLIC_API_URL`.

### 6. Update Sidebar Component

The Sidebar component needs to use React Router's `Link` and `useLocation`:

```tsx
import { Link, useLocation } from 'react-router-dom';

// Replace usePathname() with useLocation()
const location = useLocation();
const pathname = location.pathname;
```

### 7. Move Public Assets

Ensure `public/` folder exists and contains all assets. Vite serves from `public/` automatically.

## Quick Migration Script

You can use this pattern for each page:

1. Copy file from `app/` to `src/pages/`
2. Remove `'use client'`
3. Replace imports:
   - `import Link from 'next/link'` → `import { Link } from 'react-router-dom'`
   - `import { useRouter } from 'next/navigation'` → `import { useNavigate } from 'react-router-dom'`
4. Replace `useRouter()` with `useNavigate()`
5. Replace `router.push()` with `navigate()`
6. Update component name to match filename (PascalCase)

## Testing

After migration:
1. Run `npm run dev` - should start Vite dev server
2. Test all routes
3. Test authentication flow
4. Test all admin pages

## Notes

- Vite is much faster in development mode
- No need for `next build` - use `npm run build` (Vite)
- Production build output goes to `dist/` instead of `.next/`
- All routing is client-side (SPA) - no SSR/SSG features


