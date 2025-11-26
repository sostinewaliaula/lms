# Remaining Pages to Migrate

## Status: 17 admin pages + 2 other pages remaining

### Admin Pages (17):
1. ✅ admin/page.tsx → AdminDashboard.tsx (DONE)
2. ⏳ admin/users/page.tsx → UsersPage.tsx
3. ⏳ admin/departments/page.tsx → DepartmentsPage.tsx
4. ⏳ admin/categories/page.tsx → CategoriesPage.tsx
5. ⏳ admin/tags/page.tsx → TagsPage.tsx
6. ⏳ admin/courses/page.tsx → CoursesPage.tsx
7. ⏳ admin/courses/create/page.tsx → CreateCoursePage.tsx
8. ⏳ admin/courses/[id]/edit/page.tsx → EditCoursePage.tsx
9. ⏳ admin/learning-paths/page.tsx → LearningPathsPage.tsx
10. ⏳ admin/skills/page.tsx → SkillsPage.tsx
11. ⏳ admin/badges-achievements/page.tsx → BadgesAchievementsPage.tsx
12. ⏳ admin/reviews/page.tsx → ReviewsPage.tsx
13. ⏳ admin/study-groups/page.tsx → StudyGroupsPage.tsx
14. ⏳ admin/leaderboard/page.tsx → LeaderboardPage.tsx
15. ⏳ admin/notifications/page.tsx → NotificationsPage.tsx
16. ⏳ admin/analytics/page.tsx → AnalyticsPage.tsx
17. ⏳ admin/settings/page.tsx → SettingsPage.tsx

### Other Pages (2):
1. ⏳ courses/page.tsx → CoursesPage.tsx
2. ⏳ forums/page.tsx → ForumsPage.tsx

## Migration Pattern

For each file, apply these changes:

1. **Remove `'use client'` directive**

2. **Update imports:**
   ```tsx
   // OLD
   import Link from 'next/link';
   import { useRouter } from 'next/navigation';
   import { usePathname } from 'next/navigation';
   
   // NEW
   import { Link, useNavigate, useLocation } from 'react-router-dom';
   ```

3. **Update hooks:**
   ```tsx
   // OLD
   const router = useRouter();
   const pathname = usePathname();
   
   // NEW
   const navigate = useNavigate();
   const location = useLocation();
   const pathname = location.pathname;
   ```

4. **Update navigation:**
   ```tsx
   // OLD
   router.push('/path');
   router.replace('/path');
   
   // NEW
   navigate('/path');
   navigate('/path', { replace: true });
   ```

5. **Update Link components:**
   ```tsx
   // OLD
   <Link href="/path">Text</Link>
   
   // NEW
   <Link to="/path">Text</Link>
   ```

6. **For dynamic routes:**
   ```tsx
   // OLD (Next.js)
   import { useParams } from 'next/navigation';
   const { id } = useParams();
   
   // NEW (React Router)
   import { useParams } from 'react-router-dom';
   const { id } = useParams();
   ```

7. **Move file:**
   - From: `app/(dashboard)/dashboard/admin/users/page.tsx`
   - To: `src/pages/dashboard/admin/UsersPage.tsx`

## Quick Migration Command (PowerShell)

For each page, you can use find/replace:
- Find: `'use client';` → Replace: (empty)
- Find: `import Link from 'next/link';` → Replace: `import { Link } from 'react-router-dom';`
- Find: `import { useRouter } from 'next/navigation';` → Replace: `import { useNavigate } from 'react-router-dom';`
- Find: `const router = useRouter();` → Replace: `const navigate = useNavigate();`
- Find: `router.push(` → Replace: `navigate(`
- Find: `router.replace(` → Replace: `navigate(`
- Find: `href={` → Replace: `to={`
- Find: `href="/` → Replace: `to="/`


