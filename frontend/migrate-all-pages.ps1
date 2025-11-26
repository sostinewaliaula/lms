# PowerShell script to migrate all Next.js pages to Vite + React
# This script removes 'use client' and updates imports

$pages = @(
    @{src="app\(dashboard)\dashboard\admin\departments\page.tsx"; dst="src\pages\dashboard\admin\DepartmentsPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\categories\page.tsx"; dst="src\pages\dashboard\admin\CategoriesPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\tags\page.tsx"; dst="src\pages\dashboard\admin\TagsPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\courses\page.tsx"; dst="src\pages\dashboard\admin\CoursesPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\courses\create\page.tsx"; dst="src\pages\dashboard\admin\CreateCoursePage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\courses\[id]\edit\page.tsx"; dst="src\pages\dashboard\admin\EditCoursePage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\learning-paths\page.tsx"; dst="src\pages\dashboard\admin\LearningPathsPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\skills\page.tsx"; dst="src\pages\dashboard\admin\SkillsPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\badges-achievements\page.tsx"; dst="src\pages\dashboard\admin\BadgesAchievementsPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\reviews\page.tsx"; dst="src\pages\dashboard\admin\ReviewsPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\study-groups\page.tsx"; dst="src\pages\dashboard\admin\StudyGroupsPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\leaderboard\page.tsx"; dst="src\pages\dashboard\admin\LeaderboardPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\notifications\page.tsx"; dst="src\pages\dashboard\admin\NotificationsPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\analytics\page.tsx"; dst="src\pages\dashboard\admin\AnalyticsPage.tsx"},
    @{src="app\(dashboard)\dashboard\admin\settings\page.tsx"; dst="src\pages\dashboard\admin\SettingsPage.tsx"},
    @{src="app\(dashboard)\dashboard\courses\page.tsx"; dst="src\pages\dashboard\CoursesPage.tsx"},
    @{src="app\(dashboard)\dashboard\forums\page.tsx"; dst="src\pages\dashboard\ForumsPage.tsx"}
)

foreach ($page in $pages) {
    if (Test-Path $page.src) {
        $content = Get-Content $page.src -Raw
        
        # Remove 'use client'
        $content = $content -replace "^'use client';\s*\n", ""
        
        # Replace next/link imports
        $content = $content -replace "import Link from 'next/link';", "import { Link } from 'react-router-dom';"
        
        # Replace next/navigation imports
        $content = $content -replace "import \{ useRouter \} from 'next/navigation';", "import { useNavigate } from 'react-router-dom';"
        $content = $content -replace "import \{ usePathname \} from 'next/navigation';", "import { useLocation } from 'react-router-dom';"
        $content = $content -replace "import \{ useRouter, usePathname \} from 'next/navigation';", "import { useNavigate, useLocation } from 'react-router-dom';"
        
        # Replace useRouter hook
        $content = $content -replace "const router = useRouter\(\);", "const navigate = useNavigate();"
        
        # Replace usePathname hook
        $content = $content -replace "const pathname = usePathname\(\);", "const location = useLocation();`n  const pathname = location.pathname;"
        
        # Replace router.push/replace
        $content = $content -replace "router\.push\(", "navigate("
        $content = $content -replace "router\.replace\(", "navigate("
        
        # Replace href with to in Link components
        $content = $content -replace '<Link\s+href=', '<Link to='
        $content = $content -replace 'href="/', 'to="/'
        $content = $content -replace 'href={`', 'to={`'
        
        # Ensure directory exists
        $dir = Split-Path $page.dst -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Force -Path $dir | Out-Null
        }
        
        # Write migrated file
        Set-Content -Path $page.dst -Value $content -NoNewline
        Write-Host "Migrated: $($page.src) -> $($page.dst)"
    } else {
        Write-Host "Not found: $($page.src)"
    }
}

Write-Host "`nMigration complete!"


